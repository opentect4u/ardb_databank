const { F_Select } = require('../../../model/OrcModel');
const Joi = require('joi');

const acRouter = require('express').Router()

acRouter.post('/search_account', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.string().min(3).required(),
            flag: Joi.string().max(1).required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }
        const table_name = "td_account_dtls"
        var whrDAta = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND acc_type = '${value.flag}' AND (lower(cust_name) LIKE '%${value.account_number.toLowerCase()}%' OR product_id LIKE '%${value.account_number}%' OR cust_id LIKE '%${value.account_number}%')`,
            selectData = "account_dtls_id, ardb_id, branch_code, supervisor_code, acc_type, product_type_name, product_id, phone_no, cust_name, TO_CHAR(disb_dt, 'YYYY-MM-DD') disb_dt, (curr_prn + ovd_prn + curr_intt + ovd_intt + penal_intt + other_charges) current_balance, (curr_prn_demand + ovd_prn_demand + curr_intt_demand + ovd_intt_demand + penal_intt_demand) current_demand";
        const order = null
        let res_data = await F_Select(0, selectData, table_name, whrDAta, order, 1);

        delete res_data.sql;
        if (res_data.msg.length > 0) {
            for (let dt of res_data.msg) {
                dt['last_trns_dt'] = ''
                dt['last_depo_amt'] = 0
            }
            res.json({
                "success": res_data,
                "status": true
            });
        } else {
            res.json({
                "Error": "Search Account Not Found",
                "status": false
            });
        }
    } catch (error) {
        console.log(error);
        
        res.json({
            "error": error,
            "status": false
        });
    }
})

acRouter.post('/get_acc_prev_col', async (req,res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.string().min(3).required(),
            flag: Joi.string().max(1).required(),
            receipt_no: Joi.optional().default(0)
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }

        var res_data = await F_Select(0, `TO_CHAR(transaction_date, 'YYYY-MM-DD') last_trns_dt, tot_recov last_depo_amt`, 'td_collection', `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code = '${value.supervisor_code}' AND account_number = '${value.account_number}' AND account_type = '${value.flag}' ${value.receipt_no > 0 ? `AND receipt_no < ${value.receipt_no}` : ''}`, 'ORDER by transaction_date DESC FETCH FIRST 1 ROWS ONLY', 1)

        delete res_data.sql;
        if (res_data.msg.length > 0) {
            res.json({
                "success": res_data,
                "status": true
            });
        } else {
            res.json({
                "success": [{ last_trns_dt: '', last_depo_amt: 0 }],
                "status": true
            });
        }
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

acRouter.post('/account_info', async(req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.number().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors, status: false });
        }
        const table_name = "td_account_dtls"
        var whrDAta = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND product_id = '${value.account_number}'`,
            selectData = "account_dtls_id, batch_id, ardb_id, branch_code, supervisor_code, TO_CHAR(upload_dt, 'YYYY-MM-DD') upload_dt, acc_type, product_type_code, product_type_name, fund_type, product_id, block_id, block_name, service_area_id, service_area_name, vill_id, vill_name, cust_id, cust_name, guardian_name, address, phone_no, curr_intt_rate, ovd_intt_rate, penal_intt_rate, TO_CHAR(disb_dt, 'YYYY-MM-DD') disb_dt, disb_amt, installment_no, periodicity, TO_CHAR(first_due_date, 'YYYY-MM-DD') first_due_date, curr_prn, ovd_prn, curr_intt, ovd_intt, penal_intt, TO_CHAR(last_intt_calc_dt, 'YYYY-MM-DD') last_intt_calc_dt, other_charges, interest_calc_type, curr_prn_demand, ovd_prn_demand, curr_intt_demand, ovd_intt_demand, penal_intt_demand, uploaded_by, TO_CHAR(uploaded_at, 'YYYY-MM-DD') uploaded_at";
        const order = null
        let res_data = await F_Select(0, selectData, table_name, whrDAta, order, 1);

        delete res_data.sql;
        if (res_data.msg.length > 0) {
            res.json({
                "success": res_data,
                "status": true
            });
        } else {
            res.json({
                "Error": "Account Not Found",
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

module.exports = {acRouter}