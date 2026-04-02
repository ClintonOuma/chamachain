const mongoose = require('mongoose')
const axios = require('axios')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Chama = require('../models/Chama')

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

function toObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(String(id))
    : null
}

const getCreditScore = async (req, res) => {
  try {
    const { userId, chamaId } = req.params
    
    const response = await axios.get(`${AI_SERVICE_URL}/ai/credit-score/${userId}/${chamaId}`)
    return res.json({
      success: true,
      analysis: response.data.analysis
    })
  } catch (err) {
    console.error('AI Service Error:', err.message)
    // Fallback logic if AI service is down
    return res.status(500).json({ success: false, message: 'AI Service currently unavailable' })
  }
}

const getGroupHealth = async (req, res) => {
  try {
    const { chamaId } = req.params
    const response = await axios.get(`${AI_SERVICE_URL}/ai/group-health/${chamaId}`)
    return res.json({
      success: true,
      health: response.data.health
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI Service currently unavailable' })
  }
}

const getLoanRisk = async (req, res) => {
  try {
    const { loanId } = req.params
    const response = await axios.get(`${AI_SERVICE_URL}/ai/loan-risk/${loanId}`)
    return res.json({
      success: true,
      risk: response.data.risk
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: 'AI Service currently unavailable' })
  }
}

module.exports = {
  getCreditScore,
  getGroupHealth,
  getLoanRisk
}
