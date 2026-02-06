const db = require("../config/DB");

const db_Select = (select, table_name, whr, order, full_query='', full_query_flag=false) => {
    var tb_whr = whr ? `WHERE ${whr}` : "";
    var tb_order = order ? order : "";
    let sql = !full_query_flag ? `SELECT ${select} FROM ${table_name} ${tb_whr} ${tb_order}` : full_query;
    // console.log(sql);
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                data = { suc: 0, msg: JSON.stringify(err), sql };
            } else {
                data = { suc: 1, msg: result, sql };
            }
            resolve(data);
        });
    });
};

const db_Insert = (table_name, fields, values, whr, flag, full_insert = false, full_insert_sql = '') => {
    var sql = "",
        msg = "",
        tb_whr = whr ? `WHERE ${whr}` : "";
    // 0 -> INSERT; 1 -> UPDATE
    // IN INSERT flieds ARE TABLE COLOUMN NAME ONLY || IN UPDATE fields ARE TABLE NAME = VALUES
    if (flag > 0) {
        sql = `UPDATE ${table_name} SET ${fields} ${tb_whr}`;
        msg = "Updated Successfully !!";
    } else {
        sql = `INSERT INTO ${table_name} ${!full_insert ? `${fields} VALUES ${values}` : full_insert_sql}`;
        msg = "Inserted Successfully !!";
    }
    // console.log(sql);
    return new Promise((resolve, reject) => {
        db.query(sql, (err, lastId) => {
            if (err) {
                console.log(err);
                data = { suc: 0, msg: JSON.stringify(err), lastId:0 };
            } else {
                data = { suc: 1, msg: msg, lastId };
            }
            resolve(data);
        });
    });
};

const db_Delete = (table_name, whr) => {
    whr = whr ? `WHERE ${whr}` : "";
    var sql = `DELETE FROM ${table_name} ${whr}`;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, lastId) => {
            if (err) {
                console.log(err);
                data = { suc: 0, msg: JSON.stringify(err) };
            } else {
                data = { suc: 1, msg: "Deleted Successfully !!" };
            }
            resolve(data);
        });
    });
};

const db_Check = async (fields, table_name, whr) => {
    var sql = `SELECT ${fields} FROM ${table_name} WHERE ${whr}`;
    // console.log(sql);
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                data = { suc: 0, msg: JSON.stringify(err) };
            } else {
                data = { suc: 1, msg: result.length };
            }
            resolve(data);
        });
    });
};

const db_db_Select_Sqery = (sql) => {
    // let sql = sql;
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                console.log(err);
                data = { suc: 0, msg: JSON.stringify(err), sql };
            } else {
                data = { suc: 1, msg: result, sql };
            }
            resolve(data);
        });
    });
};

const createStrWithZero_old = (tot_row, str, chr_pad_with, flag) => { // S -> Suffix; P-> Prefix
    return new Promise((resolve, reject) => {
        console.log(str);
        let tot_char_len = str.split('').length,finalStr = '';
        console.log(tot_char_len, 'len', (tot_row-tot_char_len), 'minus', str.length);
        for(let i = tot_char_len; i < tot_row; i++){
            finalStr = finalStr.toString() + chr_pad_with.toString()
        }
        console.log(finalStr);
        if(flag != 'S'){
            finalStr = finalStr + str
        }else{
            finalStr = str + finalStr
        }
        resolve(finalStr)
    })
}

const createStrWithZero = (tot_row, str, chr_pad_with, flag) => { // S -> Suffix; P-> Prefix
    return new Promise((resolve, reject) => {
        // console.log(str);
        let tot_char_len = str.split('').length,
        finalStr = '';
        // console.log(tot_char_len, 'len', (tot_row-tot_char_len), 'minus', str.length);
        if (tot_row > tot_char_len){
            for (let i = tot_char_len; i < tot_row; i++) {
              finalStr = finalStr.toString() + chr_pad_with.toString();
            }
            // console.log(finalStr);
            if(flag != 'S'){
                finalStr = finalStr + str
            }else{
                finalStr = str + finalStr
            }
            resolve(finalStr)
        }else if (tot_row == tot_char_len) {
            resolve(str);
        }else if (tot_row < tot_char_len) {
            finalStr = str.substr(-tot_row)
            resolve(finalStr);
        }else{
            resolve(str)
        }
    })
}

const MAX_DATE_COL_ENTRY_FLAG = {
    'D': 'Days',
    'R': 'Date Range'
}

const PRINTER_TYPE_MASTER = {
    'ESCPOS': 'ESCPOS',
    'PAXA910': 'PAXA910'
}

module.exports = { db_Select, db_Insert, db_Delete, db_Check, db_db_Select_Sqery, createStrWithZero, MAX_DATE_COL_ENTRY_FLAG }