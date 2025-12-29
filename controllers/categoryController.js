const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllCategories = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllCategories');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};