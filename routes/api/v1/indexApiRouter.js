const indexApiRouter = require('express').Router()
const { acRouter } = require('./acDtlsRouter')
const { reportRouter } = require('./reportRouter')
const { transRouter } = require('./transactionRouter')
const { userRouter } = require('./userRouter')

indexApiRouter.use(userRouter)
indexApiRouter.use(acRouter)
indexApiRouter.use(transRouter)
indexApiRouter.use(reportRouter)

module.exports = {indexApiRouter}