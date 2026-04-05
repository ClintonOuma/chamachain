const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const axios = require('axios')

const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'

router.get('/credit-score/:userId/:chamaId', protect, async (req, res) => {
  try {
    const { userId, chamaId } = req.params
    const response = await axios.get(
      `${AI_URL}/ai/credit-score/${userId}/${chamaId}`,
      { timeout: 30000 }
    )
    res.json(response.data)
  } catch (err) {
    console.error('AI credit-score error:', err.message)
    res.status(503).json({
      success: false,
      message: 'AI service unavailable. Please try again in 30 seconds.'
    })
  }
})

router.get('/group-health/:chamaId', protect, async (req, res) => {
  try {
    const { chamaId } = req.params
    const response = await axios.get(
      `${AI_URL}/ai/group-health/${chamaId}`,
      { timeout: 30000 }
    )
    res.json(response.data)
  } catch (err) {
    console.error('AI group-health error:', err.message)
    res.status(503).json({
      success: false,
      message: 'AI service unavailable. Please try again.'
    })
  }
})

router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${AI_URL}/health`, { timeout: 10000 })
    res.json(response.data)
  } catch (err) {
    res.status(503).json({ success: false, message: 'AI service unavailable' })
  }
})

module.exports = router