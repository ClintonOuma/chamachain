const rateLimit = require('express-rate-limit') 
 
 const authLimiter = rateLimit({ 
   windowMs: 15 * 60 * 1000, 
   max: 10, 
   message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' }, 
   standardHeaders: true, 
   legacyHeaders: false 
 }) 
 
 const generalLimiter = rateLimit({ 
   windowMs: 15 * 60 * 1000, 
   max: 100, 
   message: { success: false, message: 'Too many requests. Please slow down.' }, 
   standardHeaders: true, 
   legacyHeaders: false 
 }) 
 
 const contributionLimiter = rateLimit({ 
   windowMs: 60 * 1000, 
   max: 5, 
   message: { success: false, message: 'Too many contribution attempts. Please wait a minute.' } 
 }) 
 
 module.exports = { authLimiter, generalLimiter, contributionLimiter } 
