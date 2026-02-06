const { F_Select, F_Insert } = require('../../../model/OrcModel');
const Joi = require('joi'),
    bcrypt = require('bcrypt'),
    dateFormat = require('dateformat');

const userRouter = require('express').Router()

userRouter.post('/my_agent', async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        var whrDAta = `a.ardb_id=b.ardb_id AND a.device_id='${value.device_id}' AND a.active_flag='Y'AND a.user_type='O'`,
            selectData = "a.user_id, b.ardb_name";
        let res_data = await F_Select(0, selectData, "md_user a, md_ardb b", whrDAta, null, 1);
        // console.log("===length===",res_data.msg.length)
        delete res_data.sql;
        if (res_data.msg.length > 0) {
            res.json({
                "success": res_data,
                "status": true
            });
        } else {
            res.json({
                "Error": "Please Asign Devices",
                "status": false
            });
        }
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

userRouter.post('/now_date', async (req, res) => {
    try {
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")
        res.json({
            "now_date": datetime,
            "status": true
        });
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

userRouter.post('/app_version', async (req, res) => {
    try {
        const schema = Joi.object({
            app_version: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }



        let res_dt = await F_Select(0, '*', "md_app_version", null, null, 0);
        // console.log("===res_dt===", res_dt.msg[0].app_version)


        let update_status = (res_dt.msg.app_version == value.app_version) ? 'N' : 'Y';

        res.json({
            "data": res_dt.msg,
            "status": true,
            "update_status": update_status
        });


    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

userRouter.post('/login', async (req, res) => {
    try {
        var ardb_acc_type = []
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var whr = `device_id='${value.device_id}'AND user_id='${value.user_id}' AND active_flag='Y' AND user_type='O'`;
        let res_dt = await F_Select(0, 'password', "md_user", whr, null, 0);

        // delete res_dt.sql;
        let db_pass = res_dt.msg.password
        if (await bcrypt.compare(value.password, db_pass)) {
            var table_name = "md_user a,md_ardb b,md_branch c,md_supervisor d",
                whrDAta = `a.ardb_id=b.ardb_id AND a.branch_code=c.branch_code AND b.ardb_id=c.ardb_id AND d.supervisor_code=a.user_id AND d.ardb_id=a.ardb_id AND d.branch_code=a.branch_code AND a.device_id='${value.device_id}'AND a.user_id='${value.user_id}' AND a.active_flag='Y'AND user_type='O'`,
                selectData = `d.allow_collection_days,a.id, a.ardb_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic,b.ardb_name,c.branch_name, d.supervisor_name,d.email_id,d.phone_no,CASE 
    WHEN b.sec_amt_type != 'M' THEN d.max_amt 
    ELSE d.allow_collection_days * d.max_amt 
END AS max_amt,b.sec_amt_type, d.print_opt`;

            let user_data = await F_Select(0, selectData, table_name, whrDAta, null, 1);

            if (user_data.suc > 0 && user_data.msg.length > 0) {
                var select = 'ardb_id, dds_flag, rd_flag, loan_flag',
                    table_name = 'md_ardb_acc_type',
                    whr = `ardb_id = '${user_data.msg[0].ardb_id}'`,
                    order = null;
                ardb_acc_type = await F_Select(0, select, table_name, whr, order, 1)
            } else {
                ardb_acc_type = []
            }

            // delete user_data.sql;

            let userallData = user_data.msg[0];
            var selectCollectionData = " NVL(SUM(tot_recov),0) AS total_collection"
            whrCollectionDAta = `ardb_id=${userallData.ardb_id} AND branch_code=${userallData.branch_code} AND supervisor_code='${value.user_id}' AND supervisor_trans_no is null
            AND  download_flag = 'N'`;

            let total_collection = await F_Select(0, selectCollectionData, "td_collection", whrCollectionDAta, null, 1);
            // delete total_collection.sql;
            let whrSeetingData = `device_id='${value.device_id}'`;
            let setting = await F_Select(0, "*", "td_settings", whrSeetingData, null, 1);
            delete setting.sql;

            let trans = await F_Select(0, `sl_no, supervisor_code, coll_flag, TO_CHAR(send_date, 'YYYY-MM-DD') trans_dt`, 'md_supervisor_trans', `ardb_id=${userallData.ardb_id} AND branch_code=${userallData.branch_code} AND supervisor_code='${value.user_id}' AND coll_flag = 'Y'`, null, 1)
            // console.log(trans);
            delete trans.sql

            let logo_dt = await F_Select(0, "file_path", "td_logo", `ardb_id='${userallData.ardb_id}'`, null, 1);
            delete logo_dt.sql            

            return res.send({
                "success": { user_data, total_collection, setting, ardb_acc_type: ardb_acc_type.suc > 0 ? ardb_acc_type.msg : [], trans, logo_path: logo_dt.suc > 0 && logo_dt.msg.length > 0 ? logo_dt.msg[0].file_path : '' },
                "status": true
            });
        } else {
            res.json({
                "Error": "Incorrect Password",
                "status": false
            });
        }
    } catch (err) {
        console.log(err)
        res.json({
            "error": err,
            "status": false,
            "position": "User Auth Mysql"
        });
    }
})

userRouter.post('/get_agent_printer_type', async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.optional(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var whr = `a.supervisor_code = b.user_id and a.ardb_id=b.ardb_id and a.branch_code=b.branch_code and b.device_id='${value.device_id}' AND a.active_flag='Y' AND b.user_type='O'`;
        let res_dt = await F_Select(0, 'a.supervisor_code, a.printer_type', "md_supervisor a, md_user b", whr, null, 1);
        delete res_dt.sql;
        if (res_dt.suc > 0 && res_dt.msg.length > 0) {
            res.json({
                "success": res_dt,
                "status": true
            });
        } else {
            res.json({
                "Error": "Please Asign Devices",
                "status": false
            });
        }
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

userRouter.post('/change_pin', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.required(),
            branch_code: Joi.required(),
            device_id: Joi.required(),
            user_id: Joi.required(),
            old_password: Joi.string().length(4).required(),
            password: Joi.string().length(4).required(),
            confirm_password: Joi.string().length(4).required().valid(Joi.ref('password'))
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {

                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }


        var whr = `ardb_id='${value.ardb_id}' AND branch_code='${value.branch_code}' AND device_id='${value.device_id}' AND user_id='${value.user_id}' AND active_flag='Y'AND user_type='O'`;
        let res_dt = await F_Select(0, 'password', "md_user", whr, null, 1);
        delete res_dt.sql;
        let db_pass = res_dt.msg[0].password

        if (await bcrypt.compare(value.old_password, db_pass)) {
            let pss = value.password
            let enc_pss = bcrypt.hashSync(pss, 10)
            var set = `password=:0`;
            var whr2 = `ardb_id=:1 AND branch_code=:2 AND device_id=:3 AND user_id=:4 AND active_flag=:5 AND user_type=:6`,
                val = [enc_pss, value.ardb_id, value.branch_code, value.device_id, value.user_id, 'Y', 'O'];
            let res_dt = await F_Insert(0, "md_user", set, null, val, whr2, 1);
            if (res_dt.suc > 0) {
                res.json({
                    "success": "password changed successfully",
                    "status": true
                });
            } else {
                res.json({
                    "success": "password not changed successfully, please try again later",
                    "status": false
                });
            }

        } else {
            res.json({
                "error": "Miss Match Password",
                "status": false
            });
        }

    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

module.exports = { userRouter }