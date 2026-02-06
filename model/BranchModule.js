const { db_Select } = require("./MySqlModule");

const getBranchList = (ardb_id, user_type, id = 0) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = 'a.*',
                table_name = 'md_branch AS a, md_user as b',
                whr = `a.branch_code=b.branch_code AND a.ardb_id=b.ardb_id ${ardb_id > 0 ? `AND a.ardb_id='${ardb_id}'` : ''} AND b.user_type='${user_type}' ${id > 0 ? `AND a.branch_id=${id}` : ''}`;
            const res_dt = await db_Select(select, table_name, whr, null)
            resolve(res_dt);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

module.exports = { getBranchList };