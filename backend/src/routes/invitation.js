const express = require('express');
const router = express.Router();
const { joinChamaByCode, getChamaByInviteCode, regenerateInviteCode } = require('../controllers/invitationController');
const { authenticateToken } = require('../middleware/auth');

router.post('/join', authenticateToken, joinChamaByCode);
router.get('/lookup/:inviteCode', getChamaByInviteCode);
router.post('/regenerate/:chamaId', authenticateToken, regenerateInviteCode);

module.exports = router;
