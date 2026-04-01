const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateContribution,
  getContributions,
  getMyContributions,
  getContributionSummary
} = require('../controllers/contributionController');
const { contributionLimiter } = require('../middleware/rateLimiter');

router.post('/initiate', protect, contributionLimiter, initiateContribution);
router.get('/:chamaId', protect, getContributions);
router.get('/:chamaId/my', protect, getMyContributions);
router.get('/:chamaId/summary', protect, getContributionSummary);

module.exports = router;
