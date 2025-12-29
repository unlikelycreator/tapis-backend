const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getUserRoles = async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .execute('GetUserRoles');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetUserRoles error:', err);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
};