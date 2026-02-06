const dashAdminRouter = require('express').Router();
const { db_Select } = require('../../model/MySqlModule');

dashAdminRouter.get('/', async (req, res) => {
    const user_data = req.user.user_data.msg[0];

    const BrProgData = { suc: 0, msg: [] } // await db_Select('*', 'bank_branch_coll_progress', `bank_id=${user_data.bank_id} ${user_data.user_type == 'R' ? `AND branch_code = '${user_data.branch_code}'` : ''}`, null)

    const agntDayWiseCol = await db_Select(`a.ardb_id, b.ardb_name, a.branch_code, c.branch_name, a.supervisor_code, d.supervisor_name, a.transaction_date, DATE_FORMAT(a.transaction_date, '%d-%b-%y') trn_dt, sum(a.deposit_amount) tot_col_amt`, 'td_collection a, md_ardb b, md_branch c, md_supervisor d', `a.ardb_id=b.ardb_id AND a.branch_code=c.branch_code AND a.ardb_id=c.ardb_id AND a.supervisor_code=d.supervisor_code AND a.ardb_id=d.ardb_id AND a.branch_code=d.branch_code AND MONTH(a.transaction_date) = MONTH(NOW()) AND a.ardb_id=${user_data.ardb_id} ${user_data.user_type == 'R' ? `AND a.branch_code = '${user_data.branch_code}'` : ''}`, `group by a.ardb_id, b.ardb_name, a.branch_code, c.branch_name, a.supervisor_code, d.supervisor_name, a.transaction_date order by a.ardb_id,a.branch_code,a.transaction_date,a.supervisor_code`)

    var viewData = {
        title: "Dashboard",
        page_path: "/dashboard/dashboard",
        data: "",
        br_pro_data: BrProgData.suc > 0 ? BrProgData.msg : [],
        agnt_dt_wise_col: agntDayWiseCol.suc > 0 ? agntDayWiseCol.msg : []
    };

    res.render('admin/dashboard', viewData)
})

module.exports = {dashAdminRouter};