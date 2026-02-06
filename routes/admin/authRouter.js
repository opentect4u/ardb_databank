const authRouter = require('express').Router();
const { db_Select } = require('../../model/MySqlModule');
const bcrypt = require('bcrypt');
const dateFormat = require('dateformat');
const { createToken } = require('../../middleware/authMiddleware');

authRouter.get('/', (req, res) => {
    res.render('auth/login')
})

authRouter.post('/', async (req, res) => {
    const { email, password } = req.body;
    var whr = `user_id='${email}' AND active_flag='Y' AND user_type IN ('A', 'B', 'R')`;
    let res_dt = await db_Select('password,user_type', "md_user", whr, null);
    delete res_dt.sql;


    if (res_dt.msg[0] && await bcrypt.compare(password, res_dt.msg[0].password)) {

        if (res_dt.msg[0].user_type == 'R') {
            var table_name = "md_user a,md_ardb b,md_branch c",
                whrDAta = `a.ardb_id=b.ardb_id AND a.branch_code=c.branch_code AND b.ardb_id=c.ardb_id AND a.user_id='${email}' AND a.active_flag='Y'`,
                selectData = "a.user_type,c.branch_address,c.email_id email,c.phone_no mobile,a.id, a.ardb_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic , c.branch_name,c.contact_person person,b.*";
        } else if (res_dt.msg[0].user_type == 'B') {
            var table_name = "md_user a,md_ardb b",
                whrDAta = `a.ardb_id=b.ardb_id AND a.user_id='${email}' AND a.active_flag='Y'`,
                selectData = "a.user_type,a.id, a.ardb_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic,b.*";
        } else if (res_dt.msg[0].user_type == 'A') {
            var table_name = "md_user a",
                whrDAta = `a.user_id='${email}' AND a.active_flag='Y'`,
                selectData = "a.user_type,a.id, a.ardb_id, a.branch_code, a.device_sl_no, a.device_id, a.user_id, a.pin_no, a.profile_pic";
        }

        let user_data = await db_Select(selectData, table_name, whrDAta, null);

        console.log(user_data); 

        // LEFT JOIN table2 ON table1.column_name = table2.column_name;
        // var table_name = "td_logo",
        //     where = `bank_id='${user_data.msg[0].bank_id}'`,
        //     select = 'file_path'

        let logo_data = {suc: 0, msg: []} // await db_Select(select, 'td_logo', where, null);
        
        delete user_data.sql;

        const datetime = dateFormat(new Date(), "dd/mm/yyyy hh:MM:ss")
        req.session['user'] = { user_data, logo_data, datetime }

        const token = await createToken({ user_data, logo_data, datetime })
        res.cookie('auth_token', token, { httpOnly: true, secure: false });

        if (res_dt.msg[0].user_type == 'A') {
            res.redirect('/super-admin/summary')
        } else {
            req.flash('success', 'login successful')
            res.redirect('/admin/dashboard')
        }
    } else {
        req.flash('error', 'Invalid username or password or Deactivate By Admin')
        res.redirect('/admin/login')
    }
})

authRouter.get('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/admin/login');
});

module.exports = {authRouter};