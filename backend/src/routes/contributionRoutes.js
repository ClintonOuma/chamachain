const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  initiateContribution,
  getContributions,
  getMyContributions,
  getContributionSummary
} = require('../controllers/contributionController');

router.post('/initiate', protect, initiateContribution);
router.get('/:chamaId', protect, getContributions);
router.get('/:chamaId/my', protect, getMyContributions);
router.get('/:chamaId/summary', protect, getContributionSummary);

module.exports = router;
