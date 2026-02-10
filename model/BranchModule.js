const { F_Select } = require("./OrcModel");

const getBranchList = (ardb_id, user_type, id = 0) => {
    return new Promise(async (resolve, reject) => {
        try {
            let select = 'a.*',
                table_name = 'md_branch a, md_user b',
                whr = `a.branch_code=b.branch_code AND a.ardb_id=b.ardb_id ${ardb_id > 0 ? `AND a.ardb_id='${ardb_id}'` : ''} AND b.user_type='${user_type}' ${id > 0 ? `AND a.branch_id=${id}` : ''}`;
            const res_dt = await F_Select(0, select, table_name, whr, null, 1)
            resolve(res_dt);
        } catch (err) {
            resolve({ suc: 0, msg: err });
        }
    })
}

module.exports = { getBranchList };