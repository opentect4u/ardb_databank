const app_versionRouter = require('express').Router();
const Joi = require('joi'),
dateFormat = require('dateformat');
const { F_Insert, F_Select } = require('../../model/OrcModel');

app_versionRouter.get('/', async (req, res) => {
   var version_data = await F_Select(0, 'app_version,app_download_link', 'md_app_version', null, null, 1)
  const viewData = {
    title: "About",
    page_path: "/about/app_version",
    data: version_data,
  };
  // console.log(viewData);
  res.render("admin/about/app_version", viewData);
});

module.exports = {app_versionRouter}