const jwt = require('jsonwebtoken')
const { getJwtAccessSecret } = require('../config/jwtSecrets')
const User = require('../models/User')

const protect = (req, res, next) => { 
  let token = null 
  const authHeader = req.headers.authorization 
  if (authHeader && authHeader.startsWith('Bearer ')) { 
    token = authHeader.split(' ')[1] 
  } else if (req.query.token) { 
    token = req.query.token 
  } 
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' }) 
  try { 
    const decoded = jwt.verify(token, getJwtAccessSecret()) 
    req.user = decoded 
    next() 
  } catch (err) { 
    return res.status(401).json({ success: false, message: 'Invalid or expired token' }) 
  } 
}

module.exports = { protect }
