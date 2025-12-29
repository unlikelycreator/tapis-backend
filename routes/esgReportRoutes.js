const express = require('express');
const router = express.Router();
const esgReportController = require('../controllers/esgReportController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['SuperAdmin', 'Admin', 'User']), esgReportController.createESGReport);
router.get('/', authenticate, esgReportController.getAllESGReports);
router.get('/:id', authenticate, esgReportController.getESGReportById);
router.put('/:id', authenticate, authorize(['SuperAdmin', 'Admin', 'User']), esgReportController.updateESGReport);
router.delete('/:id', authenticate, authorize(['SuperAdmin', 'Admin', 'User']), esgReportController.deleteESGReport);

module.exports = router;