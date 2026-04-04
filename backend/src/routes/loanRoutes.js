const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { requireRole } = require('../middleware/rbac')
const {
  requestLoan, getLoans, getMyLoans,
  approveLoan, rejectLoan, repayLoan, markManualDisbursement
} = require('../controllers/loanController')

router.post('/request', protect, requestLoan)
router.get('/:chamaId', protect, requireRole('admin', 'treasurer'), getLoans)
router.get('/:chamaId/my', protect, getMyLoans)
router.patch('/:chamaId/loans/:loanId/approve', protect, requireRole('admin'), approveLoan)
router.patch('/:chamaId/loans/:loanId/reject', protect, requireRole('admin'), rejectLoan)
router.post('/:chamaId/loans/:loanId/repay', protect, repayLoan)
router.patch('/loans/:loanId/manual-disburse', protect, markManualDisbursement)

module.exports = router