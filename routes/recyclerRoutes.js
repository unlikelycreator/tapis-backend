const express = require('express');
const router = express.Router();
const recyclerCompanyController = require('../controllers/recyclerController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize(['SuperAdmin', 'Admin', 'Government']), recyclerCompanyController.getAllRecyclerCompanies);

module.exports = router;