// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize(['Admin']), couponController.createCoupon);
router.get('/', authenticate, couponController.getAllCoupons);
router.get('/:id', authenticate, couponController.getCouponById);
router.put('/:id', authenticate, authorize(['Admin']), couponController.updateCoupon);
router.delete('/:id', authenticate, authorize(['Admin']), couponController.deleteCoupon);

module.exports = router;