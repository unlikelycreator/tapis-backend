const express = require('express');
const router = express.Router();
const parliamentController = require('../controllers/parliamentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, parliamentController.getAllParliaments);
router.post('/', authenticate, authorize(['SuperAdmin', 'Admin']), parliamentController.createParliament);
router.put('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), parliamentController.updateParliament);
router.delete('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), parliamentController.deleteParliament);

module.exports = router;