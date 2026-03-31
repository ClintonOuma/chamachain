const express = require('express')
const router = express.Router()

const { protect } = require('../middleware/auth')
const {
  getProfile,
  updateProfile,
  updatePassword,
  updateNotificationPrefs,
  deleteAccount
} = require('../controllers/userController')

router.get('/profile', protect, getProfile)
router.patch('/profile', protect, updateProfile)
router.patch('/password', protect, updatePassword)
router.patch('/notifications', protect, updateNotificationPrefs)
router.delete('/account', protect, deleteAccount)

module.exports = router

