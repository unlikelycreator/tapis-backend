const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllRoles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllRoles');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllRoles error:', err);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};