const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getUserCategories = async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .execute('GetUserCategories');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetUserCategories error:', err);
    res.status(500).json({ error: 'Failed to fetch user categories' });
  }
};