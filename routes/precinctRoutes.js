const express = require('express');
const router = express.Router();
const precinctController = require('../controllers/precinctController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, precinctController.getAllPrecincts);
router.post('/', authenticate, authorize(['SuperAdmin', 'Admin']), precinctController.createPrecinct);
router.put('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), precinctController.updatePrecinct);
router.delete('/:id', authenticate, authorize(['SuperAdmin', 'Admin']), precinctController.deletePrecinct);

module.exports = router;