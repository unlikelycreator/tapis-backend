const express = require('express');
const router = express.Router();
const userCategoryController = require('../controllers/userCategoryController');
const { authenticate } = require('../middleware/auth');

router.get('/:userId', authenticate, userCategoryController.getUserCategories);

module.exports = router;