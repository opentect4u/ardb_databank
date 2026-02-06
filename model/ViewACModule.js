const { F_Select } = require("./OrcModel");

const getUploadedAcDetails = (ardb_id, branch_code, supervisor_code) => {
    return new Promise(async (resolve, reject) => {
        try{
            var whrDAta = `a.ardb_id='${ardb_id}' AND a.branch_code='${branch_code}'  AND a.supervisor_code=(select supervisor_code from md_supervisor where supervisor_id = '${supervisor_code}')`,
                selectData = "a.*",
                table = `td_account_dtls a`;
            let res_dt = await F_Select(0, selectData, table, whrDAta, null, 1);
            resolve(res_dt)
        }catch(err){
            resolve({suc: 0, msg: err})
        }
    })
}

module.exports = { getUploadedAcDetails }