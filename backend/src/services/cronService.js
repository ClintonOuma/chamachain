const cron = require('node-cron') 
 const Membership = require('../models/Membership') 
 const Contribution = require('../models/Contribution') 
 const Loan = require('../models/Loan') 
 const Chama = require('../models/Chama') 
 const { createNotification } = require('./notificationService') 
 
 // Run on 1st of every month at midnight 
 const updateContributionStreaks = cron.schedule('0 0 1 * *', async () => { 
   console.log('[cron] Updating contribution streaks...') 
   try { 
     const now = new Date() 
     const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1) 
     const periodMonth = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}` 
     const memberships = await Membership.find({ status: 'active' }) 
     for (const membership of memberships) { 
       const contributed = await Contribution.findOne({ 
         userId: membership.userId, 
         chamaId: membership.chamaId, 
         periodMonth, 
         status: 'success' 
       }) 
       if (contributed) { 
         membership.contributionStreak += 1 
         await createNotification({ 
           userId: membership.userId, 
           chamaId: membership.chamaId, 
           type: 'reminder', 
           title: '🔥 Streak Updated!', 
           body: `Your contribution streak is now ${membership.contributionStreak} months!` 
         }) 
       } else { 
         if (membership.contributionStreak > 0) { 
           await createNotification({ 
             userId: membership.userId, 
             chamaId: membership.chamaId, 
             type: 'reminder', 
             title: '⚠️ Streak Lost', 
             body: `You missed last month's contribution. Your streak has been reset.` 
           }) 
         } 
         membership.contributionStreak = 0 
       } 
       await membership.save() 
     } 
     console.log('[cron] Streaks updated for', memberships.length, 'members') 
   } catch (err) { 
     console.error('[cron] Streak update error:', err.message) 
   } 
 }, { scheduled: false }) 
 
 // Run daily at 9am to check late loans 
 const checkLateLoans = cron.schedule('0 9 * * *', async () => { 
   console.log('[cron] Checking late loans...') 
   try { 
     const now = new Date() 
     const lateLoans = await Loan.find({ 
       status: 'disbursed', 
       dueDate: { $lt: now } 
     }) 
     for (const loan of lateLoans) { 
       const chama = await Chama.findById(loan.chamaId) 
       const penaltyRate = chama?.settings?.latePenaltyRate || 0.5 
       const daysLate = Math.floor((now - loan.dueDate) / (1000 * 60 * 60 * 24)) 
       const penalty = (loan.amount * (penaltyRate / 100)) * daysLate 
       await createNotification({ 
         userId: loan.userId, 
         chamaId: loan.chamaId, 
         type: 'reminder', 
         title: '⚠️ Loan Overdue', 
         body: `Your loan of KES ${loan.amount.toLocaleString()} is ${daysLate} days overdue. Penalty: KES ${penalty.toFixed(0)}.` 
       }) 
     } 
     console.log('[cron] Late loan check done. Found', lateLoans.length, 'late loans') 
   } catch (err) { 
     console.error('[cron] Late loan check error:', err.message) 
   } 
 }, { scheduled: false }) 
 
 // 3 days before contribution due date reminder 
 const sendContributionReminders = cron.schedule('0 8 * * *', async () => { 
   console.log('[cron] Sending contribution reminders...') 
   try { 
     const now = new Date() 
     const chamas = await Chama.find({ status: 'active' }) 
     for (const chama of chamas) { 
       const dueDay = chama.settings?.contributionDueDay || 1 
       const daysUntilDue = dueDay - now.getDate() 
       if (daysUntilDue === 3) { 
         const memberships = await Membership.find({ chamaId: chama._id, status: 'active' }) 
         for (const m of memberships) { 
           await createNotification({ 
             userId: m.userId, 
             chamaId: chama._id, 
             type: 'reminder', 
             title: '📅 Contribution Due Soon', 
             body: `Your contribution to ${chama.name} is due in 3 days. Minimum: KES ${chama.settings?.minContribution || 500}.` 
           }) 
         } 
       } 
     } 
   } catch (err) { 
     console.error('[cron] Reminder error:', err.message) 
   } 
 }, { scheduled: false }) 
 
 const startCronJobs = () => { 
   updateContributionStreaks.start() 
   checkLateLoans.start() 
   sendContributionReminders.start() 
   console.log('[cron] All cron jobs started') 
 } 
 
 module.exports = { startCronJobs } 
