const jwt = require('jsonwebtoken')
const { getJwtAccessSecret, getJwtRefreshSecret } = require('../config/jwtSecrets')

const generateAccessToken = (userId, role, isSuperAdmin = false) => {
  const id = String(userId)
  return jwt.sign({ userId: id, role, isSuperAdmin }, getJwtAccessSecret(), { expiresIn: '15m' })
}

const generateRefreshToken = (userId) => {
  const id = String(userId)
  return jwt.sign({ userId: id }, getJwtRefreshSecret(), { expiresIn: '30d' })
}

module.exports = { generateAccessToken, generateRefreshToken }
