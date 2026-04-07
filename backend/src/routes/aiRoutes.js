const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { getCreditScore, getGroupHealth, getLoanRisk } = require('../controllers/aiController')
const axios = require('axios')

const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'

router.get('/credit-score/:userId/:chamaId', protect, getCreditScore)
router.get('/group-health/:chamaId', protect, getGroupHealth)
router.get('/loan-risk/:loanId', protect, getLoanRisk)

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_URL}/health`, { timeout: 10000 })
    res.json(response.data)
  } catch (err) {
    res.status(503).json({ success: false, message: 'AI service unavailable' })
  }
})

module.exports = router