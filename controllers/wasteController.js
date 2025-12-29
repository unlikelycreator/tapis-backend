const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.getWasteStatistics = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetWasteStatistics');

    const summary = result.recordsets[0][0] || {};
    const strataData = result.recordsets[1] || [];

    res.json({
      summary: {
        totalWasteRecycled: parseFloat(summary.totalWasteRecycled || 0).toFixed(2),
        averageRecyclePerStrata: parseFloat(summary.averageRecyclePerStrata || 0).toFixed(2),
        totalStrataWithWaste: parseInt(summary.totalStrataWithWaste || 0, 10),
      },
      strataData: strataData.map(item => ({
        name: item.name,
        _id: parseInt(item._id, 10),
        waste: parseFloat(item.waste || 0).toFixed(2),
      })),
    });
  } catch (err) {
    logger.error('GetWasteStatistics error:', err);
    res.status(500).json({ error: 'Failed to fetch waste statistics' });
  }
};