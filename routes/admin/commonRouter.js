const { getBlockList, getServiceAreaList, getVillageList } = require('../../model/CommonModel')

const commonRouter = require('express').Router()

commonRouter.get('/get_block_list', async (req, res) => {
    const ardb_id = req.query.ardb_id
    let res_dt = await getBlockList(ardb_id)
    res.send(res_dt)
})

commonRouter.get('/get_service_area_list', async (req, res) => {
    const data = req.query
    let res_dt = await getServiceAreaList(data.ardb_id, data.block_id)
    res.send(res_dt)
})

commonRouter.get('/get_village_list', async (req, res) => {
    const data = req.query
    let res_dt = await getVillageList(data.ardb_id, data.block_id, data.service_area_id)
    res.send(res_dt)
})

module.exports = {commonRouter}