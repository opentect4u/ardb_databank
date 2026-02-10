const { F_Select } = require("./OrcModel");

const getUploadedAcDetails = (ardb_id, branch_code, supervisor_code) => {
    return new Promise(async (resolve, reject) => {
        try{
            var whrDAta = `ardb_id='${ardb_id}' AND branch_code='${branch_code}' AND supervisor_code=(select supervisor_code from md_supervisor where supervisor_id = '${supervisor_code}')`,
                selectData = "account_dtls_id, batch_id, ardb_id, branch_code, supervisor_code, upload_dt, acc_type, product_type_code, product_type_name, fund_type, product_id, block_id, block_name, service_area_id, service_area_name, vill_id, vill_name, cust_id, cust_name, guardian_name, address, phone_no, curr_intt_rate, ovd_intt_rate, penal_intt_rate, TO_CHAR(disb_dt, 'YYYY-MM-DD') disb_dt, disb_amt, (curr_prn+ovd_prn+curr_intt+ovd_intt+penal_intt+other_charges) curr_balance, TO_CHAR(last_intt_calc_dt, 'YYYY-MM-DD') last_intt_calc_dt, interest_calc_type, (curr_prn_demand+ovd_prn_demand+curr_intt_demand+ovd_intt_demand+penal_intt_demand) curr_demand, uploaded_by, uploaded_at",
                table = `td_account_dtls`;
            let res_dt = await F_Select(0, selectData, table, whrDAta, null, 1);
            resolve(res_dt)
        }catch(err){
            resolve({suc: 0, msg: err})
        }
    })
}

module.exports = { getUploadedAcDetails }