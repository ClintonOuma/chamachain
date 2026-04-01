const { createNotification } = require('./notificationService') 
 
 const BADGES = { 
   FIRST_CONTRIBUTION: { id: 'first_contribution', label: 'First Contribution', emoji: '🌱', description: 'Made your first contribution' }, 
   STREAK_3: { id: 'streak_3', label: 'On Fire', emoji: '🔥', description: '3 month contribution streak' }, 
   STREAK_6: { id: 'streak_6', label: 'Gold Star', emoji: '⭐', description: '6 month contribution streak' }, 
   STREAK_12: { id: 'streak_12', label: 'Diamond', emoji: '💎', description: '12 month contribution streak' }, 
   LOAN_REPAID: { id: 'loan_repaid', label: 'Trustworthy', emoji: '🤝', description: 'Repaid your first loan' }, 
 } 
 
 const checkAndAwardBadges = async (userId, chamaId, context = {}) => { 
   const { contributionCount, streak, loanRepaid } = context 
   const awarded = [] 
 
   if (contributionCount === 1) awarded.push(BADGES.FIRST_CONTRIBUTION) 
   if (streak >= 3 && streak < 6) awarded.push(BADGES.STREAK_3) 
   if (streak >= 6 && streak < 12) awarded.push(BADGES.STREAK_6) 
   if (streak >= 12) awarded.push(BADGES.STREAK_12) 
   if (loanRepaid) awarded.push(BADGES.LOAN_REPAID) 
 
   for (const badge of awarded) { 
     await createNotification({ 
       userId, 
       chamaId, 
       type: 'badge', 
       title: `Badge Earned: ${badge.emoji} ${badge.label}`, 
       body: badge.description, 
       actionUrl: `/chama/${chamaId}` 
     }) 
   } 
   return awarded 
 } 
 
 module.exports = { checkAndAwardBadges, BADGES } 
