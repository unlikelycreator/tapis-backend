// controllers/startaController.js
const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.createStarta = async (req, res) => {
  const {
    strataName, address, googleMapLink, registrationNumber, managementCompany,
    contactNumber, email, numberOfUnits, propertyType, yearBuilt, facilities, description
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('strataName', sql.NVarChar, strataName)
      .input('address', sql.NVarChar, address)
      .input('googleMapLink', sql.NVarChar, googleMapLink)
      .input('registrationNumber', sql.NVarChar, registrationNumber)
      .input('managementCompany', sql.NVarChar, managementCompany)
      .input('contactNumber', sql.NVarChar, contactNumber)
      .input('email', sql.NVarChar, email)
      .input('numberOfUnits', sql.Int, numberOfUnits)
      .input('propertyType', sql.NVarChar, propertyType)
      .input('yearBuilt', sql.Int, yearBuilt)
      .input('facilities', sql.NVarChar, facilities)
      .input('description', sql.NVarChar, description)
      .input('createdBy', sql.Int, req.user?.userId || null)
      .input('modifiedBy', sql.Int, req.user?.userId || null)
      .execute('CreateStarta');
    res.status(201).json({ id: result.recordset[0].NewStartaId });
  } catch (err) {
    logger.error('CreateStarta error:', err);
    res.status(500).json({ error: 'Failed to create starta' });
  }
};

exports.getAllStarta = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetAllStarta');
    console.log(result)
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllStarta error:', err);
    res.status(500).json({ error: 'Failed to fetch starta' });
  }
};

exports.getStartaById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .execute('GetStartaById');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Starta not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    logger.error('GetStartaById error:', err);
    res.status(500).json({ error: 'Failed to fetch starta' });
  }
};

exports.updateStarta = async (req, res) => {
  const { id } = req.params;
  const {
    strataName, address, googleMapLink, registrationNumber, managementCompany,
    contactNumber, email, numberOfUnits, propertyType, yearBuilt, facilities, description
  } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('strataName', sql.NVarChar, strataName)
      .input('address', sql.NVarChar, address)
      .input('googleMapLink', sql.NVarChar, googleMapLink)
      .input('registrationNumber', sql.NVarChar, registrationNumber)
      .input('managementCompany', sql.NVarChar, managementCompany)
      .input('contactNumber', sql.NVarChar, contactNumber)
      .input('email', sql.NVarChar, email)
      .input('numberOfUnits', sql.Int, numberOfUnits)
      .input('propertyType', sql.NVarChar, propertyType)
      .input('yearBuilt', sql.Int, yearBuilt)
      .input('facilities', sql.NVarChar, facilities)
      .input('description', sql.NVarChar, description)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('UpdateStarta');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Starta not found' });
    }
    res.json({ message: 'Starta updated' });
  } catch (err) {
    logger.error('UpdateStarta error:', err);
    res.status(500).json({ error: 'Failed to update starta' });
  }
};

exports.deleteStarta = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('DeleteStarta');
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Starta not found' });
    }
    res.json({ message: 'Starta deleted' });
  } catch (err) {
    logger.error('DeleteStarta error:', err);
    res.status(500).json({ error: 'Failed to delete starta' });
  }
};