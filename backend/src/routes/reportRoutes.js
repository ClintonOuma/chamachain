const express = require('express') 
const router = express.Router() 
const { protect } = require('../middleware/auth') 
const { requireRole } = require('../middleware/rbac') 
const { exportCSV, exportPDF } = require('../controllers/reportController') 

router.get('/:chamaId/csv', protect, requireRole('admin', 'treasurer'), exportCSV) 
router.get('/:chamaId/pdf', protect, requireRole('admin', 'treasurer'), exportPDF) 

module.exports = router 
