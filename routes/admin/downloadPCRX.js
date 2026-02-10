const downloadPcrx = require('express').Router();
const Joi = require('joi');
const { F_Select, F_Insert } = require('../../model/OrcModel');
const dateFormat = require('dateformat');

downloadPcrx.get('/download_pcrx', async (req, res) => {
    const user_data = req.user.user_data.msg[0];
    var whrDAta = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}'  AND active_flag='Y'AND user_type='O'`,
        selectData = "user_id";
    let dbuser_data = await F_Select(0, selectData, "md_user", whrDAta, null, 1);


    // upload_data

    // var template = (user_data.data_trf == 'A') ? "upload_file/pushserver_pcrx" : "upload_file/download_pcrx";
    var template = (user_data.data_trf != 'M') ? "upload_file/pushserver_pcrx" : "upload_file/download_pcrx";

    var viewData = {
        title: "DOWNLOAD || PCRX",
        page_path: template,
        data: dbuser_data.msg,
        dateFormat
    };
    res.render('admin/download_pcrx/entry', viewData)
})

downloadPcrx.post('/fetch_trans_number_ajax', async (req, res) => {
    try {
        const schema = Joi.object({
            // agent_code: Joi.string().required(),
            fDate: Joi.string().required(),
            tDate: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const user_data = req.user.user_data.msg[0];
        let table = 'md_supervisor_trans a, md_supervisor b',
            select = "a.supervisor_trans_no,a.supervisor_code,b.supervisor_name,TO_CHAR(a.received_date, 'YYYY-MM-DD') received_date",
            where = `a.supervisor_code=b.supervisor_code AND a.ardb_id = b.ardb_id AND a.ardb_id =${user_data.ardb_id} AND a.branch_code='${user_data.branch_code}' AND b.ardb_id =${user_data.ardb_id} AND b.branch_code='${user_data.branch_code}' AND a.supervisor_trans_no IS NOT NULL AND a.coll_flag='N' AND a.end_flag='Y' AND a.received_date BETWEEN TO_DATE('${value.fDate}', 'YYYY-MM-DD') AND TO_DATE('${value.tDate}', 'YYYY-MM-DD')`,
            order = null;
        let resData = await F_Select(0, select, table, where, order, 1);

        if (resData.suc > 0) {
            for (let dt of resData.msg) {
                let table = 'td_collection a',
                    select = "SUM(a.tot_recov) as amount, COUNT(a.tot_recov) as count_account, a.download_flag",
                    where = `a.supervisor_trans_no = '${dt.supervisor_trans_no}'`,
                    order = `GROUP BY a.download_flag`;
                let colDt = await F_Select(0, select, table, where, order, 1);
                dt['amount'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].amount : 0) : 0
                dt['count_account'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].count_account : 0) : 0
                dt['download_flag'] = colDt.suc > 0 ? (colDt.msg.length > 0 ? colDt.msg[0].download_flag : 0) : 0
            }
        }

        //console.log("====================",resData)

        // delete resData.sql
        res.json(resData);

    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
})

downloadPcrx.get('/fetch_pcrx_file_ajax', async (req, res) => {
    try {
        const supervisor_code = req.query.agent_code;
        const fDate = req.query.fDate;
        const tDate = req.query.tDate;
        const transitionNumber = req.query.transaction_number;
        const user_data = req.user.user_data.msg[0];

        var dateTime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")

        var whr = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${supervisor_code}' AND supervisor_trans_no='${transitionNumber}' AND supervisor_trans_no IS NOT NULL AND download_flag = 'N'`;
        let res_dt = await F_Select(0, 'receipt_no', "td_collection", whr, null, 1);

        console.log('-=-=-=-=-=', res_dt)
        
        if (res_dt.suc > 0 && res_dt.msg.length > 0) {
            var updateVal = `trf_flag = 'P'`,
                updateTable = 'TD_COLL_ACC_DTLS',
                updatewhr = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${supervisor_code}' AND receipt_no IN (${res_dt.msg.map(item => `'${item.receipt_no}'`).join(',')})`;
            let res_up = await F_Insert(0, updateTable, updateVal, null, [], updatewhr, 1);

            if (res_up.suc > 0) {
                var updateVal = `download_flag = 'Y'`,
                    updateTable = 'TD_COLLECTION',
                    updatewhr = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${supervisor_code}' AND supervisor_trans_no='${transitionNumber}'`;
                let res_up = await F_Insert(0, updateTable, updateVal, null, [], updatewhr, 1);

                if (res_up.suc > 0) {
                    res.json({ suc: 1, msg: "Pcrx file downloaded successfully" })
                } else {
                    res.json({ suc: 0, msg: "Error in updating download flag in TD_COLLECTION" })
                }
            }else{
                res.json({ suc: 0, msg: "Error in updating trf_flag in TD_COLL_ACC_DTLS" })
            }
        }else{
            res.json({ suc: 0, msg: "No records found to download" })
        }
    } catch (error) {
        return res.json({ error: error });
        // res.redirect('/admin/download_pcrx');
    }
})

module.exports = {downloadPcrx}