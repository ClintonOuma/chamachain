const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { requireSuperAdmin } = require('../middleware/superAdmin')
const {
  getStats, getAllUsers, getAllChamas,
  suspendUser, unsuspendUser, freezeAnyChama,
  deleteUser, promoteSuperAdmin, revokeSuperAdmin,
  getAuditLogs, getAllTransactions
} = require('../controllers/superAdminController')

// All routes require auth + super admin
router.use(protect, requireSuperAdmin)

router.get('/stats', getStats)
router.get('/users', getAllUsers)
router.get('/chamas', getAllChamas)
router.get('/logs', getAuditLogs)
router.get('/transactions', getAllTransactions)
router.patch('/users/:userId/suspend', suspendUser)
router.patch('/users/:userId/unsuspend', unsuspendUser)
router.delete('/users/:userId', deleteUser)
router.patch('/chamas/:chamaId/freeze', freezeAnyChama)
router.patch('/users/:userId/promote-super-admin', promoteSuperAdmin)
router.patch('/users/:userId/revoke-super-admin', revokeSuperAdmin)

module.exports = router