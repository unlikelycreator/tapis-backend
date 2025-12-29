const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.createESGReport = async (req, res) => {
  const {
    electricity,
    personalVehicle,
    airwaysTravel,
    roadwaysTravel,
    railwaysTravel,
    dieselGenerator,
    cookingFuel,
    paperWaste,
    hotelStays
  } = req.body;

  try {
    const pool = await poolPromise;
    const request = pool.request()
      .input('user_id', sql.Int, req.user?.userId || null)
      .input('electricity_unitsConsumed', sql.Decimal(10,3), parseFloat(electricity.unitsConsumed) || 0)
      .input('electricity_sourceType', sql.VarChar(20), electricity.sourceType || 'Grid')
      .input('personalVehicle_distance', sql.Decimal(10,3), parseFloat(personalVehicle.distance) || 0)
      .input('personalVehicle_fuelType', sql.VarChar(20), personalVehicle.fuelType || 'Petrol')
      .input('airwaysTravel_distance', sql.Decimal(10,3), parseFloat(airwaysTravel.distance) || 0)
      .input('roadwaysTravel_distance', sql.Decimal(10,3), parseFloat(roadwaysTravel.distance) || 0)
      .input('roadwaysTravel_vehicleType', sql.VarChar(20), roadwaysTravel.vehicleType || 'Cabs')
      .input('railwaysTravel_distance', sql.Decimal(10,3), parseFloat(railwaysTravel.distance) || 0)
      .input('dieselGenerator_fuelConsumed', sql.Decimal(10,3), parseFloat(dieselGenerator.fuelConsumed) || 0)
      .input('cookingFuel_fuelConsumed', sql.Decimal(10,3), parseFloat(cookingFuel.fuelConsumed) || 0)
      .input('cookingFuel_fuelType', sql.VarChar(20), cookingFuel.fuelType || 'PNG')
      .input('cookingFuel_unit', sql.VarChar(10), cookingFuel.unit || 'litres')
      .input('paperWaste_weight', sql.Decimal(10,3), parseFloat(paperWaste.weight) || 0)
      .input('paperWaste_wasteType', sql.VarChar(50), paperWaste.wasteType || 'Paper')
      .input('hotelStays_nights', sql.Decimal(10,3), parseFloat(hotelStays.nights) || 0);

    const result = await request.execute('sp_SaveESGReport');
    res.status(201).json({ report_id: result.recordset[0].report_id });
  } catch (err) {
    logger.error('CreateESGReport error:', err);
    res.status(500).json({ error: 'Failed to create ESG report' });
  }
};

exports.getAllESGReports = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', sql.Int, req.user?.userId || null)
      .execute('sp_GetAllESGReports');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllESGReports error:', err);
    res.status(500).json({ error: 'Failed to fetch ESG reports' });
  }
};

exports.getESGReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('report_id', sql.BigInt, id)
      .input('user_id', sql.Int, req.user?.userId || null)
      .execute('sp_GetESGReportById');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'ESG report not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    logger.error('GetESGReportById error:', err);
    res.status(500).json({ error: 'Failed to fetch ESG report' });
  }
};

exports.updateESGReport = async (req, res) => {
  const { id } = req.params;
  const {
    electricity,
    personalVehicle,
    airwaysTravel,
    roadwaysTravel,
    railwaysTravel,
    dieselGenerator,
    cookingFuel,
    paperWaste,
    hotelStays
  } = req.body;

  try {
    const pool = await poolPromise;
    const request = pool.request()
      .input('report_id', sql.BigInt, id)
      .input('user_id', sql.Int, req.user?.userId || null)
      .input('electricity_unitsConsumed', sql.Decimal(10,3), parseFloat(electricity.unitsConsumed) || 0)
      .input('electricity_sourceType', sql.VarChar(20), electricity.sourceType || 'Grid')
      .input('personalVehicle_distance', sql.Decimal(10,3), parseFloat(personalVehicle.distance) || 0)
      .input('personalVehicle_fuelType', sql.VarChar(20), personalVehicle.fuelType || 'Petrol')
      .input('airwaysTravel_distance', sql.Decimal(10,3), parseFloat(airwaysTravel.distance) || 0)
      .input('roadwaysTravel_distance', sql.Decimal(10,3), parseFloat(roadwaysTravel.distance) || 0)
      .input('roadwaysTravel_vehicleType', sql.VarChar(20), roadwaysTravel.vehicleType || 'Cabs')
      .input('railwaysTravel_distance', sql.Decimal(10,3), parseFloat(railwaysTravel.distance) || 0)
      .input('dieselGenerator_fuelConsumed', sql.Decimal(10,3), parseFloat(dieselGenerator.fuelConsumed) || 0)
      .input('cookingFuel_fuelConsumed', sql.Decimal(10,3), parseFloat(cookingFuel.fuelConsumed) || 0)
      .input('cookingFuel_fuelType', sql.VarChar(20), cookingFuel.fuelType || 'PNG')
      .input('cookingFuel_unit', sql.VarChar(10), cookingFuel.unit || 'litres')
      .input('paperWaste_weight', sql.Decimal(10,3), parseFloat(paperWaste.weight) || 0)
      .input('paperWaste_wasteType', sql.VarChar(50), paperWaste.wasteType || 'Paper')
      .input('hotelStays_nights', sql.Decimal(10,3), parseFloat(hotelStays.nights) || 0);

    const result = await request.execute('sp_UpdateESGReport');
    if (!result.recordset || result.recordset[0].report_id === null) {
      return res.status(404).json({ error: 'ESG report not found or user_id does not match' });
    }
    res.json({ message: 'ESG report updated' });
  } catch (err) {
    logger.error('UpdateESGReport error:', err);
    res.status(500).json({ error: 'Failed to update ESG report' });
  }
};

exports.deleteESGReport = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('report_id', sql.BigInt, id)
      .input('user_id', sql.Int, req.user?.userId || null)
      .execute('sp_DeleteESGReport');
    if (!result.recordset || result.recordset[0].success === 0) {
      return res.status(404).json({ error: 'ESG report not found or user_id does not match' });
    }
    res.json({ message: 'ESG report deleted' });
  } catch (err) {
    logger.error('DeleteESGReport error:', err);
    res.status(500).json({ error: 'Failed to delete ESG report' });
  }
};