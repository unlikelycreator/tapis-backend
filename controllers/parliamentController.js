const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllParliaments = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllParliaments');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllParliaments error:', err);
    res.status(500).json({ error: 'Failed to fetch parliaments' });
  }
};

exports.createParliament = async (req, res) => {
  const { name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('InsertParliament');
    res.status(201).json({ id: result.recordset[0].NewParliamentId });
  } catch (err) {
    logger.error('CreateParliament error:', err);
    res.status(500).json({ error: 'Failed to create parliament' });
  }
};

exports.updateParliament = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdateParliament');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Parliament not found' });
    }
    res.json({ message: 'Parliament updated' });
  } catch (err) {
    logger.error('UpdateParliament error:', err);
    res.status(500).json({ error: 'Failed to update parliament' });
  }
};

exports.deleteParliament = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('DeleteParliament');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Parliament not found' });
    }
    res.json({ message: 'Parliament deleted' });
  } catch (err) {
    logger.error('DeleteParliament error:', err);
    res.status(500).json({ error: 'Failed to delete parliament' });
  }
};
