const indexAdminRouter = require('express').Router();
const { authCheckForLogin, setUserMiddleware, authenticateToken } = require('../../middleware/authMiddleware');

indexAdminRouter.use('/login', authCheckForLogin, setUserMiddleware, require('./authRouter').authRouter);
indexAdminRouter.use('/dashboard', authenticateToken, setUserMiddleware, require('./dashboardRouter').dashAdminRouter);
indexAdminRouter.use('/branch', authenticateToken, setUserMiddleware, require('./branchRouter').brnRouter);
indexAdminRouter.use('/supervisor', authenticateToken, setUserMiddleware, require('./supervisorRouter').supervisorRouter);
indexAdminRouter.use('/operation', authenticateToken, setUserMiddleware, require('./uploadPCTXRouter') .uploadPctxRouter)
indexAdminRouter.use('/pcrx', authenticateToken, setUserMiddleware, require('./downloadPCRX').downloadPcrx)
indexAdminRouter.use('/common', authenticateToken, setUserMiddleware, require('./commonRouter').commonRouter)
indexAdminRouter.use('/show_upload_account', authenticateToken, setUserMiddleware, require('./viewAcRouter').viewAcRouter)
indexAdminRouter.use('/report', authenticateToken, setUserMiddleware, require('./reportRouter').reportRouter)

module.exports = {indexAdminRouter};