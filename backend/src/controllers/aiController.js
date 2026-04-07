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
    const response = await axios.get(`${AI_SERVICE_URL}/ai/credit-score/${userId}/${chamaId}`, { timeout: 30000 })
    return res.json(response.data)
  } catch (err) {
    console.error('AI Service Error:', err.message)
    return res.status(503).json({ success: false, message: 'AI service unavailable. Please try again in 30 seconds.' })
  }
}

const getGroupHealth = async (req, res) => {
  try {
    const { chamaId } = req.params
    const response = await axios.get(`${AI_SERVICE_URL}/ai/group-health/${chamaId}`, { timeout: 30000 })
    return res.json(response.data)
  } catch (err) {
    console.error('AI group-health error:', err.message)
    return res.status(503).json({ success: false, message: 'AI service unavailable. Please try again.' })
  }
}

const getLoanRisk = async (req, res) => {
  try {
    const { loanId } = req.params
    const response = await axios.get(`${AI_SERVICE_URL}/ai/loan-risk/${loanId}`, { timeout: 30000 })
    return res.json(response.data)
  } catch (err) {
    console.error('AI loan-risk error:', err.message)
    return res.status(503).json({ success: false, message: 'AI service unavailable. Please try again.' })
  }
}

module.exports = {
  getCreditScore,
  getGroupHealth,
  getLoanRisk
}
