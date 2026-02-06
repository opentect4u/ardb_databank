const { db_Select } = require("./MySqlModule");

const getArdbDetails = (ardb_id = 0) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = '*',
                from = 'md_ardb',
                where = ardb_id > 0 ? `ardb_id=${ardb_id}` : null;
            const res_dt = await db_Select(select, from, where, null)
            resolve(res_dt);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

module.exports = { getArdbDetails }