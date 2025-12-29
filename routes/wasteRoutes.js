const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/statistics', authenticate, authorize(['SuperAdmin', 'Admin', 'Government']), wasteController.getWasteStatistics);

module.exports = router;