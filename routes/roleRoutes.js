const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, roleController.getAllRoles);

module.exports = router;