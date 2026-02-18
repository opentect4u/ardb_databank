const brnRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat'),
bcrypt = require('bcrypt');
const { getBranchList, get_branch_name } = require('../../model/BranchModule');
const { F_Insert } = require('../../model/OrcModel');
const { getArdbDetails } = require('../../model/ArdbModule');

brnRouter.get('/', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        // console.log(user_data,'ju');
        

        const ardb_id = user_data.user_type != 'A' ? user_data.ardb_id : 0;

         let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
         req_data = req_data ? JSON.parse(req_data) : null;

         const selected = {
           ardb_id: ['A'].includes(user_data.user_type) ? (req_data ? req_data.ardb_id : ardb_id) : ardb_id,
          }

        // const ardbList = await getArdbDetails(selected.ardb_id);
        const ardbList = await getArdbDetails(user_data.user_type == 'A' ? 0 : user_data.ardb_id);
        
        
        const resData = await getBranchList(user_data.ardb_id, 'R');

        //  if (selected.ardb_id > 0) {
        //   resData1 = await get_branch_name(selected.ardb_id);
        //  }
        // const resData = await getBranchList(selected.ardb_id,user_data.user_type)
        delete resData.sql
        var viewData = {
            title: "Branch",
            page_path: "/branch/listbranch",
            ardb: ardbList,
            data: resData,
            selected: selected
        };
        // console.log(viewData,'by');
        
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
    console.log(user_data,'yyy');
    

    const resData = id > 0 ? await getBranchList(user_data.ardb_id, 'R', id) : { suc: 1, msg: [] };

     const ardbList = await getArdbDetails(user_data.ardb_id);

    delete resData.sql

    let pageTitle = req.params.id > 0
        ? "Edit Branch Details"
        : "Add Branch Details";

    var viewData = {
        title: pageTitle,
        ardb: ardbList,
        data: resData.msg
    };
    res.render('admin/branch/edit', viewData)
})

brnRouter.post('/edit', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.string(),
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
        // console.log(brValues,'values');
        
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
        // console.log(user_data,'yyyy');

        var brFields = value.branch_id > 0 ? `branch_name=:0, branch_address=:1, contact_person=:2, phone_no=:3, email_id=:4, modified_by=:5, updated_at=TO_DATE(:6, 'YYYY-MM-DD HH24:MI:SS')` : `ardb_id, branch_code, branch_name, branch_address, contact_person, phone_no, email_id, created_by, created_at, delete_flag, active_flag`,
            brFldIndex = value.branch_id > 0 ? null : `(:0, :1, :2, :3, :4, :5, :6, :7, TO_DATE(:8, 'YYYY-MM-DD HH24:MI:SS'), 'N', 'Y')`,
            brValues = value.branch_id > 0 ? [
                value.branchname, value.branch_address, value.contactperson, value.mobile, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss"), value.branch_id
            ] : [user_data.user_type == 'A' ? value.ardb_id : user_data.ardb_id, value.branch_c, value.branchname, value.branch_address, value.contactperson, value.mobile, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss")],
            brWhere = `branch_id=:7`,
            brFlag = value.branch_id > 0 ? 1 : 0;
        var res_dt = await F_Insert(0, "md_branch", brFields, brFldIndex, brValues, brWhere, brFlag);

        if(res_dt.suc > 0){
            if (brFlag == 0){
                let pss = '1234'
                let enc_pss = bcrypt.hashSync(pss, 10)

                let userFields = `ardb_id, branch_code, user_type, password, user_id, active_flag, created_by, created_at, delete_flag`,
                    userFldIndex = `(:0, :1, 'R', :2, :3, 'Y', :4, TO_DATE(:5, 'YYYY-MM-DD HH24:MI:SS'), 'N')`,
                    userValues = [user_data.user_type == 'A' ? value.ardb_id : user_data.ardb_id, value.branch_c, enc_pss, value.email, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss")];
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

         const ardb_id =
            req.query.ardb_id && req.query.ardb_id != 0
                ? req.query.ardb_id
                : user_data.ardb_id;

        const resData = await getBranchList(ardb_id, 'R');
        // const resData = await get_branch_name(ardb_id, 'R');
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

brnRouter.get('/get_brn_list', async (req, res) => {
    try {
         const ardb_id = req.query.ardb_id || 0;

        const resData = await get_branch_name(ardb_id);
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