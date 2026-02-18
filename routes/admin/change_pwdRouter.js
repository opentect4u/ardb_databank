const change_pwdRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat');
const bcrypt = require('bcrypt');
const { F_Insert, F_Select } = require('../../model/OrcModel');

change_pwdRouter.get('/', async (req, res) => {

  const viewData = {
    title: "Change Password",
  };
  // console.log(viewData);
  res.render("admin/change_pwd/change_pass", viewData);
});

change_pwdRouter.post('/password', async (req, res) => {
    try{
      const schema = Joi.object({
      old_pwd: Joi.required(),
      new_pwd: Joi.required(),
      confirm_pwd: Joi.required(),
      });
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        const errors = {};
        error.details.forEach((detail) => {
            errors[detail.context.key] = detail.message;
        });
        return res.json({ error: errors });
      }
      const user_data = req.user.user_data.msg[0];
      
      const currDt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

      let chkoldData = await F_Select(0, "id,password", "md_user", `id='${user_data.id}'`, null, 1)

      if(chkoldData.suc > 0 && chkoldData.msg.length > 0) {
         if (await bcrypt.compare(value.old_pwd, chkoldData.msg[0].password)) {
            var pass = bcrypt.hashSync(value.new_pwd, 10);

            let userFields = `password=:0, modified_by=:1, updated_at=TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS')`,
            userFldIndex = null,
            userValues = [pass, user_data.id, currDt],
            userWhr = `id= '${user_data.id}' AND user_id= '${user_data.user_id}'`,
            userFlag = 1;
            let res_dt2 = await F_Insert(0, "md_user", userFields, userFldIndex, userValues, userWhr, userFlag);
            if(res_dt2.suc > 0){
              req.flash('success', 'Password Changed Successfully');
              res.redirect('/admin/login/logout');
            }else{
              req.flash('error', 'Error in while change password');
              res.redirect('/admin/password');
            }
         }else {
              req.flash('error', 'Old password not matchedd');
              res.redirect('/admin/password');
         }
      } else {
            req.flash('error', 'User not found');
              res.redirect('/admin/password');
      }  
    }catch(error){
      console.log(error);
      req.flash("error", "Password updated successfully");
      res.redirect("/admin/password");
    }
})

module.exports = {change_pwdRouter}