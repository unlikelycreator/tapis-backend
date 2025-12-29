const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllDuns = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllDuns');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllDuns error:', err);
    res.status(500).json({ error: 'Failed to fetch DUNs' });
  }
};

exports.createDun = async (req, res) => {
  const { name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('InsertDun');
    res.status(201).json({ id: result.recordset[0].NewDunId });
  } catch (err) {
    logger.error('CreateDun error:', err);
    res.status(500).json({ error: 'Failed to create DUN' });
  }
};

exports.updateDun = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdateDun');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'DUN not found' });
    }
    res.json({ message: 'DUN updated' });
  } catch (err) {
    logger.error('UpdateDun error:', err);
    res.status(500).json({ error: 'Failed to update DUN' });
  }
};

exports.deleteDun = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('DeleteDun');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'DUN not found' });
    }
    res.json({ message: 'DUN deleted' });
  } catch (err) {
    logger.error('DeleteDun error:', err);
    res.status(500).json({ error: 'Failed to delete DUN' });
  }
};
