const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  initiateSTKPush,
  stkCallback,
  checkSTKStatus,
  disburseLoan,
  b2cCallback
} = require('../controllers/mpesaController')

router.post('/stk-push', protect, initiateSTKPush)
router.post('/callback', stkCallback)
router.get('/status/:contributionId', protect, checkSTKStatus)
router.post('/disburse', protect, disburseLoan)
router.post('/b2c-callback', b2cCallback)

module.exports = router