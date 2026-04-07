const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  createChama, getMyChamas, getChamaById,
  updateChama, joinChama, getMembers,
  changeMemberRole, removeMember, freezeChama, transferAdmin,
  getMyRole, getAuditLogs, getLeaderboard
} = require('../controllers/chamaController');

router.post('/', protect, createChama);
router.get('/', protect, getMyChamas);
router.post('/join', protect, joinChama);
router.get('/:chamaId', protect, getChamaById);
router.patch('/:chamaId', protect, requireRole('admin'), updateChama);
router.get('/:chamaId/members', protect, getMembers);
router.patch('/:chamaId/members/:userId/role', protect, requireRole('admin'), changeMemberRole);
router.delete('/:chamaId/members/:userId', protect, requireRole('admin'), removeMember);
router.patch('/:chamaId/freeze', protect, requireRole('admin'), freezeChama)
router.patch('/:chamaId/transfer-admin/:userId', protect, requireRole('admin'), transferAdmin)
router.get('/:chamaId/my-role', protect, getMyRole)
router.get('/:chamaId/audit', protect, requireRole('admin', 'treasurer'), getAuditLogs)
router.get('/:chamaId/leaderboard', protect, getLeaderboard)

module.exports = router;
