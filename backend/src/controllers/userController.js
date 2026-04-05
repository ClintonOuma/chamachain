const User = require('../models/User') 
 const bcrypt = require('bcryptjs') 
 const Membership = require('../models/Membership') 
 const Contribution = require('../models/Contribution') 
 const Loan = require('../models/Loan') 
 const Notification = require('../models/Notification') 
 
 const getProfile = async (req, res) => { 
   try { 
     const user = await User.findById(req.user.userId) 
       .select('-passwordHash -otpHash -refreshTokenHash') 
     if (!user) return res.status(404).json({ success: false, message: 'User not found' }) 
     res.json({ success: true, user }) 
   } catch (err) { 
     res.status(500).json({ success: false, message: err.message }) 
   } 
 } 
 
 const updateProfile = async (req, res) => { 
   try { 
     const { fullName, phone } = req.body 
     if (!fullName?.trim()) return res.status(400).json({ success: false, message: 'Full name is required' }) 
     const user = await User.findByIdAndUpdate( 
       req.user.userId, 
       { fullName: fullName.trim(), ...(phone && { phone }) }, 
       { new: true } 
     ).select('-passwordHash -otpHash -refreshTokenHash') 
     res.json({ success: true, user }) 
   } catch (err) { 
     res.status(500).json({ success: false, message: err.message }) 
   } 
 } 
 
 const updatePassword = async (req, res) => { 
   try { 
     const { currentPassword, newPassword } = req.body 
     if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both passwords required' }) 
     if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' }) 
     const user = await User.findById(req.user.userId) 
     const isMatch = await bcrypt.compare(currentPassword, user.passwordHash) 
     if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' }) 
     user.passwordHash = await bcrypt.hash(newPassword, 12) 
     await user.save() 
     res.json({ success: true, message: 'Password updated successfully' }) 
   } catch (err) { 
     res.status(500).json({ success: false, message: err.message }) 
   } 
 } 
 
 const updateNotificationPrefs = async (req, res) => { 
   try { 
     const { prefs } = req.body 
     await User.findByIdAndUpdate(req.user.userId, { notificationPrefs: prefs }) 
     res.json({ success: true, message: 'Preferences updated' }) 
   } catch (err) { 
     res.status(500).json({ success: false, message: err.message }) 
   } 
 } 
 
 const deleteAccount = async (req, res) => { 
   try { 
     const userId = req.user.userId 
     await Promise.all([ 
       Membership.deleteMany({ userId }), 
       Contribution.deleteMany({ userId }), 
       Loan.deleteMany({ userId }), 
       Notification.deleteMany({ userId }), 
       User.findByIdAndDelete(userId) 
     ]) 
     res.json({ success: true, message: 'Account deleted successfully' }) 
   } catch (err) { 
     res.status(500).json({ success: false, message: err.message }) 
   } 
 } 
 
 module.exports = { getProfile, updateProfile, updatePassword, updateNotificationPrefs, deleteAccount }