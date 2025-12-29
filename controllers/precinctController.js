
const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getAllPrecincts = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllPrecincts');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllPrecincts error:', err);
    res.status(500).json({ error: 'Failed to fetch precincts' });
  }
};

exports.createPrecinct = async (req, res) => {
  const { precinctName } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('precinctName', sql.NVarChar, precinctName)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('InsertPrecinct');
    res.status(201).json({ id: result.recordset[0].NewPrecinctId });
  } catch (err) {
    logger.error('CreatePrecinct error:', err);
    res.status(500).json({ error: 'Failed to create precinct' });
  }
};

exports.updatePrecinct = async (req, res) => {
  const { id } = req.params;
  const { precinctName } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('precinctName', sql.NVarChar, precinctName)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdatePrecinct');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Precinct not found' });
    }
    res.json({ message: 'Precinct updated' });
  } catch (err) {
    logger.error('UpdatePrecinct error:', err);
    res.status(500).json({ error: 'Failed to update precinct' });
  }
};

exports.deletePrecinct = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('DeletePrecinct');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Precinct not found' });
    }
    res.json({ message: 'Precinct deleted' });
  } catch (err) {
    logger.error('DeletePrecinct error:', err);
    res.status(500).json({ error: 'Failed to delete precinct' });
  }
};
