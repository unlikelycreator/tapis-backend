const express = require('express');
const router = express.Router();
const startaController = require('../controllers/strataController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['SuperAdmin', 'Admin']), startaController.createStarta);
router.get('/', authenticate, authorize(['SuperAdmin', 'Admin']), startaController.getAllStarta);
router.get('/:id', authenticate, startaController.getStartaById);
router.put('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), startaController.updateStarta);
router.delete('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), startaController.deleteStarta);

module.exports = router;