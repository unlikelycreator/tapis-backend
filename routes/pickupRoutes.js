const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/pending', authenticate, authorize(['Admin', 'User']), pickupController.getPendingPickups);
router.put('/:id/update', authenticate, authorize(['Admin', 'User']), pickupController.updatePickupStatus);
router.get('/history', authenticate, authorize(['Admin', 'User']), pickupController.getPickupHistory);
module.exports = router;