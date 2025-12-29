const express = require('express');
const router = express.Router();
const dunController = require('../controllers/dunController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, dunController.getAllDuns);
router.post('/', authenticate, authorize(['SuperAdmin', 'Admin']), dunController.createDun);
router.put('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), dunController.updateDun);
router.delete('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), dunController.deleteDun);

module.exports = router;