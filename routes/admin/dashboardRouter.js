const dashAdminRouter = require('express').Router();
const { getArdbDetails } = require('../../model/ArdbModule');
const { F_Select } = require('../../model/OrcModel');

dashAdminRouter.get('/', async (req, res) => {
    const user_data = req.user.user_data.msg[0];

    const BrProgData = await F_Select(0, '*', 'bank_branch_coll_progress', `ardb_id=${user_data.ardb_id} ${user_data.user_type == 'R' ? `AND branch_code = '${user_data.branch_code}'` : ''}`, null, 1)    

    const agntDayWiseCol = await F_Select(0, `a.ardb_id, b.ardb_name, a.branch_code, c.branch_name, a.supervisor_code, d.supervisor_name, TO_CHAR(a.transaction_date, 'YYYY-MM-DD') transaction_date, TO_CHAR(a.transaction_date, 'DD-Mon-RR') trn_dt, sum(a.tot_recov) tot_col_amt`, 'td_collection a, md_ardb b, md_branch c, md_supervisor d', `a.ardb_id=b.ardb_id AND a.branch_code=c.branch_code AND a.ardb_id=c.ardb_id AND a.supervisor_code=d.supervisor_code AND a.ardb_id=d.ardb_id AND a.branch_code=d.branch_code AND TO_CHAR(a.transaction_date, 'MM-YYYY') = TO_CHAR(SYSDATE, 'MM-YYYY') AND a.ardb_id=${user_data.ardb_id} ${user_data.user_type == 'R' ? `AND a.branch_code = '${user_data.branch_code}'` : ''}`, `group by a.ardb_id, b.ardb_name, a.branch_code, c.branch_name, a.supervisor_code, d.supervisor_name, a.transaction_date order by a.ardb_id,a.branch_code,a.transaction_date,a.supervisor_code`, 1)

    var viewData = {
        title: "Dashboard",
        page_path: "/dashboard/dashboard",
        data: "",
        br_pro_data: BrProgData.suc > 0 ? BrProgData.msg : [],
        agnt_dt_wise_col: agntDayWiseCol.suc > 0 ? agntDayWiseCol.msg : []
    };

    res.render('admin/dashboard', viewData)
})

dashAdminRouter.get('/superadmin', async (req, res) => {
    const user_data = req.user.user_data.msg[0];
    
    const ardbList = await getArdbDetails();

    var viewData = {
        title: "Super-Admin Dashbaord",
        ardb: ardbList
    };
    res.render('admin/dashboard/superadmin', viewData)
});

dashAdminRouter.post('/total_user', async (req, res) => {
    var data = req.body;

    var select = "COUNT(a.supervisor_code) AS tot_dt,b.active_flag",
    table_name = "md_supervisor a LEFT JOIN md_user b ON a.branch_code = b.branch_code AND a.ardb_id = b.ardb_id AND a.supervisor_code = b.user_id",
    whr = `a.ardb_id = ${data.ardb_id} AND b.active_flag = 'Y'`;
    order = `GROUP BY b.active_flag`;
  var active_resData = await F_Select(0,select, table_name, whr, order,1);

   var select = "COUNT(a.supervisor_code) AS tot_dt,b.active_flag",
    table_name = "md_supervisor a LEFT JOIN md_user b ON a.branch_code = b.branch_code AND a.ardb_id = b.ardb_id AND a.supervisor_code = b.user_id",
    whr = `a.ardb_id = ${data.ardb_id} AND b.active_flag = 'N'`;
  order = `GROUP BY b.active_flag`;
  var inactive_resData = await F_Select(0,select, table_name, whr, order,1);

   var final_res = {
    suc: 1,
    msg: {
      act_dt:
        active_resData.suc > 0 && active_resData.msg.length > 0
          ? active_resData.msg[0].tot_dt
          : 0,
      deact_dt:
        inactive_resData.suc > 0 && inactive_resData.msg.length > 0
          ? inactive_resData.msg[0].tot_dt
          : 0,
    },
};
res.json(final_res);
})

module.exports = {dashAdminRouter};