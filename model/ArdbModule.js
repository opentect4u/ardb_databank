const { F_Select } = require("./OrcModel");

const getArdbDetails = (ardb_id = 0) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = '*',
                from = 'md_ardb',
                where = ardb_id > 0 ? `ardb_id=${ardb_id}` : null;
            const res_dt = await F_Select(0, select, from, where, null, 1)
            resolve(res_dt);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

const getArdbDetails_flag = (flag=null) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = '*',
                from = 'md_ardb',
                where = `active_flag = '${flag}'`;
            const flag_dt = await F_Select(0, select, from, where, null, 1)
            resolve(flag_dt);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

const getArdbrDtls = (ardb_id, flag = 'Y') => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = 'a.user_type,a.user_id,b.ardb_id,b.ardb_name,b.ardb_address,b.contact_person,b.phone_no,b.email_id,b.device_type,b.data_trf,b.receipt_type,b.sec_amt_type,b.max_day_entry_flag,b.max_user,b.active_flag,b.after_maturity_coll',
                table_name = 'md_user a, md_ardb b',
                whr = `a.ardb_id = b.ardb_id AND a.ardb_id='${ardb_id}' AND a.user_type='B' AND b.active_flag = '${flag}'`;
            var resData = await F_Select(0, select, table_name, whr, null, 1)
            resolve(resData);
        }catch(err){
            resolve({suc:0, msg:err});
        }
    })
}

module.exports = { getArdbDetails, getArdbDetails_flag, getArdbrDtls }