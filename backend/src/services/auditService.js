const AuditLog = require('../models/AuditLog')

const logAction = async ({ chamaId = null, performedBy, action, targetUserId = null, metadata = {} }) => {
  try {
    await AuditLog.create({ chamaId, performedBy, action, targetUserId, metadata })
  } catch (err) {
    console.error('Audit log error:', err.message)
  }
}

module.exports = { logAction }
