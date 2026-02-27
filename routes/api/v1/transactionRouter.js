const transRouter = require('express').Router()

const { F_Select, F_Insert, callLoanInterestProcedure } = require('../../../model/OrcModel');
const Joi = require('joi'),
    dateFormat = require('dateformat');

transRouter.post('/transaction', async (req, res) => {
    try {
        // console.log(req.body, 'Body');
        const schema = Joi.object({
            // receipt_no: Joi.number().required(),
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            transaction_date: Joi.string().required(),
            ac_info: Joi.string().required(),
            intt_calc_flag: Joi.string().valid('Y', 'N').required(),
            intt_calc_dt: Joi.string().required(),
            curr_intt_calculated: Joi.number().required(),
            ovd_intt_calculated: Joi.number().required(),
            penal_intt_calculated: Joi.number().required(),
            updated_curr_intt: Joi.number().required(),
            updated_ovd_intt: Joi.number().required(),
            updated_penal_intt: Joi.number().required(),
            recov_dt: Joi.string().required(),
            tot_recov: Joi.number().precision(2).max(999999999999999.99).required(),
            remaining_balance: Joi.number().precision(2).max(999999999999999.99).required(),
            remaining_demand: Joi.number().precision(2).max(999999999999999.99).required(),
            collection_by: Joi.number().required(),
            sec_amt_type: Joi.string().valid('A', 'M').required(),
            pay_mode: Joi.string().valid('O', 'F').default('F'),
            pay_txn_id: Joi.string().optional().default(null),
            pay_amount: Joi.string().optional().default(null),
            pay_amount_original: Joi.string().optional().default(null),
            currency_code: Joi.string().optional().default(null),
            payment_mode: Joi.string().optional().default(null),
            pay_status: Joi.string().optional().default(null),
            receipt_url: Joi.string().optional().default(null),
            // collected_at: Joi.required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            console.log(error, 'Transaction Error----------');

            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }

        console.log(value, 'Transaction Values-----------');

        const datetime = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss"),
            datetimef = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss");

        let user_ac_info = JSON.parse(value.ac_info)
        user_ac_info = user_ac_info[0]

        var timestamp = new Date().getTime();
        var fields = 'sl_no',
            whr = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND coll_flag='Y' AND end_flag='N'`;

        let checkedData = await F_Select(0, fields, "md_supervisor_trans", whr, 0);

        checkedData = checkedData.suc > 0 && Object.keys(checkedData.msg).length > 0 ? true : false;

        // return res.send(checkedData)
        // console.log("======checkedData===========", checkedData)

        // =================================================================
        // =================================================================

        var cbalcheck = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND active_flag='Y'`;
        let total_collectlimite = await F_Select(0, "max_amt,allow_collection_days, (max_amt * allow_collection_days) tot_amt", "md_supervisor", cbalcheck, null, 0);

        // return res.send(total_collectlimite)

        // var totalallowamt = total_collectlimite.msg[0].max_amt * total_collectlimite.msg[0].allow_collection_days;

        var totalallowamt = total_collectlimite.suc > 0 ? total_collectlimite.msg.tot_amt : 0;

        var totalallowamt2 = total_collectlimite.suc > 0 ? total_collectlimite.msg.max_amt : 0;
        // console.log("======totalallowamt===========", totalallowamt2)
        var cbalcheck5 = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND supervisor_trans_no IS NULL`

        let total_collectamttt = await F_Select(0, "NVL(SUM(tot_recov),0) as deposit_amount", "td_collection", cbalcheck5, null, 0);

        // return res.send(total_collectamttt)

        // console.log(value.sec_amt_type, totalallowamt, (total_collectamttt.msg[0].deposit_amount + value.deposit_amount), (value.sec_amt_type == 'M' && (totalallowamt > (total_collectamttt.msg[0].deposit_amount + value.deposit_amount))), 'LALALALALAAAAAAAAAAAAAA');

        if (value.sec_amt_type == 'M' && (totalallowamt > (total_collectamttt.msg.deposit_amount + value.tot_recov))) {
            // console.log("tttttttttttttttttttttttttttttttt")
            if (checkedData) {

                let recpt_no = timestamp; let res_dt = {};
                if (value.pay_mode != 'F') {
                    let fields = '(receipt_no, ardb_id, branch_code, supervisor_code, transaction_date, account_type, product_code, account_number, account_holder_name, intt_calc_flag, intt_calc_dt, recov_dt, tot_recov, remaining_balance, remaining_demand, download_flag, collection_by, collected_at, pay_mode, pay_txn_id, pay_amount, pay_amount_original, currency_code, payment_mode, pay_status, receipt_url)',
                        transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                        values = `('${recpt_no}','${value.ardb_id}','${value.branch_code}','${value.supervisor_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}', '${value.pay_mode}', '${value.pay_txn_id}', '${value.pay_amount}', '${value.pay_amount_original}', '${value.currency_code}', '${value.payment_mode}', '${value.pay_status}', '${value.receipt_url}')`;
                    res_dt = await db_Insert("td_collection", fields, values, null, 0);
                } else {
                    let transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                        recov_dt = dateFormat(value.recov_dt, "yyyy-mm-dd");
                    let fields = 'receipt_no, ardb_id, branch_code, supervisor_code, transaction_date, account_type, product_code, account_number, account_holder_name, intt_calc_flag, intt_calc_dt, recov_dt, tot_recov, remaining_balance, remaining_demand, download_flag, collection_by, collected_at, pay_mode',
                        fieldIndex = `(:0,:1,:2,:3,TO_DATE(:4, 'YYYY-MM-DD'),:5,:6,:7,:8,:9,TO_DATE(:10, 'YYYY-MM-DD'),TO_DATE(:11, 'YYYY-MM-DD'),:12,:13,:14,:15,:16,TO_DATE(:17, 'YYYY-MM-DD'),:18)`,
                        values = [
                            recpt_no,
                            value.ardb_id,
                            value.branch_code,
                            value.supervisor_code,
                            dateFormat(value.transaction_date, "yyyy-mm-dd"),
                            user_ac_info.acc_type,
                            user_ac_info.product_type_code,
                            user_ac_info.product_id,
                            user_ac_info.cust_name,
                            dateFormat(value.intt_calc_dt, 'mm-dd') == '03-31' ? 'N' : 'Y',
                            dateFormat(value.intt_calc_dt, 'yyyy-mm-dd'),
                            dateFormat(value.recov_dt, "yyyy-mm-dd"),
                            value.tot_recov,
                            value.remaining_balance,
                            value.remaining_demand,
                            'N',
                            value.collection_by,
                            dateFormat(datetime, "yyyy-mm-dd"),
                            'F'
                        ];
                    res_dt = await F_Insert(0, "td_collection", fields, fieldIndex, values, null, 0);
                    console.log(res_dt.suc > 0, '--------------', res_dt);

                    if (res_dt.suc > 0) {
                        let fields = 'receipt_no, ardb_id, branch_code, supervisor_code, upload_dt, acc_type, product_type_code, product_type_name, fund_type, product_id, block_id, block_name, service_area_id, service_area_name, vill_id, vill_name, cust_id, cust_name, guardian_name, address, phone_no, curr_intt_rate, ovd_intt_rate, penal_intt_rate, disb_dt, disb_amt, installment_no, periodicity, first_due_date, curr_prn, ovd_prn, curr_intt, ovd_intt, penal_intt, last_intt_calc_dt, other_charges, interest_calc_type, curr_prn_demand, ovd_prn_demand, curr_intt_demand, ovd_intt_demand, penal_intt_demand, intt_calc_flag, intt_calc_dt, curr_intt_calculated, ovd_intt_calculated, penal_intt_calculated, updated_curr_intt, updated_ovd_intt, updated_penal_intt, recov_dt, tot_recov, remaining_balance, remaining_demand, uploaded_by, uploaded_at, collection_by, collected_at',
                            fieldIndex = `(:0,:1,:2,:3,TO_DATE(:4, 'YYYY-MM-DD'),:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21,:22,:23,TO_DATE(:24, 'YYYY-MM-DD'),:25,:26,:27,TO_DATE(:28, 'YYYY-MM-DD'),:29,:30,:31,:32,:33,TO_DATE(:34, 'YYYY-MM-DD'),:35,:36,:37,:38,:39,:40,:41,:42,TO_DATE(:43, 'YYYY-MM-DD'),:44,:45,:46,:47,:48,:49,TO_DATE(:50, 'YYYY-MM-DD'),:51,:52,:53,:54,TO_DATE(:55, 'YYYY-MM-DD'),:56,TO_DATE(:57, 'YYYY-MM-DD'))`,
                            values = [
                                recpt_no,
                                value.ardb_id,
                                value.branch_code,
                                value.supervisor_code,
                                dateFormat(new Date(user_ac_info.upload_dt), "yyyy-mm-dd"),
                                user_ac_info.acc_type,
                                user_ac_info.product_type_code,
                                user_ac_info.product_type_name,
                                user_ac_info.fund_type,
                                user_ac_info.product_id,
                                user_ac_info.block_id,
                                user_ac_info.block_name,
                                user_ac_info.service_area_id,
                                user_ac_info.service_area_name,
                                user_ac_info.vill_id,
                                user_ac_info.vill_name,
                                user_ac_info.cust_id,
                                user_ac_info.cust_name,
                                user_ac_info.guardian_name,
                                user_ac_info.address,
                                user_ac_info.phone_no ? user_ac_info.phone_no : '',
                                user_ac_info.curr_intt_rate,
                                user_ac_info.ovd_intt_rate,
                                user_ac_info.penal_intt_rate,
                                dateFormat(new Date(user_ac_info.disb_dt), "yyyy-mm-dd"),
                                user_ac_info.disb_amt,
                                user_ac_info.installment_no,
                                user_ac_info.periodicity,
                                dateFormat(new Date(user_ac_info.first_due_date), "yyyy-mm-dd"),
                                user_ac_info.curr_prn,
                                user_ac_info.ovd_prn,
                                user_ac_info.curr_intt,
                                user_ac_info.ovd_intt,
                                user_ac_info.penal_intt,
                                dateFormat(new Date(user_ac_info.last_intt_calc_dt), "yyyy-mm-dd"),
                                user_ac_info.other_charges,
                                user_ac_info.interest_calc_type,
                                user_ac_info.curr_prn_demand,
                                user_ac_info.ovd_prn_demand,
                                user_ac_info.curr_intt_demand,
                                user_ac_info.ovd_intt_demand,
                                user_ac_info.penal_intt_demand,
                                value.intt_calc_flag,
                                dateFormat(value.intt_calc_dt, 'yyyy-mm-dd'),
                                value.curr_intt_calculated,
                                value.ovd_intt_calculated,
                                value.penal_intt_calculated,
                                value.updated_curr_intt,
                                value.updated_ovd_intt,
                                value.updated_penal_intt,
                                dateFormat(value.recov_dt, "yyyy-mm-dd"),
                                value.tot_recov,
                                value.remaining_balance,
                                value.remaining_demand,
                                user_ac_info.uploaded_by,
                                dateFormat(user_ac_info.uploaded_at, "yyyy-mm-dd"),
                                value.collection_by,
                                dateFormat(datetime, "yyyy-mm-dd")
                            ];
                        res_dt = await F_Insert(0, "td_coll_acc_dtls", fields, fieldIndex, values, null, 0);
                    }
                }

                // return res.send(res_dt)

                if (res_dt.suc == 1) {
                    let remaining_other_charges = user_ac_info.other_charges > 0 ? value.tot_recov - user_ac_info.other_charges : user_ac_info.other_charges
                    let remaining_recov_bal = value.tot_recov - user_ac_info.other_charges

                    let remaining_penal_intt = remaining_recov_bal > 0 && value.updated_penal_intt > 0 ? (value.updated_penal_intt - remaining_recov_bal) : value.updated_penal_intt
                    remaining_recov_bal = remaining_recov_bal > 0 ? (remaining_recov_bal - value.updated_penal_intt) : 0

                    let remaining_ovd_intt = remaining_recov_bal > 0 && value.updated_ovd_intt > 0 ? (value.updated_ovd_intt - remaining_recov_bal) : value.updated_ovd_intt
                    remaining_recov_bal = remaining_recov_bal > 0 ? (remaining_recov_bal - value.updated_ovd_intt) : 0

                    let remaining_curr_intt = remaining_recov_bal > 0 && value.updated_curr_intt > 0 ? (value.updated_curr_intt - remaining_recov_bal) : value.updated_curr_intt
                    remaining_recov_bal = remaining_recov_bal > 0 ? (remaining_recov_bal - value.updated_curr_intt) : 0

                    let remaining_ovd_prn = remaining_recov_bal > 0 && user_ac_info.ovd_prn > 0 ? (user_ac_info.ovd_prn - remaining_recov_bal) : user_ac_info.ovd_prn
                    remaining_recov_bal = remaining_recov_bal > 0 ? (remaining_recov_bal - user_ac_info.ovd_prn) : 0

                    let remaining_curr_prn = remaining_recov_bal > 0 && user_ac_info.curr_prn > 0 ? (user_ac_info.curr_prn - remaining_recov_bal) : user_ac_info.curr_prn;

                    let setdata = `curr_prn=:0, ovd_prn=:1, curr_intt=:2, ovd_intt=:3, penal_intt=:4, other_charges=:5`,
                        upwhere5 = `account_dtls_id=:6`,
                        upVal = [
                            remaining_curr_prn > 0 ? remaining_curr_prn : 0,
                            remaining_ovd_prn > 0 ? remaining_ovd_prn : 0,
                            remaining_curr_intt > 0 ? remaining_curr_intt : 0,
                            remaining_ovd_intt > 0 ? remaining_ovd_intt : 0,
                            remaining_penal_intt > 0 ? remaining_penal_intt : 0,
                            remaining_other_charges > 0 ? remaining_other_charges : 0,
                            user_ac_info.account_dtls_id];
                    await F_Insert(0, "td_account_dtls", setdata, null, upVal, upwhere5, 1);

                    var ardbDtls = await F_Select(0, `receipt_type`, 'md_ardb', `ardb_id=${value.ardb_id}`, null, 0)

                    let sms_flag = ardbDtls.suc > 0 ? ardbDtls.msg.receipt_type : null
                    sms_flag = sms_flag ? ['S', 'B'].includes(sms_flag) : false

                    var sms_status = false;
                    if (sms_flag) {
                        //send sms
                        let mobile = user_ac_info.phone_no
                        if (mobile > 0) {
                            await transactionSms(mobile, value.deposit_amount, value.account_holder_name, value.total_amount, recpt_no, datetimef, transtype, value.account_number, value.ardb_id, value.product_code)
                                .then((result) => {
                                    console.log("==========---------========", result.data);
                                    sms_status = true;
                                })
                                .catch((error) => {
                                    sms_status = false;
                                    console.error("================================", error);
                                });
                        }
                    }

                    res.json({
                        "success": res_dt,
                        "sms_status": sms_status,
                        "receipt_no": recpt_no,
                        "status": true
                    });

                } else {
                    res.json({
                        "error": "not found error ",
                        "status": false
                    });
                }


            } else {
                res.json({
                    "error": "collection ending",
                    "status": false
                });
            }
        } else if (value.sec_amt_type == 'A' && (totalallowamt2 > (total_collectamttt.msg.deposit_amount + value.deposit_amount))) {
            // =================================================================
            // =================================================================
            if (checkedData) {
                // let select = "receipt_no",
                //where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND transaction_date='${todaydate}' `,
                //     where = `ardb_id=${value.ardb_id} AND transaction_date = '${todaydate}' `,
                //     orderB = `ORDER BY receipt_no DESC `;
                // let resData = await db_Select(select, "td_collection", where, orderB);

                // const recpt_no = (resData.msg[0]) ? ( resData.msg[0].receipt_no + 1):(value.ardb_id.toString() + value.branch_code.toString()  + '1');

                //         SELECT ifnull(max(receipt_no),0) + 1
                // FROM td_collection
                // where ardb_id = 1
                // and   transaction_date = '2023-09-18

                // const recpt_no = (resData.msg[0]) ? (parseInt(resData.msg[0].receipt_no) + 1) : (value.ardb_id.toString() + '1');


                /*   let select = "ifnull(max(receipt_no),0) + 1 AS rc_no",
                       where = `ardb_id=${value.ardb_id} AND transaction_date = '${dateFormat(value.transaction_date, "yyyy-mm-dd")}'`;
                   // orderB = `ORDER BY receipt_no DESC `;
                   let resData = await db_Select(select, "td_collection", where, null);
   
                   console.log("===========rc no ===============", resData)
   
                   const recpt_no = resData.msg[0].rc_no;*/
                let recpt_no = timestamp;
                // console.log("===========rc no ===============", recpt_no)
                let fields = '(receipt_no, ardb_id, branch_code, supervisor_code, transaction_date, account_type, product_code, account_number,account_holder_name, deposit_amount,balance_amount, collection_by, collected_at)',
                    transData = dateFormat(value.transaction_date, "yyyy-mm-dd HH:MM:ss"),
                    values = `('${recpt_no}','${value.ardb_id}','${value.branch_code}','${value.supervisor_code}','${transData}','${value.account_type}','${value.product_code}','${value.account_number}','${value.account_holder_name}','${value.deposit_amount}','${value.total_amount}','${value.collection_by}','${datetime}')`;
                let res_dt = await db_Insert("td_collection", fields, values, null, 0);


                if (res_dt.suc == 1) {
                    //let setdata = `current_balance=${value.total_amount}`,
                    let setdata = `current_balance=current_balance+${value.deposit_amount}`,
                        upwhere5 = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_number='${value.account_number}' AND product_code = '${value.product_code}'`;
                    let upresData5 = await db_Insert("td_account_dtls", setdata, null, upwhere5, 1);

                    let select5 = "mobile_no",
                        where5 = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND account_number='${value.account_number}' `;
                    let resData5 = await db_Select(select5, "td_account_dtls", where5, null);
                    // console.log("===========mobile==============", resData5);
                    var transtype = (value.account_type == 'D') ? "daily deposit" : (value.account_type == 'L') ? "loan" : "";

                    var sms_status = false;

                    //send sms

                    if (resData5.msg[0]) {
                        let mobile = resData5.msg[0].mobile_no

                        await transactionSms(mobile, value.deposit_amount, value.account_holder_name, value.total_amount, recpt_no, datetimef, transtype, value.account_number, value.ardb_id, value.product_code)
                            .then((result) => {
                                console.log("==========---------========", result.data);
                                sms_status = true;
                            })
                            .catch((error) => {
                                sms_status = false;
                                console.error("================================", error);
                            });
                    }
                    res.json({
                        "success": res_dt,
                        "sms_status": sms_status,
                        "receipt_no": recpt_no,
                        "status": true
                    });
                } else {

                    res.json({
                        "error": "not found error ",
                        "status": false
                    });

                }



            } else {
                res.json({
                    "error": "collection ending",
                    "status": false
                });
            }

        } else {
            res.json({
                "error": "Collection limit ending",
                "status": false
            });
        }



    } catch (error) {
        console.log(error);

        res.json({
            "error": "MAIN CATCH",
            "status": false,
            "err_code": error
        });
    }
})

