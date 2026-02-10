const Joi = require('joi'),
dateFormat = require('dateformat'),
bcrypt = require('bcrypt');
const { getArdbDetails } = require('../../model/ArdbModule');
const { getBranchList } = require('../../model/BranchModule');
const { PRINTER_TYPE_MASTER, PRINTER_OPT_MASTER } = require('../../model/CommonModel');
const { getSupervisorDetails } = require('../../model/SupervisorModule');
const { F_Insert } = require('../../model/OrcModel');

const supervisorRouter = require('express').Router();

supervisorRouter.get('/', async (req, res) => {
    const user_data = req.user.user_data.msg[0];

    const ardb_id = user_data.user_type != 'A' ? user_data.ardb_id : 0,
        branch_code = user_data.user_type == 'R' ? user_data.branch_code : 0;

    //// FOR ENCRYPTED REQUEST DATA ////
    let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    console.log(req_data);
    

    const selected = {
        ardb_id: ['A'].includes(user_data.user_type) ? (req_data ? req_data.ardb_id : ardb_id) : ardb_id,
        branch_code: ['A', 'B'].includes(user_data.user_type) ? (req_data ? req_data.branch_code : branch_code) : branch_code,
        flag: req_data ? req_data.flag : 'Y'
    }
    
    const ardbList = await getArdbDetails(selected.ardb_id);
    const resDataBranch = await getBranchList(selected.ardb_id, user_data.user_type);
    const resData = await getSupervisorDetails(selected.ardb_id, selected.branch_code, selected.flag);
    // console.log(resData);
    
    var viewData = {
        title: "Agent",
        data: resData.suc > 0 ? resData.msg : [],
        resDataBranch: resDataBranch.suc > 0 ? resDataBranch.msg : [],
        ardb: ardbList,
        selected: selected,
    };
    res.render('admin/supervisor/view', viewData)
})

supervisorRouter.get('/edit', async (req, res) => {
    let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;
    
    let userData = req.user.user_data.msg[0];

    var ardbList = await getArdbDetails(userData.user_type != 'S' ? req_data.ardb_id : 0);

    const resData = req_data.id > 0 ? await getSupervisorDetails(req_data.ardb_id, req_data.branch_code, 'Y', req_data.id) : { suc: 1, msg: [] };
    delete resData.sql;
    var viewData = {
        title: "Agent",
        ardbList: ardbList.suc ? ardbList.msg : [],
        data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : {},
        agent_id: req_data.id,
        req_data: req_data,
        printer_type: PRINTER_TYPE_MASTER,
        print_opt: PRINTER_OPT_MASTER
    };
    // console.log(viewData);
    res.render("admin/supervisor/edit", viewData);
})

supervisorRouter.post('/edit', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.required(),
            branch_c: Joi.required(),
            user_id: Joi.required(),
            supervisor_name: Joi.string().required(),
            email: Joi.string().required(),
            mobile: Joi.string().required(),
            max_amt: Joi.number().required(),
            allow_collection_days: Joi.number().required(),
            device_id: Joi.required(),
            agent_active: Joi.string().default('Y'),
            agent_id: Joi.required(),
            printer_type: Joi.string().required(),
            print_opt: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        // console.log(value);
        if (error) {
            const errors = {};
            error.details.forEach((detail) => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        // return res.send(value);

        const user_data = req.user.user_data.msg[0];
        const currDt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        let supFields = value.agent_id > 0 ? `supervisor_name=:0,phone_no=:1,email_id=:2,max_amt=:3, allow_collection_days=:4, account_no=:5, printer_type=:6, print_opt=:7, modified_by=:8, updated_at=TO_DATE(:9, 'YYYY-MM-DD HH24:MI:SS'), delete_flag=:10, active_flag=:11` : `ardb_id, branch_code, supervisor_code, supervisor_name, phone_no, email_id, max_amt, allow_collection_days, account_no, printer_type, print_opt, created_by, created_at, delete_flag, active_flag`,
        supFldIndex = value.agent_id > 0 ? null : `(:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, TO_DATE(:12, 'YYYY-MM-DD HH24:MI:SS'), 'N', :13)`,
        supValues = value.agent_id > 0 ? [
            value.supervisor_name, value.mobile, value.email, value.max_amt, value.allow_collection_days, value.account_no ? value.account_no : null, value.printer_type, value.print_opt, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss"), 'N', value.agent_active, value.agent_id
        ] : [user_data.ardb_id, value.branch_c, value.user_id, value.supervisor_name, value.mobile, value.email, value.max_amt, value.allow_collection_days, value.account_no ? value.account_no : null, value.printer_type, value.print_opt, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss"), value.agent_active],
        supWhere = `supervisor_id=:12`,
        supFlag = value.agent_id > 0 ? 1 : 0;

        var res_dt = await F_Insert(0, "md_supervisor", supFields, supFldIndex, supValues, supWhere, supFlag);

        if(res_dt.suc > 0){
            if (supFlag == 0){
                let pss = '1234'
                let enc_pss = bcrypt.hashSync(pss, 10)
                let userFields = `ardb_id, branch_code, user_type, password, device_id, user_id, active_flag, created_by, created_at, delete_flag`,
                    userFldIndex = `(:0, :1, 'O', :2, :3, :4, 'Y', :5, TO_DATE(:6, 'YYYY-MM-DD HH24:MI:SS'), 'N')`,
                    userValues = [user_data.ardb_id, value.branch_c, enc_pss, value.device_id, value.user_id, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss")];
                let res_dt2 = await F_Insert(0, "md_user", userFields, userFldIndex, userValues, null, 0);
                if(res_dt2.suc > 0){
                    req.flash('success', 'Agent Added Successfully')
                }else{
                    req.flash('error', 'Error in Agent Added')
                }
            }else{
                let userFields = `device_id=:0, active_flag=:1, modified_by=:2, updated_at=TO_DATE(:3, 'YYYY-MM-DD HH24:MI:SS'), delete_flag=:4`,
                    userFldIndex = null,
                    userValues = [value.device_id, value.agent_active, user_data.id, dateFormat(currDt, "yyyy-mm-dd HH:MM:ss"), 'N', value.ardb_id, value.branch_c, value.user_id],
                    userWhr = `ardb_id=:5 AND branch_code=:6 AND user_id=:7 AND user_type='O'`,
                    userFlag = 1;
                
                let res_dt2 = await F_Insert(0, "md_user", userFields, userFldIndex, userValues, userWhr, userFlag);
                if (res_dt2.suc > 0) {
                    req.flash('success', 'Agent Added Successfully')
                } else {
                    req.flash('error', 'Error in Agent Added')
                }
            }
        }else{
            req.flash('error', 'Error in Agent Added')
        
        }
        res.redirect("/admin/supervisor");
    } catch (error) {
        console.log(error);
        
        req.flash("error", "Agent not updated successfully");
        res.redirect("/admin/supervisor");
    }
})

supervisorRouter.post('/get_sup_ajax', async (req, res) => {
    let req_data = req.body.enc_dt ? Buffer.from(req.body.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    const resData = await getSupervisorDetails(req_data.ardb_id, req_data.branch_code, 'Y', req_data.id);
    res.send(resData)
})

module.exports = {supervisorRouter};