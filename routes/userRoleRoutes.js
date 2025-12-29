const express = require('express');
const router = express.Router();
const userRoleController = require('../controllers/userRoleController');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, userRoleController.getUserRoles);

module.exports = router;