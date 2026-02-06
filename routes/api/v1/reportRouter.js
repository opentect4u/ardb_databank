const reportRouter = require('express').Router()
const { F_Select } = require('../../../model/OrcModel');
const Joi = require('joi'),
    dateFormat = require('dateformat');

reportRouter.post('/day_scroll_report', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') transaction_date,account_type,account_number,account_holder_name,tot_recov as deposit_amount, product_code",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN TO_DATE('${value.from_date}', 'YYYY-MM-DD') AND TO_DATE('${value.to_date}', 'YYYY-MM-DD')`;
        let resData = await F_Select(0, select, "td_collection", where, null, 1);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });


    } catch (error) {
        console.log(error);

        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.post('/type_wise_report', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') as transaction_date,account_number,account_holder_name,tot_recov deposit_amount, product_code",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN TO_DATE('${value.from_date}', 'YYYY-MM-DD') AND TO_DATE('${value.to_date}', 'YYYY-MM-DD')`;
        let resData = await F_Select(0, select, "td_collection", where, null, 1);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });


    } catch (error) {
        console.log(error);

        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.post('/type_wise_report_modified', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            // product_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') transaction_date,account_number,account_holder_name,tot_recov deposit_amount, product_code",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN TO_DATE('${value.from_date}', 'YYYY-MM-DD') AND TO_DATE('${value.to_date}', 'YYYY-MM-DD')`;
        let resData = await F_Select(0, select, "td_collection", where, 'ORDER BY TO_NUMBER(account_number) ASC, transaction_date ASC', 1);

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });


    } catch (error) {
        console.log(error);

        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.post('/non_collection_report', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd")
        let select = "acc_type deposit_loan_flag,acc_type,product_type_name product_code,product_id account_number,phone_no mobile_no,cust_name customer_name,TO_CHAR(disb_dt, 'YYYY-MM-DD') opening_date,(curr_prn + curr_intt + ovd_prn + ovd_intt + penal_intt + other_charges) current_balance, (curr_prn_demand + ovd_prn_demand + curr_intt_demand + ovd_intt_demand + penal_intt_demand) current_demand",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND product_id not in (select account_number from td_collection where ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}' AND   transaction_date = TO_DATE('${datetime}', 'YYYY-MM-DD')) `;
        let resData = await F_Select(0, select, "td_account_dtls", where, null, 1);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });
    } catch (error) {
        console.log(error);

        res.json({
            "error": error,
            "status": false
        });
    }
})

reportRouter.post('/mini_statement', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.number().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }


        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') transaction_date,account_type,account_number,account_holder_name,tot_recov deposit_amount",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_number='${value.account_number}' AND account_type='${value.account_type}' AND transaction_date BETWEEN TO_DATE('${value.from_date}', 'YYYY-MM-DD') AND TO_DATE('${value.to_date}', 'YYYY-MM-DD')`;
        let resData = await F_Select(0, select, "td_collection", where, null, 1);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });




    } catch (error) {
        console.log(error);

        res.json({
            "error": error,
            "status": false
        });
    }
})

reportRouter.post('/date_wise_summary', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            //account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }


        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') as transaction_date,SUM(tot_recov) as deposit_amount, COUNT(account_number)as rcpts",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}' AND transaction_date BETWEEN TO_DATE('${value.from_date}', 'YYYY-MM-DD') AND TO_DATE('${value.to_date}', 'YYYY-MM-DD')`,
            order = "GROUP BY transaction_date";
        let resData = await F_Select(0, select, "td_collection", where, order, 1);

        // delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

reportRouter.post('/date_wise_mini_statement', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 30);
        var acc_num = value.account_number,
            acc_type = 11;

        let select = `account_number acc_num, account_type trans_type, TO_CHAR(transaction_date, 'YYYY-MM-DD') PAID_DT, tot_recov PAID_AMT, remaining_balance, remaining_demand`,
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_number=${acc_num} AND account_type='${value.account_type}'`,
            order = `ORDER BY transaction_date desc, collected_at desc`;
        var resDt = await F_Select(0, select, 'td_collection', where, order, 1);

        console.log(resDt)

        res.json({
            "success": resDt,
            "status": true
        });
    } catch (error) {
        console.log(error)
        res.json({
            "error": error,
            "status": false
        });
    }
})

