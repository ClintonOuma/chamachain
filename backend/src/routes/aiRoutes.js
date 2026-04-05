const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/auth')
const { getCreditScore, getGroupHealth } = require('../controllers/aiController')

router.get('/credit-score/:userId/:chamaId', protect, getCreditScore)
router.get('/group-health/:chamaId', protect, getGroupHealth)

module.exports = router
