const brnRouter = require('express').Router();
const { getBranchList } = require('../../model/BranchModule');
const { db_Select } = require('../../model/MySqlModule');

brnRouter.get('/', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        const resData = await getBranchList(user_data.ardb_id, user_data.user_type);
        delete resData.sql
        var viewData = {
            title: "Branch",
            page_path: "/branch/listbranch",
            data: resData
        };
        res.render('admin/branch/view', viewData)
    } catch (error) {
        res.json({
            "error": error,
            "status": false
        });
    }
})

brnRouter.get('/edit/:id', async (req, res) => {
    const id = req.params.id || 0;
    const user_data = req.user.user_data.msg[0];

    const resData = id > 0 ? await getBranchList(user_data.ardb_id, user_data.user_type, id) : { suc: 1, msg: [] };

    delete resData.sql
    var viewData = {
        title: "Edit Branch",
        data: resData.msg
    };
    res.render('admin/branch/edit', viewData)
})

brnRouter.get('/get_brn_list_ajax', async (req, res) => {
    try {
        const user_data = req.user.user_data.msg[0];
        const resData = await getBranchList(user_data.ardb_id, user_data.user_type);
        // console.log("======///////////=======",resData)
        delete resData.sql
        res.send(resData);
    } catch (error) {
        res.json({
            suc: 0,
            "error": error
        });
    }
})

module.exports = {brnRouter}