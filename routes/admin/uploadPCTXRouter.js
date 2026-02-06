const { getArdbDetails } = require('../../model/ArdbModule');
const { getBranchList } = require('../../model/BranchModule');
const { getBlockList } = require('../../model/CommonModel');
const { getSupervisorDetails } = require('../../model/SupervisorModule');

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

module.exports = {uploadPctxRouter}