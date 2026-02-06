const { getArdbDetails } = require('../../model/ArdbModule');
const { getBranchList } = require('../../model/BranchModule');
const { PRINTER_TYPE_MASTER } = require('../../model/CommonModel');
const { getSupervisorDetails } = require('../../model/SupervisorModule');

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
        selected: selected
    };
    res.render('admin/supervisor/view', viewData)
})

supervisorRouter.get('/edit', async (req, res) => {
    let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    const resData = await getSupervisorDetails(req_data.ardb_id, req_data.branch_code, 'Y', req_data.id);
    delete resData.sql;
    var viewData = {
        title: "Agent",
        data: resData.suc > 0 && resData.msg.length > 0 ? resData.msg[0] : {},
        agent_id: req_data.id,
        printer_type: PRINTER_TYPE_MASTER
    };
    // console.log(viewData);
    res.render("admin/supervisor/edit", viewData);
})

supervisorRouter.post('/get_sup_ajax', async (req, res) => {
    let req_data = req.body.enc_dt ? Buffer.from(req.body.enc_dt, 'base64').toString() : null;
    req_data = req_data ? JSON.parse(req_data) : null;

    const resData = await getSupervisorDetails(req_data.ardb_id, req_data.branch_code, 'Y', req_data.id);
    res.send(resData)
})

module.exports = {supervisorRouter};