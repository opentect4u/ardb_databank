const viewAcRouter = require('express').Router()
const { getArdbDetails } = require('../../model/ArdbModule');
const { getBranchList } = require('../../model/BranchModule');
const { getSupervisorDetails } = require('../../model/SupervisorModule');
const { getUploadedAcDetails } = require('../../model/ViewACModule');

viewAcRouter.get('/', async (req, res) => {
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
    const dbuser_data = await getSupervisorDetails(selected.ardb_id, selected.branch_code, selected.flag);
    
    var viewData = {
        title: "UPLOAD ACCOUNT LIST",
        data: dbuser_data.msg
    };
    res.render('admin/ac_preview/view', viewData)
})

viewAcRouter.post('/fetch_ac_dtls_ajax', async (req, res) => {
    let req_data = req.body.enc_dt ? Buffer.from(req.body.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    console.log(req_data, 'req data');
    

    const res_dt = await getUploadedAcDetails(req_data.ardb_id, req_data.branch_code, req_data.id)
    res.send(res_dt)
})

module.exports = {viewAcRouter}