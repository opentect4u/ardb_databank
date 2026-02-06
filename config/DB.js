 const mysql = require('mysql2');

 const db = mysql.createPool({
     connectionLimit: 10,
     host: process.env.MYSQL_HOST,
     user: process.env.MYSQL_USER,
     password: process.env.MYSQL_PASS,
     database: process.env.MYSQL_DB,
 });

 db.getConnection((err, connection) => {
     if(err) console.log(err);
    connection.release();
    return;
 });

 module.exports = db;