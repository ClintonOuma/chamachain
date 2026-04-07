const express = require('express');
const router = express.Router();
const { joinChamaByCode, getChamaByInviteCode, regenerateInviteCode } = require('../controllers/invitationController');
const { protect } = require('../middleware/auth');

router.post('/join', protect, joinChamaByCode);
router.get('/lookup/:inviteCode', getChamaByInviteCode);
router.post('/regenerate/:chamaId', protect, regenerateInviteCode);

module.exports = router;
