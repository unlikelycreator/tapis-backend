// controllers/couponController.js
const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.createCoupon = async (req, res) => {
  const { name, description, price, redemptionCode, imageUrl, expirationDate, isActive, usageLimit } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('price', sql.Decimal(10,2), price)
      .input('redemptionCode', sql.NVarChar(50), redemptionCode)
      .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl)
      .input('expirationDate', sql.DateTime, expirationDate)
      .input('isActive', sql.Bit, isActive)
      .input('usageLimit', sql.Int, usageLimit)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('CreateCoupon');
    res.status(201).json({ id: result.recordset[0].NewCouponId });
  } catch (err) {
    logger.error('CreateCoupon error:', err);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllCoupons');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllCoupons error:', err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
};

exports.getCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('GetCouponById');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    logger.error('GetCouponById error:', err);
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
};

exports.updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, redemptionCode, imageUrl, expirationDate, isActive, usageLimit, usedCount } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('price', sql.Decimal(10,2), price)
      .input('redemptionCode', sql.NVarChar(50), redemptionCode)
      .input('imageUrl', sql.NVarChar(sql.MAX), imageUrl)
      .input('expirationDate', sql.DateTime, expirationDate)
      .input('isActive', sql.Bit, isActive)
      .input('usageLimit', sql.Int, usageLimit)
      .input('usedCount', sql.Int, usedCount)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdateCoupon');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ message: 'Coupon updated' });
  } catch (err) {
    logger.error('UpdateCoupon error:', err);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
};

exports.deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('DeleteCoupon');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    logger.error('DeleteCoupon error:', err);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
};