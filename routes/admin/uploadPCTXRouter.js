const { getArdbDetails } = require('../../model/ArdbModule');
const { getBranchList } = require('../../model/BranchModule');
const { getBlockList } = require('../../model/CommonModel');
const { F_Select, F_Delete, RunProcedure, F_Insert } = require('../../model/OrcModel');
const { getSupervisorDetails } = require('../../model/SupervisorModule');
const dateFormat = require('dateformat');
const Joi = require('joi');

const uploadPctxRouter = require('express').Router()

uploadPctxRouter.get('/upload_pctx', async (req, res) => {
    const user_data = req.user.user_data.msg[0];

    const ardb_id = user_data.user_type != 'A' ? user_data.ardb_id : 0,
        branch_code = user_data.user_type == 'R' ? user_data.branch_code : 0;

    let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    const selected = {
        ardb_id: ['A'].includes(user_data.user_type) ? (req_data ? req_data.ardb_id : ardb_id) : ardb_id,
        branch_code: ['A', 'B'].includes(user_data.user_type) ? (req_data ? req_data.branch_code : branch_code) : branch_code
    }

    const ardbList = await getArdbDetails(selected.ardb_id);
    const resDataBranch = await getBranchList(selected.ardb_id, user_data.user_type);
    let dbuser_data = await getSupervisorDetails(selected.ardb_id, selected.branch_code);

    let blockList = {suc: 0}

    blockList = await getBlockList(selected.ardb_id)

    var viewData = {
        title: "Upload || PCTX",
        data: dbuser_data.suc > 0 ? dbuser_data.msg : [],
        resDataBranch: resDataBranch.suc > 0 ? resDataBranch.msg : [],
        ardb: ardbList,
        selected: selected,
        block_list: blockList.suc > 0 ? blockList.msg : []
    };
    res.render('admin/upload_pctx/entry', viewData)
})

uploadPctxRouter.post('/check_sync_data_ajax', async (req, res) => {
    try {
        const supervisor_code = req.body.supervisor_code;
        const user_data = req.user.user_data.msg[0];

        //db connection
        let fields = "COUNT(*) AS count",
            table_name = "TD_COLL_ACC_DTLS",
            where = `ardb_id = ${user_data.ardb_id} AND branch_code ='${user_data.branch_code}' AND supervisor_code = '${supervisor_code}' AND  trf_flag IN ('N','P')`,
            order = null,
            flag = 0;

        var unsync_data = await F_Select(0, fields, table_name, where, order, flag)

        // console.log("========================///////",unsync_data.msg)
        if (unsync_data.suc > 0){
            if (unsync_data.msg.count == 0) {
                res.json(true);
            } else {
                res.json(false);
            }
        }else{
            res.json(false);
        }
    } catch (error) {
        res.json(error);
    }
})

uploadPctxRouter.post('/check_and_collection_ajax', async (req, res) => {
    try {
        const supervisor_code = req.body.supervisor_code;
        const user_data = req.user.user_data.msg[0];
        var select_q = "COUNT(*) AS count";
        var whr = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${supervisor_code}' AND coll_flag='Y' AND end_flag='N' AND supervisor_trans_no IS NULL AND received_date IS NULL ORDER BY send_date DESC `;
        let res_dt = await F_Select(0, select_q, "md_supervisor_trans", whr, null, 0);
        // console.log(res_dt);
        
        let ckhDt = res_dt.suc > 0 ? (res_dt.msg.count == 0 ? 0 : 1) : 1;
        if (ckhDt > 0) {
            res.json(ckhDt);
        } else {
            res.json(ckhDt);
        }
    } catch (error) {
        res.json(1);
    }
})

