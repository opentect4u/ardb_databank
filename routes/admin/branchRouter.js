const brnRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat'),
bcrypt = require('bcrypt');
const { getBranchList } = require('../../model/BranchModule');
const { F_Insert } = require('../../model/OrcModel');

brnRouter.get('/', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        const resData = await getBranchList(user_data.ardb_id, 'R');
        delete resData.sql
        var viewData = {
            title: "Branch",
            page_path: "/branch/listbranch",
            data: resData
        };
        res.render('admin/branch/view', viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

brnRouter.get('/edit/:id', async (req, res) => {
    const id = req.params.id || 0;
    const user_data = req.user.user_data.msg[0];

    const resData = id > 0 ? await getBranchList(user_data.ardb_id, 'R', id) : { suc: 1, msg: [] };

    delete resData.sql
    var viewData = {
        title: "Edit Branch",
        data: resData.msg
    };
    res.render('admin/branch/edit', viewData)
})

brnRouter.post('/edit', async (req, res) => {
    try {
        const schema = Joi.object({
            branch_c: Joi.required(),
            branchname: Joi.string().required(),
            contactperson: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            branch_address: Joi.required(),
            branch_id: Joi.required(),
            user_id: Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        // let pss = value.password
        // let enc_pss = bcrypt.hashSync(pss, 10)
        const user_data = req.user.user_data.msg[0],
        currDt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        var brFields = value.branch_id > 0 ? `branch_name=:0, branch_address=:1, contact_person=:2, phone_no=:3, email_id=:4, modified_by=:5, updated_at=TO_DATE(:6, 'YYYY-MM-DD HH24:MI:SS')` : `ardb_id, branch_code, branch_name, branch_address, contact_person, phone_no, email_id, created_by, created_at, delete_flag, active_flag`,
            brFldIndex = value.branch_id > 0 ? null : `(:0, :1, :2, :3, :4, :5, :6, :7, TO_DATE(:8, 'YYYY-MM-DD HH24:MI:SS'), 'N', 'Y')`,
            brValues = value.branch_id > 0 ? [
                value.branchname, value.branch_address, value.contactperson, value.mobile, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss"), value.branch_id
            ] : [user_data.ardb_id, value.branch_c, value.branchname, value.branch_address, value.contactperson, value.mobile, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss")],
            brWhere = `branch_id=:7`,
            brFlag = value.branch_id > 0 ? 1 : 0;
        var res_dt = await F_Insert(0, "md_branch", brFields, brFldIndex, brValues, brWhere, brFlag);

        if(res_dt.suc > 0){
            if (brFlag == 0){
                let pss = '1234'
                let enc_pss = bcrypt.hashSync(pss, 10)

                let userFields = `ardb_id, branch_code, user_type, password, user_id, active_flag, created_by, created_at, delete_flag`,
                    userFldIndex = `(:0, :1, 'B', :2, :3, 'Y', :4, TO_DATE(:5, 'YYYY-MM-DD HH24:MI:SS'), 'N')`,
                    userValues = [user_data.ardb_id, value.branch_c, enc_pss, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss")];
                let res_dt2 = await F_Insert(0, "md_user", userFields, userFldIndex, userValues, null, 0);
                
                if (res_dt2.suc > 0){
                    req.flash('success', 'Branch Added Successfully')
                }else{
                    req.flash('error', 'Error in Branch Added')
                }
            }else{
                req.flash('success', 'Branch Updated Successfully')
            }
        }else{
            req.flash('error', 'Error in Branch Added')
        }
        res.redirect('/admin/branch')
    } catch (error) {
        console.log(error);
        
        res.json({
            "error": error,
            "status": false
        });
    }
})

brnRouter.get('/get_brn_list_ajax', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        const resData = await getBranchList(user_data.ardb_id, 'R');
        // console.log("======///////////=======",resData)
        delete resData.sql
        res.send(resData);
    } catch (error) {
        res.json({
            suc: 0,
            "error": error
        });
    }
})

module.exports = {brnRouter}