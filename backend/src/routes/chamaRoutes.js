const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const {
  createChama, getMyChamas, getChamaById,
  updateChama, joinChama, getMembers,
  changeMemberRole, removeMember
} = require('../controllers/chamaController');

router.post('/', protect, createChama);
router.get('/', protect, getMyChamas);
router.get('/:chamaId', protect, getChamaById);
router.patch('/:chamaId', protect, requireRole('admin'), updateChama);
router.post('/join', protect, joinChama);
router.get('/:chamaId/members', protect, getMembers);
router.patch('/:chamaId/members/:userId/role', protect, requireRole('admin'), changeMemberRole);
router.delete('/:chamaId/members/:userId', protect, requireRole('admin'), removeMember);

module.exports = router;
