const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllRecyclerCompanies = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllRecyclerCompanies');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllRecyclerCompanies error:', err);
    res.status(500).json({ error: 'Failed to fetch recycler companies' });
  }
};