const ardbRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat'),
bcrypt = require('bcrypt');
const { F_Insert, F_Select } = require('../../model/OrcModel');
const { getArdbDetails, getArdbDetails_flag, getArdbrDtls } = require('../../model/ArdbModule');
const { MAX_DATE_COL_ENTRY_FLAG } = require('../../model/CommonModel');

ardbRouter.get('/', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];

        let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
        req_data = req_data ? JSON.parse(req_data) : null;

        const selected = {
        flag: req_data ? req_data.flag : 'Y'
        };

        const resData = await getArdbDetails_flag(selected.flag);

        var viewData = {
            title: "ARDB",
            page_path: "/ardb/listardb",
            data: resData.suc > 0 ? resData.msg : [],
            selected: selected
        };
        // console.log(viewData,'gagagagag');
        
        res.render('admin/ardb/view', viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
});

ardbRouter.get('/edit', async (req, res) => {
    let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;
    
    let userData = req.user.user_data.msg[0];

    let ardb_id = req_data ? req_data.ardb_id : 0;
    let pageTitle = ardb_id > 0
        ? "Edit ARDB Details"
        : "Add ARDB Details";

    const resData = req_data.ardb_id > 0 ? await getArdbrDtls(req_data.ardb_id, 'Y') : { suc: 1, msg: [] };
    delete resData.sql;    

    var viewData = {
        max_dt_col_entry_flag: MAX_DATE_COL_ENTRY_FLAG,
        title: pageTitle,
        data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : {},
        ardb_id: ardb_id,
    };
    res.render("admin/ardb/edit", viewData);
});

ardbRouter.post('/edit', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.required(),
            ardb_name: Joi.string().required(),
            contact_person: Joi.string().required(),
            mobile: Joi.string().required(),
            email: Joi.string().required(),
            device_type: Joi.string(),
            data_transfer_type: Joi.string(),
            max_day_entry_flag: Joi.string().valid("D", "R").required(),
            receipt_type: Joi.string().valid("S", "P", "B").required(),
            sucurity_amt_type: Joi.string().valid("A", "M").required(),
            max_user: Joi.number().required(),
            // password: Joi.string().required(),
            // confirmPassword: Joi.string().required().valid(Joi.ref("password")),
            // start: Joi.string(),
            active_flag: Joi.string().valid("Y", "N").required(),
            after_maturity_coll: Joi.string().valid("Y", "N").required(),
            ardb_address: Joi.string().required()
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
        const user_data = req.user.user_data.msg[0];
        const currDt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        // ---- CHECK ARDB EXISTS ----
        // let chkSql = `COUNT(*) CNT FROM md_ardb WHERE ardb_id = :0`;
        // let chkData = await F_Select(0, chkSql, [value.ardb_id]);

        let chkData = await F_Select(0, "COUNT(*) CNT", "md_ardb", `ardb_id='${value.ardb_id}'`, null, 0)

        // let isExist = chkData.msg[0].CNT > 0 ? 1 : 0;
        let isExist = chkData.suc > 0 ? chkData.msg.cnt : 0;

        let supFields = isExist > 0 ? 
        `ardb_name=:0, ardb_address=:1, contact_person=:2, phone_no=:3, receipt_type=:4, sec_amt_type=:5, max_day_entry_flag=:6, max_user=:7, modified_by=:8, updated_at=TO_DATE(:9, 'YYYY-MM-DD HH24:MI:SS'),active_flag=:10, after_maturity_coll=:11` : 
        `ardb_id, ardb_name, ardb_address, contact_person, phone_no, email_id, device_type, data_trf, receipt_type, sec_amt_type, max_day_entry_flag, max_user, created_by, created_at, delete_flag, active_flag, after_maturity_coll`,
        supFldIndex = isExist > 0 ? null : `(:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, TO_DATE(:13, 'YYYY-MM-DD HH24:MI:SS'), :14, :15, :16)`,
        supValues = isExist > 0 ? 
        [
            value.ardb_name, value.ardb_address, value.contact_person, value.mobile, value.receipt_type, value.sucurity_amt_type, value.max_day_entry_flag, value.max_user, user_data.id, currDt, value.active_flag, value.after_maturity_coll,value.ardb_id ] : 
            [value.ardb_id, value.ardb_name, value.ardb_address, value.contact_person, value.mobile, value.email, value.device_type, value.data_transfer_type, value.receipt_type, value.sucurity_amt_type, value.max_day_entry_flag, value.max_user, user_data.id, currDt, 'N', value.active_flag, value.after_maturity_coll],
        supWhere = `ardb_id=:12`,
        supFlag = isExist > 0 ? 1 : 0;

        var res_dt = await F_Insert(0, "md_ardb", supFields, supFldIndex, supValues, supWhere, supFlag);

        if(res_dt.suc > 0){
            if (supFlag == 0){
                let pss = '1234'
                let enc_pss = bcrypt.hashSync(pss, 10)

                let userFields = `ardb_id, user_type, password, user_id, active_flag, created_by, created_at, delete_flag`,
                    userFldIndex = `(:0, 'B', :1, :2, 'Y', :3, TO_DATE(:4, 'YYYY-MM-DD HH24:MI:SS'), 'N')`,
                    userValues = [value.ardb_id, enc_pss, value.email, user_data.id, currDt];
                let res_dt2 = await F_Insert(0, "md_user", userFields, userFldIndex, userValues, null, 0);
                if(res_dt2.suc > 0){
                    req.flash('success', 'ARDB Added Successfully')
                }else{
                    req.flash('error', 'Error in ARDB Added')
                }
            }
        }else{
            req.flash('error', 'Error in ARDB Added')
        
        }
        res.redirect("/admin/ardb");
    } catch (error) {
        console.log(error);
        
        req.flash("error", "ARDB not updated successfully");
        res.redirect("/admin/ardb");
    }
});

ardbRouter.post('/get_ardb_ajax', async (req, res) => {
    let req_data = req.body.enc_dt ? Buffer.from(req.body.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    const resData = await getArdbrDtls(req_data.ardb_id, 'Y');
    res.send(resData)
})

module.exports = {ardbRouter}