const { F_Select } = require("./OrcModel");

const getBlockList = (ardb_id, block_id=0) => {
    return new Promise(async (resolve, reject) => {
        try{
            let select = '*',
                table_name = 'md_block',
                whr = `ardb_id = ${ardb_id} ${block_id > 0 ? `AND block_id = ${block_id}` : ''}`;
            const res_dt = await F_Select(0, select, table_name, whr, null, 1)
            resolve(res_dt);
        }catch(err){
            resolve({suc: 0, msg: err})
        }
    })
}

const getServiceAreaList = (ardb_id, block_id, service_area_id = 0) => {
    return new Promise(async (resolve, reject) => {
        try {
            let select = 'a.*, b.block_name',
                table_name = 'md_service_area a, md_block b',
                whr = `a.ardb_id=b.ardb_id AND a.block_id=b.block_id AND a.ardb_id = ${ardb_id} AND a.block_id = ${block_id} ${service_area_id > 0 ? `AND a.service_area_id = ${service_area_id}` : ''}`;
            const res_dt = await F_Select(0, select, table_name, whr, null, 1)
            resolve(res_dt);
        } catch (err) {
            resolve({ suc: 0, msg: err })
        }
    })
}

const getVillageList = (ardb_id, block_id, service_area_id, vill_id = 0) => {
    return new Promise(async (resolve, reject) => {
        try {
            let service_area = Array.isArray(service_area_id) ? service_area_id.join(',') : service_area_id
            let select = 'a.*, b.service_area_name, c.block_name',
                table_name = 'md_village a, md_service_area b, md_block c',
                whr = `a.ardb_id=b.ardb_id AND a.block_id=b.block_id AND a.service_area_id=b.service_area_id AND a.ardb_id=c.ardb_id AND a.block_id=c.block_id AND a.ardb_id = ${ardb_id} AND a.block_id = '${block_id}' AND a.service_area_id IN(${service_area_id}) ${vill_id > 0 ? `AND a.vill_id = '${vill_id}'` : ''}`;
            const res_dt = await F_Select(0, select, table_name, whr, null, 1)
            resolve(res_dt);
        } catch (err) {
            resolve({ suc: 0, msg: err })
        }
    })
}

const PRINTER_TYPE_MASTER = {
    'ESCPOS': 'ESCPOS',
    'PAXA910': 'PAXA910'
}

const PRINTER_OPT_MASTER = {
    '2': '2 Inch.',
    '3': '3 Inch.'
}

module.exports = { PRINTER_TYPE_MASTER, PRINTER_OPT_MASTER, getBlockList, getServiceAreaList, getVillageList }