reportRouter.post('/account_wise_scroll_report', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_number: Joi.number().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 20);
        const from_date = dateFormat(currentDate, "yyyy-mm-dd")
        const to_date = dateFormat(new Date(), "yyyy-mm-dd")

        let select = "DISTINCT TO_CHAR(a.transaction_date, 'YYYY-MM-DD') as transaction_date,a.account_type,a.account_number,a.account_holder_name,a.tot_recov deposit_amount,a.receipt_no,TO_CHAR(a.collected_at, 'YYYY-MM-DD') collected_at, TO_CHAR(b.disb_dt, 'YYYY-MM-DD') opening_date, (b.curr_prn + b.curr_intt + b.ovd_prn + b.ovd_intt + b.penal_intt + b.other_charges) current_balance, (b.curr_prn_demand + b.ovd_prn_demand + b.curr_intt_demand + b.ovd_intt_demand + b.penal_intt_demand) current_demand, TO_CHAR(a.collected_at, 'YYYY-MM-DD') collected_dt",
            where = `a.ardb_id=b.ardb_id AND a.branch_code=b.branch_code AND a.supervisor_code=b.supervisor_code AND a.account_type=b.acc_type AND a.account_number=b.product_id AND a.ardb_id=${value.ardb_id} AND a.branch_code='${value.branch_code}' AND a.supervisor_code='${value.supervisor_code}' AND a.account_number=${value.account_number} AND a.account_type='${value.account_type}' AND a.transaction_date BETWEEN TO_DATE('${from_date}', 'YYYY-MM-DD') AND TO_DATE('${to_date}', 'YYYY-MM-DD')`;
        var orderdata = `ORDER BY collected_dt DESC`
        let resData = await F_Select(0, select, "td_collection a, td_account_dtls b", where, orderdata, 1);

        if (resData.suc > 0) {
            var tot_col = 0
            for (let dt of resData.msg) {
                dt['closing_curr_bal'] = (dt.current_balance - tot_col) > 0 ? dt.current_balance - tot_col : dt.current_balance
                dt['closing_demand_bal'] = (dt.current_demand - tot_col) > 0 ? dt.current_demand - tot_col : dt.current_demand
                tot_col += +dt.deposit_amount
                if (value.account_type != 'L') {
                    dt['opening_curr_bal'] = (dt.current_balance - tot_col) > 0 ? dt.current_balance - tot_col : 0
                    dt['opening_demand_bal'] = (dt.current_demand - tot_col) > 0 ? dt.current_demand - tot_col : 0
                } else {
                    dt['opening_curr_bal'] = dt.current_balance + tot_col
                    dt['opening_demand_bal'] = dt.current_demand + tot_col
                }
            }
        }

        delete resData.sql

        res.json({
            "success": resData,
            "status": true
        });
    } catch (error) {
        console.log(error);
        
        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.post('/last_five_transaction', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            account_type: Joi.string().valid('D', 'R', 'L').required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') transaction_date,account_number,account_holder_name,tot_recov deposit_amount",
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_type='${value.account_type}'`;
        var orderdata = `order by collected_at desc FETCH FIRST 5 ROWS ONLY`
        let resData = await F_Select(0, select, "td_collection", where, orderdata, 1);

        res.json({
            "data": resData,
            "status": true
        });
    } catch (err) {
        res.json({
            "error": err,
            "status": false
        });
    }
})

reportRouter.post('/day_tot_report', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            from_date: Joi.string().required(),
            to_date: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });

        }
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 30);

        let select = `SUM(tot_recov) tot_col_amt, COUNT(supervisor_code) tot_col, TO_CHAR(transaction_date, 'YYYY-MM-DD') trns_date`,
            where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND transaction_date BETWEEN TO_DATE('${dateFormat(new Date(value.from_date), "yyyy-mm-dd")}', 'YYYY-MM-DD') AND TO_DATE('${dateFormat(new Date(value.to_date), "yyyy-mm-dd")}', 'YYYY-MM-DD')`,
            order = `GROUP BY transaction_date`;
        var resDt = await F_Select(0, select, 'td_collection', where, order, 1);

        res.json({
            "success": resDt,
            "status": true
        });

    } catch (error) {
        console.log(error)
        res.json({
            "error": error,
            "status": false
        });
    }
})

module.exports = { reportRouter }