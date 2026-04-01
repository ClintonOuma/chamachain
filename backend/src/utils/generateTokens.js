const jwt = require('jsonwebtoken')
const { getJwtAccessSecret, getJwtRefreshSecret } = require('../config/jwtSecrets')

const generateAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, getJwtAccessSecret(), { expiresIn: '15m' })
}

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, getJwtRefreshSecret(), { expiresIn: '30d' })
}

module.exports = { generateAccessToken, generateRefreshToken }
