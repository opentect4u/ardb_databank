const { F_Select } = require('../../model/OrcModel'),
dateFormat = require('dateformat'),
Joi = require('joi');

const reportRouter = require('express').Router();

reportRouter.all('/day_scroll_report', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        var selected = {
            ardb_id: req.body ? req.body.ardb_id : 0,
            branch_code: req.body ? req.body.branch_code : 0,
            supervisor_code: req.body ? req.body.supervisor_code : 0,
            from_date: req.body ? req.body.from_date : null,
            to_date: req.body ? req.body.to_date : null,
        }
        var whrDAta = `ardb_id='${user_data.ardb_id}' AND active_flag='Y'`,
            selectData = "branch_code,branch_name,branch_id ";
        let dbuser_data = await F_Select(0, selectData, "md_branch", whrDAta, null, 1);
        console.log(dbuser_data)
        let resData = {suc: 0, msg: []}

        if (req.method == 'POST') {
            let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') as transaction_date,account_type,account_number, account_holder_name,tot_recov deposit_amount,supervisor_code",
                where = `ardb_id=${selected.ardb_id} ${selected.supervisor_code > 0 ? `AND supervisor_code='${selected.supervisor_code}' ` : ''} ${selected.branch_code > 0 ? `AND branch_code='${selected.branch_code}'` : ''} AND transaction_date BETWEEN TO_DATE('${selected.from_date}', 'YYYY-MM-DD') AND TO_DATE('${selected.to_date}', 'YYYY-MM-DD')`,
                order = `ORDER BY transaction_date ASC`;
            resData = await F_Select(0, select, "td_collection", where, order, 1);
        }

        const datetimee = dateFormat(new Date(), "yyyy-mm-dd")
        var viewData = {
            selected,
            title: "Day Scroll Report",
            resDataBranch: dbuser_data.msg,
            nowdate: datetimee,
            repo_dt: resData ? resData.msg : [],
            dateFormat,
            request: req.method
        };
        res.render('admin/report/day_scroll_report', viewData)
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.all('/account_type_wise_report', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        var selected = {
            ardb_id: req.body ? req.body.ardb_id : 0,
            branch_code: req.body ? req.body.branch_code : 0,
            supervisor_code: req.body ? req.body.supervisor_code : 0,
            from_date: req.body ? req.body.from_date : null,
            to_date: req.body ? req.body.to_date : null,
            account_type: 'L'
        }
        var whrDAta = `ardb_id='${user_data.ardb_id}' AND active_flag='Y'`,
            selectData = "branch_code,branch_name,branch_id ";
        let dbuser_data = await F_Select(0, selectData, "md_branch", whrDAta, null, 1);
        console.log(dbuser_data)
        let resData = { suc: 0, msg: [] }

        if (req.method == 'POST') {
            let select = "TO_CHAR(transaction_date, 'YYYY-MM-DD') transaction_date,account_number,account_holder_name,tot_recov deposit_amount",
                where = `ardb_id=${selected.ardb_id} ${selected.branch_code > 0 ? `AND branch_code='${selected.branch_code}'` : ''} AND supervisor_code='${selected.supervisor_code}' AND account_type='${selected.account_type}' AND transaction_date BETWEEN TO_DATE('${selected.from_date}', 'YYYY-MM-DD') AND TO_DATE('${selected.to_date}', 'YYYY-MM-DD')`,
                order = `ORDER BY transaction_date ASC`;
            resData = await F_Select(0, select, "td_collection", where, order, 1);
        }

        const datetimee = dateFormat(new Date(), "yyyy-mm-dd")
        var viewData = {
            selected,
            title: "Account Type Wise Report",
            resDataBranch: dbuser_data.msg,
            nowdate: datetimee,
            repo_dt: resData.suc > 0 ? resData.msg : [],
            dateFormat,
            request: req.method
        };
        res.render('admin/report/acc_type_wise_report', viewData)
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
})

reportRouter.all('/summary_report', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        var selected = {
            ardb_id: req.body ? req.body.ardb_id : 0,
            branch_code: req.body ? req.body.branch_code : 0,
            supervisor_code: req.body ? req.body.supervisor_code : 0,
            from_date: req.body ? req.body.from_date : null,
            to_date: req.body ? req.body.to_date : null,
        }
        var whrDAta = `ardb_id='${user_data.ardb_id}' AND active_flag='Y'`,
            selectData = "branch_code,branch_name,branch_id ";
        let dbuser_data = await F_Select(0, selectData, "md_branch", whrDAta, null, 1);
        // console.log(dbuser_data)
        let resData = { suc: 0, msg: [] }

        if (req.method == 'POST') {
            let select = "a.supervisor_trans_no,a.supervisor_code,TO_CHAR(a.send_date, 'YYYY-MM-DD') send_date,TO_CHAR(a.received_date, 'YYYY-MM-DD') received_date,a.end_flag, sum(b.tot_recov) deposit_amount",
                where = `a.supervisor_trans_no = b.supervisor_trans_no and a.supervisor_code = b.supervisor_code AND a.ardb_id=${selected.ardb_id} AND a.branch_code='${selected.branch_code}' AND a.supervisor_code='${selected.supervisor_code}'`,
                order = `group by a.supervisor_trans_no,a.supervisor_code,a.send_date,a.received_date,a.end_flag order by a.send_date`;
            resData = await F_Select(0, select, "md_supervisor_trans a,td_collection b", where, order, 1);
        }

        const datetimee = dateFormat(new Date(), "yyyy-mm-dd")
        var viewData = {
            selected,
            title: "Summary Report",
            resDataBranch: dbuser_data.msg,
            nowdate: datetimee,
            repo_dt: resData.suc > 0 ? resData.msg : [],
            dateFormat,
            request: req.method
        };
        res.render('admin/report/summary_report', viewData)
    } catch (error) {
        res.json({
            "success": error,
            "status": false
        });
    }
})

module.exports = {reportRouter};