transRouter.post('/total_collection', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var selectCollectionData = "NVL(SUM(TOT_RECOV),0) as deposit_amount"
        whrCollectionDAta = `ardb_id='${value.ardb_id}' AND branch_code='${value.branch_code}'AND supervisor_code ='${value.supervisor_code}' AND supervisor_trans_no IS NULL AND download_flag = 'N'`;
        let total_collection = await F_Select(0, selectCollectionData, "td_collection", whrCollectionDAta, null, 1);
        delete total_collection.sql;
        res.json({
            "success": total_collection,
            "status": true
        });

    } catch (error) {
        res.json({
            "Error": error,
            "status": true
        });
    }
})

transRouter.post('/collection_checked', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        var selectCollectionData = "sl_no, supervisor_trans_no, ardb_id, branch_code, supervisor_code, coll_flag, TO_CHAR(send_date, 'YYYY-MM-DD') send_date, TO_CHAR(received_date, 'YYYY-MM-DD') received_date, end_flag"
        whrCollectionDAta = `ardb_id='${value.ardb_id}' AND branch_code='${value.branch_code}'AND supervisor_code ='${value.supervisor_code}'`,
            order_by = "ORDER BY sl_no DESC FETCH FIRST 1 ROWS ONLY";
        let total_collection = await F_Select(0, selectCollectionData, "md_supervisor_trans", whrCollectionDAta, order_by, 1);
        delete total_collection.sql;
        res.json({
            "data": total_collection,
            "status": true
        });


    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

transRouter.post('/calculate_intt', async (req, res) => {
    try {
        const schema = Joi.object({
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            product_id: Joi.string().required(),
            collection_start_dt: Joi.string().required(),
            calculate_dt: Joi.string().required(),
            curr_intt: Joi.number().required(),
            ovd_intt: Joi.number().required(),
            penal_intt: Joi.number().required(),
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }        

        var chkFinYearFlag = dateFormat(value.calculate_dt, "mm-dd") == '03-31' ? true : false;
                
        var cal_intt = await callLoanInterestProcedure(0, {
            ardb_cd: value.ardb_id.toString(),
            loan_id: value.product_id,
            intt_calc_flag: !chkFinYearFlag ? 'N' : 'Y'
        })

        res.json({
            "success": {
                suc: 1, msg: {
                    curr_intt_calculated: cal_intt.suc > 0 ? cal_intt.AD_CURR_INTT - value.curr_intt : 0,
                    ovd_intt_calculated: cal_intt.suc > 0 ? cal_intt.AD_OVD_INTT - value.ovd_intt : 0,
                    penal_intt_calculated: cal_intt.suc > 0 ? cal_intt.AD_PENAL_INTT - value.penal_intt : 0,
                    curr_intt_demand_calculated: 0,
                    ovd_intt_demand_calculated: 0,
                    penal_intt_demand_calculated: 0
                }
            },
            "status": true
        });

    } catch (error) {
        res.json({
            "Error": error,
            "status": true
        });
    }
})

transRouter.post('/end_collection', async (req, res) => {
    try {
        const schema = Joi.object({
            device_id: Joi.required(),
            user_id: Joi.required(),
            password: Joi.string().required(),
            ardb_id: Joi.number().required(),
            branch_code: Joi.string().required(),
            supervisor_code: Joi.string().required(),
            coll_flag: Joi.string().valid('Y', 'N').required()
        });
        const { error, value } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
        }
        let wheree = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND coll_flag='Y' AND end_flag='N' AND supervisor_trans_no IS NULL`;
        let lastsupervisor_trans = await F_Select(0, "sl_no", "md_supervisor_trans", wheree, null, 1);
        // let transDate = dateFormat(value.transaction_date, "yyyymmdd")

        if (lastsupervisor_trans.suc > 0 && lastsupervisor_trans.msg.length > 0) {
            let currSupTransNo = `${((value.supervisor_code).toString() + (lastsupervisor_trans.msg[0].sl_no).toString()).toString()}`
            let slnoEndTrans = lastsupervisor_trans.msg[0].sl_no;

            let select = "count(*) total_collection",
                where = `ardb_id=${value.ardb_id} AND branch_code='${value.branch_code}' AND supervisor_code='${value.supervisor_code}' AND supervisor_trans_no IS NULL`;
            let resData = await F_Select(0, select, "td_collection", where, null, 0);

            if (resData.msg.total_collection > 0) {
                let selectedReceiptNoQuery = await F_Select(0, 'receipt_no', 'td_collection', where, null, 1)
                console.log(selectedReceiptNoQuery);
                
                let selectedReceiptNo = selectedReceiptNoQuery.suc > 0 ? selectedReceiptNoQuery.msg.map(item => item.receipt_no.toString()).join(',') : '0';

                console.log(selectedReceiptNo, 'RECEIPT NOS---------------');
                


                let dbvalers = `supervisor_trans_no=:0`,
                    dbwhere = `ardb_id=:1 AND branch_code=:2 AND supervisor_code=:3 AND supervisor_trans_no IS NULL`,
                    colVal = [currSupTransNo, value.ardb_id, value.branch_code, value.supervisor_code];
                let update_res = await F_Insert(0, "td_collection", dbvalers, null, colVal, dbwhere, 1);
                if (update_res.suc > 0) {
                    let fields = `supervisor_trans_no =:0, coll_flag=:1, received_date=TO_DATE(:2, 'YYYY-MM-DD'), end_flag=:3`,
                        wherre = `ardb_id=:4 AND branch_code=:5 AND supervisor_code=:6 AND coll_flag=:7 AND end_flag=:8 AND supervisor_trans_no IS NULL`,
                        transVal = [currSupTransNo, 'N', dateFormat(new Date(), "yyyy-mm-dd"), 'Y', value.ardb_id, value.branch_code, value.supervisor_code, 'Y', 'N'];
                    let res_dt = await F_Insert(0, "md_supervisor_trans", fields, null, transVal, wherre, 1);

                    let colTabValues = `trf_flag=:0`,
                        colTabWhr = `receipt_no IN (${selectedReceiptNo})`,
                        colTabVal = ['P'];
                    let update_res = await F_Insert(0, "TD_COLL_ACC_DTLS", colTabValues, null, colTabVal, colTabWhr, 1);

                    res.json({
                        "success": res_dt,
                        "status": true
                    });
                } else {
                    res.json({
                        "error": "Error while updating supervisor collection.",
                        "status": false
                    });
                }
            } else {
                var nfields = `coll_flag=:0, received_date=TO_DATE(:1, 'YYYY-MM-DD'), end_flag=:2`,
                    nwhere = `ardb_id=:3 AND branch_code=:4 AND supervisor_code=:5 AND coll_flag=:6 AND end_flag=:7 AND supervisor_trans_no IS NULL`,
                    transVal = ['N', dateFormat(new Date(), "yyyy-mm-dd"), 'Y', value.ardb_id, value.branch_code, value.supervisor_code, 'Y', 'N'];
                var nres_dt = await F_Insert(0, "md_supervisor_trans", nfields, null, transVal, nwhere, 1);
                res.json({
                    "success": nres_dt,
                    "status": true
                });
            }
        } else {
            res.json({
                "error": "No data found in supervisor transaction.",
                "status": false
            });
        }

    } catch (error) {
        res.json({
            "error": "Something went wrong. Please try again later.",
            "status": false,
        });
    }
})

module.exports = { transRouter }