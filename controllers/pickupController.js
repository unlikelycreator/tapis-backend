const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getPendingPickups = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetPendingPickups');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetPendingPickups error:', err);
    res.status(500).json({ error: 'Failed to fetch pending pickups' });
  }
};
exports.updatePickupStatus = async (req, res) => {
  const { id: pickupId } = req.params;
  const { status, proofImageUrl } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('pickupId', sql.Int, pickupId)
      .input('status', sql.Int, status)
      .input('proofImageUrl', sql.NVarChar, proofImageUrl || null)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdatePickupStatus');

    // Log the full result for debugging
    logger.info('UpdatePickupStatus result:', {
      pickupId,
      status,
      result: JSON.stringify(result, null, 2),
    });

    // Check RowsAffected safely
    const rowsAffected = result.recordset && result.recordset.length > 0 ? result.recordset[0].RowsAffected : 0;
    if (rowsAffected === 0) {
      logger.warn('No rows affected for pickupId:', pickupId);
      // Verify if the pickup exists as a fallback
      const checkResult = await pool.request()
        .input('pickupId', sql.Int, pickupId)
        .query('SELECT * FROM Pickup WHERE _id = @pickupId');
      logger.info('Pickup check result:', {
        pickupId,
        exists: checkResult.recordset.length > 0,
        record: checkResult.recordset[0],
      });
      return res.status(404).json({ error: 'Pickup not found' });
    }

    res.json({ message: 'Pickup status updated' });
  } catch (err) {
    logger.error('UpdatePickupStatus error:', {
      pickupId,
      status,
      error: err.message,
      stack: err.stack,
    });
    res.status(err.number === 50001 ? 404 : 500).json({ error: err.message || 'Failed to update pickup status' });
  }
};

exports.getPickupHistory = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetPickupHistory');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetPickupHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch pickup history' });
  }
};