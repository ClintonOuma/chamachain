const AuditLog = require('../models/AuditLog')

/**
 * Logs a system or user action for auditing purposes.
 * @param {Object} params - The log parameters
 * @param {string} params.performedBy - User ID of the actor
 * @param {string} params.action - Action name (e.g., 'LOAN_REQUEST', 'LOGIN')
 * @param {string} [params.chamaId] - Related Chama ID
 * @param {string} [params.targetUserId] - Target User ID (if applicable)
 * @param {Object} [params.metadata] - Extra context info
 */
const logAction = async ({ chamaId = null, performedBy, action, targetUserId = null, metadata = {} }) => {
  try {
    const log = await AuditLog.create({ 
      chamaId, 
      performedBy, 
      action: action.toUpperCase(), 
      targetUserId, 
      metadata: {
        ...metadata,
        timestamp: new Date(),
      }
    })
    return log
  } catch (err) {
    // We don't want audit logging to crash the main request, but we should know it failed
    console.error(`[AuditLog Error] Failed to log action ${action}:`, err.message)
    return null
  }
}

module.exports = { logAction }

