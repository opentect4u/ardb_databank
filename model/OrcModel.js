// VARIABLE & MODULE INITIALIZATION
const db_details = require("../config/conString"),
    oracledb = require("oracledb");

try {
    oracledb.initOracleClient({ libDir: "C:\\instantclient_11_2" });
} catch (err) {
    console.error("Oracle Client Error:");
    console.error(err);
    process.exit(1);
}

oracledb.autoCommit = true;

// POOL MANAGER TO REUSE CONNECTIONS
const pools = {};

const getPool = async (db_id) => {
    if (!pools[db_id]) {
        if (!db_details[db_id]) {
            throw new Error(`Database configuration for ID ${db_id} not found.`);
        }
        console.log(`Initializing pool for DB ID: ${db_id}`);
        pools[db_id] = await oracledb.createPool(db_details[db_id]);
    }
    return pools[db_id];
};

const getConnection = async (db_id) => {
    const pool = await getPool(db_id);
    return await pool.getConnection();
};
// END

const keysToLowerCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToLowerCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key.toLowerCase()] = keysToLowerCase(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

// FUNCTION FOR EXICUTE SELECT QUERY AND RETURN RESULT
const F_Select = async (db_id, fields, table_name, where, order, flag, full_query = null) => {
    let con;
    try {
        where = where ? `WHERE ${where}` : '';
        order = order ? order : '';

        con = await getConnection(db_id);

        let sql = `SELECT ${fields} FROM ${table_name} ${where} ${order}`;

        // console.log(sql);
        // oracledb.fetchAsString = [oracledb.DATE, oracledb.TIMESTAMP];

        const result = await con.execute(full_query ? full_query : sql, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        let rs = result.resultSet;
        let data = flag > 0 ? await rs.getRows() : await rs.getRow(); // 0-> Single DataSet; 1-> Multiple DataSet

        await rs.close(); // Important to close result sets
        
        data = keysToLowerCase(data)
        
        data = flag > 0
            ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
            : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' });

        return data;
    } catch (err) {
        console.error("F_Select Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close(); // Released back to pool
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

// FUNCTION FOR INSERT DATA TO DATABASE
const F_Insert = async (db_id, table_name, fields, fieldIndex, values, where, flag) => {
    let con;
    try {
        con = await getConnection(db_id);

        const sql = flag > 0
            ? `UPDATE ${table_name} SET ${fields} WHERE ${where}`
            : `INSERT INTO ${table_name} (${fields}) VALUES ${fieldIndex}`;

        console.log(sql, values);
        

        const result = await con.execute(sql, values, { autoCommit: true });

        return { suc: 1, msg: 'success' };
    } catch (err) {
        console.error("F_Insert Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const F_Insert_Puri = async (db_id, table_name, fields, val, values, where, flag) => {
    let con;
    try {
        con = await getConnection(db_id);

        const sql = flag > 0
            ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}`
            : `INSERT INTO "${table_name}" ${fields} VALUES (:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, :15, :16, :17, :18, :19, :20, :21, :22, :23, :24, :25, :26, :27, :28, :29, :30)`;

        await con.execute(sql, values, { autoCommit: true });
        return { suc: 1, msg: 'success' };
    } catch (err) {
        console.error("F_Insert_Puri Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const RunProcedure = async (db_id, pro_query, table_name, fields, where, order) => {
    let con;
    try {
        where = where ? `WHERE ${where}` : '';
        order = order ? order : '';

        con = await getConnection(db_id);

        await con.execute(`ALTER SESSION SET NLS_DATE_FORMAT = 'DD/MM/YYYY'`);
        await con.execute(pro_query);

        const r = await con.execute(`SELECT ${fields} FROM ${table_name} ${where} ${order}`, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        let rs = r.resultSet;
        const data = await rs.getRows();
        await rs.close();

        return data;
    } catch (err) {
        console.error("RunProcedure Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const Api_Insert = async (db_id, table_name, fields, fieldIndex, values, where, flag) => {
    let con;
    try {
        con = await getConnection(db_id);

        const sql = flag > 0
            ? `UPDATE "${table_name}" SET ${fields} WHERE ${where}`
            : `INSERT INTO "${table_name}" (${fields}) VALUES ${fieldIndex}`;

        await con.execute(sql, values, { autoCommit: true });
        return { suc: 1, msg: 'success' };
    } catch (err) {
        console.error("Api_Insert Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const SendNotification = async () => {
    const db_id = 5;
    const flag = 1;
    let con;
    try {
        con = await getConnection(db_id);

        let sql = `SELECT SL_NO, NARRATION, SEND_USER_ID, VIEW_FLAG, CREATED_DT FROM td_notification order by sl_no desc`;

        const result = await con.execute(sql, [], {
            resultSet: true,
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        let rs = result.resultSet;
        let data = await rs.getRows();
        await rs.close();

        const response = flag > 0
            ? (data.length > 0 ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' })
            : (data ? { suc: 1, msg: data } : { suc: 0, msg: 'No Data Found' });

        return response;
    } catch (err) {
        console.error("SendNotification Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const F_Delete = async (db_id, table_name, where) => {
    let con;
    try {
        con = await getConnection(db_id);

        const sql = `DELETE FROM ${table_name} WHERE ${where}`;
        const result = await con.execute(sql, [], { autoCommit: true });

        const rs = result.rowsAffected;
        return rs > 0 ? { suc: 1, msg: 'Deleted Successfully' } : { suc: 0, msg: 'Error in deletion' };
    } catch (err) {
        console.error("F_Delete Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

const F_insert_bulk_data = async (db_id, binds) => {
    let con;
    try {
        con = await getConnection(db_id);

        const sql = `INSERT INTO TD_COLLECTION (receipt_no, agent_trans_no, bank_id, branch_code, agent_code, transaction_date, account_type, product_code, account_number, account_holder_name, deposit_amount, download_flag, collection_by, collected_at) VALUES(:a, :b, :c, :d, :e, :f, :g, :h, :i, :j, :k,:l,:m,:n)`;
        const options = {
            batchErrors: false,
            autoCommit: true
        };

        await con.executeMany(sql, binds, options);
        return { suc: 1, msg: 'success' };
    } catch (err) {
        console.error("F_insert_bulk_data Error:", err);
        return { suc: 0, msg: err.message || err };
    } finally {
        if (con) {
            try {
                await con.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
};

module.exports = {
    F_Select,
    F_Insert,
    RunProcedure,
    F_Insert_Puri,
    Api_Insert,
    SendNotification,
    F_Delete,
    F_insert_bulk_data
};
