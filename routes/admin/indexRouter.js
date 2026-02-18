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
indexAdminRouter.use('/ardb', authenticateToken, setUserMiddleware, require('./ardbRouter').ardbRouter)
indexAdminRouter.use('/sms', authenticateToken, setUserMiddleware, require('./smsRouter').smsRouter)
indexAdminRouter.use('/about', authenticateToken, setUserMiddleware, require('./app_versionRouter').app_versionRouter)
indexAdminRouter.use('/password', authenticateToken, setUserMiddleware, require('./change_pwdRouter').change_pwdRouter)
indexAdminRouter.use('/profile', authenticateToken, setUserMiddleware, require('./profileRouter').profileRouter)

module.exports = {indexAdminRouter};