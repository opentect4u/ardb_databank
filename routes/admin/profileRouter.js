const profileRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat');
const { F_Insert, F_Select } = require('../../model/OrcModel');

const getDtls = (ardb_id, user_type, branch_code, flag = 'Y') => {
    return new Promise(async (resolve, reject) => {
        try{
            if(user_type == 'B'){
            let select = 'a.id,a.user_id,b.ardb_id,b.ardb_name,b.ardb_address,b.contact_person ardb_contact,b.phone_no ardb_phone,b.email_id ardb_email,b.device_type,b.data_trf,b.receipt_type,b.sec_amt_type,b.max_day_entry_flag,b.max_user,b.active_flag,b.after_maturity_coll',
            table_name = 'md_user a, md_ardb b',
                whr = `a.ardb_id = b.ardb_id AND b.active_flag = '${flag}' AND a.ardb_id='${ardb_id}'`;
            var resData = await F_Select(0, select, table_name, whr, null, 1)
            }else {
               let select = 'a.id,a.user_id,c.branch_code,c.branch_name,c.branch_address,c.contact_person branch_contact,c.phone_no branch_phone,c.email_id branch_email,b.ardb_id,b.ardb_name,b.ardb_address,b.contact_person ardb_contact,b.phone_no ardb_phone,b.email_id ardb_email',
            table_name = 'md_user a,md_ardb b,md_branch c',
                whr = `a.ardb_id=b.ardb_id AND a.branch_code=c.branch_code AND b.ardb_id=c.ardb_id AND a.active_flag='Y' AND a.branch_code = '${branch_code}'  AND a.ardb_id='${ardb_id}'`;
            var resData = await F_Select(0, select, table_name, whr, null, 1)
            }
            resolve(resData);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

profileRouter.get('/', async (req, res) => {
  let user_data = req.user.user_data.msg[0];

  const resData = await getDtls(user_data.ardb_id, user_data.user_type, user_data.branch_code, 'Y');
  // console.log(user_data.ardb_id, user_data.user_type, user_data.branch_code,'loiu');
  
    delete resData.sql;
    const viewData = {
    title: "My Profile",
    data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : {},
  };
  // console.log(viewData,'fff');
  
  res.render("admin/profile/add_profile", viewData)
})

module.exports = {profileRouter}