const { db_Select } = require("./MySqlModule");

const getSupervisorDetails = (ardb_id, branch_code = 0, flag = 'Y', supervisor_id = 0) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = 'c.branch_name,a.id, a.user_id,a.active_flag,a.device_id,a.device_sl_no,b.supervisor_name,b.supervisor_address,b.phone_no,b.email_id,b.max_amt, a.branch_code, b.supervisor_id, b.ardb_id, b.branch_code, b.allow_collection_days, b.supervisor_code',
                table_name = 'md_user as a, md_supervisor as b,md_branch AS c',
                whr = `a.user_id=b.supervisor_code AND a.branch_code=c.branch_code AND a.ardb_id=c.ardb_id AND a.ardb_id=b.ardb_id AND a.ardb_id='${ardb_id}' AND b.ardb_id='${ardb_id}' ${branch_code > 0 ? `AND b.branch_code='${branch_code}'` : ''} ${supervisor_id > 0 ? `AND b.supervisor_id=${supervisor_id}` : ''} AND a.user_type='O' AND b.active_flag = '${flag}'`;
            var resData = await db_Select(select, table_name, whr, null)
            resolve(resData);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

module.exports = { getSupervisorDetails };