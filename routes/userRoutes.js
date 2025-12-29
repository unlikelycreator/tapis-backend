const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', authenticate, authorize(['SuperAdmin', 'Government', 'Admin']), userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/', authenticate, authorize(['SuperAdmin', 'Government', 'Admin']), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, authorize(['SuperAdmin','Government',  'Admin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['SuperAdmin','Government',  'Admin']), userController.deleteUser);

module.exports = router;