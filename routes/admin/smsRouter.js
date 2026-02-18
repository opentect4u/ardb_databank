const smsRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat');
const { F_Insert, F_Select } = require('../../model/OrcModel');
const { getArdbDetails, getArdbrDtls } = require('../../model/ArdbModule');

const getSmsList = (ardb_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let select = 'ardb_id,template',
                table_name = 'md_sms',
                whr = `ardb_id = '${ardb_id}'`;
            const res_dt = await F_Select(0, select, table_name, whr, null, 1)
            resolve(res_dt);
        } catch (err) {
            resolve({ suc: 0, msg: err });
        }
    })
}

smsRouter.get('/', async (req, res) => {
 try{
 const user_data = req.user.user_data.msg[0];

 let req_data = req.query.enc_dt ? Buffer.from(req.query.enc_dt, 'base64').toString() : null;
 req_data = req_data ? JSON.parse(req_data) : null 

 const selected = {
 flag: req_data ? req_data.flag : 'Y'
 } 

 const ardbList = await getArdbDetails(user_data.user_type == 'A' ? 0 : user_data.ardb_id);

 var viewData = {
     title: "SMS Details",
     page_path: "/sms/listsms",
     ardb: ardbList,
     selected: selected
 };
 res.render('admin/sms/view', viewData)
 }catch(error){
    res.json({
    "error": error,
    "status": false
    });
 }
});

smsRouter.get('/add', async (req, res) => {
    
    const user_data = req.user.user_data.msg[0];
    const ardbList = await getArdbDetails(user_data.user_type == 'A' ? 0 : user_data.ardb_id);
 
    var viewData = {
        title: 'Add SMS Template',
        ardb: ardbList
    };
    res.render("admin/sms/add", viewData);
});

smsRouter.post('/edit', async (req, res) => {
    try {
            const schema = Joi.object({
                ardb_id: Joi.string(),
                sms: Joi.required()
            });
            const { error, value } = schema.validate(req.body, { abortEarly: false });

            if (error) {
            const errors = {};
            error.details.forEach(detail => {
                errors[detail.context.key] = detail.message;
            });
            return res.json({ error: errors });
            }

        const user_data = req.user.user_data.msg[0],        
        currDt = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");

        var smsFields = `ardb_id, template`,
        smsFldIndex = `(:0, :1)`,
        smsValues = [value.ardb_id, value.sms],
        smsWhere = null,
        smsFlag = 0;
        var res_dt = await F_Insert(0, "md_sms", smsFields, smsFldIndex, smsValues, smsWhere, smsFlag);
        
        if (res_dt.suc > 0){
            req.flash('success', 'SMS Added Successfully')
        }else{
            req.flash('error', 'Error in SMS Added')
        }
        res.redirect('/admin/sms')
        } catch (error) {
        console.log(error);
        
        res.json({
            "error": error,
            "status": false
        });
    }

});

smsRouter.get('/get_sms_list_ajax', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];

         const ardb_id =
            req.query.ardb_id && req.query.ardb_id != 0
                ? req.query.ardb_id
                : user_data.ardb_id;

        const resData = await getSmsList(ardb_id);
        delete resData.sql
        res.send(resData);
    } catch (error) {
        res.json({
            suc: 0,
            "error": error
        });
    }
})

module.exports = {smsRouter}