uploadPctxRouter.post('/del_all_pctx_file_data_ajax', async (req, res) => {
    try {
        const schema = Joi.object({
            supervisor_code: Joi.string().required()
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
        let delwhr = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${value.supervisor_code}'`;

        var res_del = await F_Delete(0, "td_account_dtls", delwhr)
        // console.log("**********************", res_del)
        res.json({
            "SUCCESS": res_del,
            "status": true
        });
    } catch (error) {
        res.json({
            "ERROR": error,
            "status": false
        });
    }
})

uploadPctxRouter.post('/fetchdata_to_server_ajax', async (req, res) => {
    try {
        const schema = Joi.object({
            supervisor_code: Joi.string().required(),
            savedData: Joi.required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
            currDate = dateFormat(new Date(), "yyyy-mm-dd");
        const user_data = req.user.user_data.msg[0];
        let res_dt = {};

        if (Array.isArray(value.savedData)){
            let lastBatchId = await F_Select(0, 'NVL(MAX(batch_id), 10000)+1 AS batch_id', 'TD_SUPERVISOR_FETCH_QUERY', null, null, 0);
            lastBatchId = lastBatchId.suc > 0 ? lastBatchId.msg.batch_id : 0;

            if (lastBatchId > 0){
                for (let data of value.savedData){
                    let fields = 'batch_id, entry_dt, ardb_id, branch_code, supervisor_code, block_id, service_area_id, vill_id, created_by, created_dt',
                    fieldIndex = `(:0, TO_DATE(:1, 'YYYY-MM-DD'), :2, :3, :4, :5, :6, :7, :8, TO_DATE(:9, 'YYYY-MM-DD HH24:MI:SS'))`,
                    values = [
                        lastBatchId,
                        currDate,
                        user_data.ardb_id,
                        user_data.branch_code,
                        value.supervisor_code,
                        data.block_id,
                        data.service_area_id,
                        data.vill_id,
                        user_data.id,
                        datetime
                    ],
                    table_name = 'TD_SUPERVISOR_FETCH_QUERY';

                    await F_Insert(0, table_name, fields, fieldIndex, values, null, 0)
                }

                switch (user_data.data_trf) {
                    // case 'A':
                    //     res_dt = await fetchDataToServerWithAPI(user_data, value)
                    //     break;
                    case 'P':
                        res_dt = await fetchDataToServerWithProcedure(user_data, value, lastBatchId)
                        break;
        
                    default:
                        res_dt = { "ERROR": 'No User Data transfer flag match', "status": false }
                        break;
                }
            }else{
                res_dt = { suc: 0, msg: 'Batch ID not generated', "ERROR": 'Batch ID not generated', "status": false }
            }

        }else{
            res_dt = { suc: 0, msg: 'Invalid Data Format', "ERROR": 'Invalid Data Format', "status": false }
        }

        res.json(res_dt)
    } catch (error) {
        console.log(error, '===================');
        
        res.json({
            "ERROR": error,
            "status": false
        });
    }
})

const fetchDataToServerWithProcedure = (userData, value, lastBatchId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const currDate = dateFormat(new Date(), "dd/mm/yyyy"),
                datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
                user_data = userData
            var pro_query = `DECLARE
  ADT_ENTRY_DT DATE;
  AD_BATCH_ID NUMBER;
  AS_SUPERVISOR_CD VARCHAR2(200);
  AS_UPLOADED_BY VARCHAR2(200);
  AS_ARDB_CD VARCHAR2(200);
  AS_BRN_CD VARCHAR2(200);
BEGIN
  ADT_ENTRY_DT := TO_DATE('${dateFormat(new Date(), "dd/mm/yyyy")}', 'DD/MM/YYYY');
  AD_BATCH_ID := ${+lastBatchId};
  AS_SUPERVISOR_CD := '${value.supervisor_code}';
  AS_UPLOADED_BY := '${userData.id}';
  AS_ARDB_CD := '${userData.ardb_id}';
  AS_BRN_CD := '${userData.branch_code}';

  P_DEMAND_COLLECTION(
    ADT_ENTRY_DT => ADT_ENTRY_DT,
    AD_BATCH_ID => AD_BATCH_ID,
    AS_SUPERVISOR_CD => AS_SUPERVISOR_CD,
    AS_UPLOADED_BY => AS_UPLOADED_BY,
    AS_ARDB_CD => AS_ARDB_CD,
    AS_BRN_CD => AS_BRN_CD
  );
END;`,
                table_name = 'td_account_dtls',
                fields = 'count(*) tot_row',
                where = `ardb_id='${user_data.ardb_id}' AND branch_code='${user_data.branch_code}' AND supervisor_code='${value.supervisor_code}' AND batch_id=${lastBatchId}`,
                order = null;
            // console.log(pro_query);
            var tableDate = await RunProcedure(0, pro_query, table_name, fields, where, order)
            console.log(tableDate, '=================TABLE DATE===============');
            var msg = ''
            if (tableDate.TOT_ROW > 0){
                msg = 'Data Uploaded Successfully'
            }else{
                msg = 'No Data Found'
            }
            resolve({ suc: 1, msg: msg })
        } catch (error) {
            console.log(error);
            
            resolve({
                "ERROR": error,
                "status": false
            })
        }
    })
}

uploadPctxRouter.post('/create_supervisor_trans_ajax', async (req, res) => {
    try {
        const schema = Joi.object({
            supervisor_code: Joi.string().required()
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
        var fields = 'ardb_id, branch_code, supervisor_code, coll_flag, send_date, end_flag',
            fieldIndex = `(:0, :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'), :5)`,
            values = [
                user_data.ardb_id,
                user_data.branch_code,
                value.supervisor_code,
                'Y',
                dateFormat(new Date(), "yyyy-mm-dd"),
                'N'
            ];
        var res_dt = await F_Insert(0, "md_supervisor_trans", fields, fieldIndex, values, null, 0);

        // var dt = new Date()
        // dt.setDate(dt.getDate() -1)

        res.json({
            "SUCCESS": res_dt,
            "status": true
        });
    } catch (error) {
        console.log(error);
        
        res.json({
            "ERROR": error,
            "status": true
        });
    }
})

module.exports = {uploadPctxRouter}