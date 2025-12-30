// Updated controllers/scannedImageController.js
const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

exports.createScannedImage = async (req, res) => {
  const { image_url, detections, transaction_id } = req.body;
  try {
    const pool = await poolPromise;
    const results = [];

    for (const detection of detections) {
      const result = await pool.request()
        .input('material', sql.NVarChar, detection.material)
        .input('confidence', sql.Decimal(5, 2), detection.confidence)
        .input('points', sql.Int, detection.points)
        .input('carbon_points', sql.Int, detection.carbon_points)
        .input('weight', sql.Decimal(10, 2), detection.weight)
        .input('area', sql.Decimal(10, 2), detection.area)
        .input('image_url', sql.NVarChar(sql.MAX), image_url)
        .input('userId', sql.Int, req.user.userId)
        .input('createdBy', sql.Int, req.user.userId)
        .execute('CreateScannedImage');
      results.push({ id: result.recordset[0].NewScannedImageId });
    }

    res.status(201).json({ ids: results, transaction_id });
  } catch (err) {
    logger.error('CreateScannedImage error:', err);
    res.status(500).json({ error: 'Failed to create scanned image' });
  }
};

exports.getUserScannedImages = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT 
          _id,
          material,
          confidence,
          points,
          carbon_points,
          weight,
          area,
          image_url,
          status,
          auctionId
        FROM ScannedImage
        WHERE userId = @userId
        ORDER BY createdOn DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetUserScannedImages error:', err);
    res.status(500).json({ error: 'Failed to fetch scanned images' });
  }
};

exports.getStartaScannedImages = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT 
          si._id,
          si.material,
          si.confidence,
          si.points,
          si.carbon_points,
          si.weight,
          si.area,
          si.image_url,
          si.status,
          si.auctionId
        FROM ScannedImage si
        INNER JOIN [User] u ON si.userId = u._id
        WHERE u.startaId = (SELECT startaId FROM [User] WHERE _id = @userId)
        ORDER BY si.createdOn DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetStartaScannedImages error:', err);
    res.status(500).json({ error: 'Failed to fetch starta scanned images' });
  }
};

exports.getStrataWaste = async (req, res) => {
  console.log(req.params)
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('strataId', sql.Int, req.params.strataId) // Use strataId from params
      .query(`
        SELECT 
          si._id,
          si.material,
          si.confidence,
          si.points,
          si.carbon_points,
          si.weight,
          si.area,
          si.image_url,
          si.status,
          si.auctionId
        FROM ScannedImage si
        INNER JOIN [User] u ON si.userId = u._id
        WHERE u.startaId = @strataId
        ORDER BY si.createdOn DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetStrataWaste error:', err);
    res.status(500).json({ error: 'Failed to fetch strata waste data' });
  }
};

exports.checkImagesInAuction = async (req, res) => {
  const { imageIds } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('imageIds', sql.VarChar, imageIds.join(','))
      .query(`
        SELECT DISTINCT scannedImageId
        FROM AuctionScannedImage
        WHERE scannedImageId IN (SELECT VALUE FROM STRING_SPLIT(@imageIds, ','))
      `);
    const auctionedImageIds = result.recordset.map((row) => parseInt(row.scannedImageId));
    res.json({ auctionedImageIds });
  } catch (err) {
    logger.error('CheckImagesInAuction error:', err);
    res.status(500).json({ error: 'Failed to check images in auction' });
  }
};

// Get recycling trends over time (monthly waste totals)
exports.getRecyclingTrends = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        YEAR(createdOn) AS year,
        MONTH(createdOn) AS month,
        SUM(weight) AS totalWaste
      FROM ScannedImage
      WHERE status = 1 -- Assuming status 1 means approved/completed
      GROUP BY YEAR(createdOn), MONTH(createdOn)
      ORDER BY YEAR(createdOn), MONTH(createdOn);
    `);

    res.json(result.recordset.map(row => ({
      year: row.year,
      month: row.month,
      totalWaste: parseFloat(row.totalWaste || 0).toFixed(2),
    })));
  } catch (err) {
    logger.error('GetRecyclingTrends error:', err);
    res.status(500).json({ error: 'Failed to fetch recycling trends' });
  }
};

// Get waste distribution by material
exports.getMaterialDistribution = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        material,
        SUM(weight) AS totalWeight
      FROM ScannedImage
      WHERE status = 1 -- Assuming status 1 means approved/completed
      GROUP BY material;
    `);

    res.json(result.recordset.map(row => ({
      material: row.material,
      totalWeight: parseFloat(row.totalWeight || 0).toFixed(2),
    })));
  } catch (err) {
    logger.error('GetMaterialDistribution error:', err);
    res.status(500).json({ error: 'Failed to fetch material distribution' });
  }
};


exports.uploadScannedImageBase64 = async (req, res) => {
  const { scannedImage } = req.body;

  if (!scannedImage) {
    return res.status(400).json({ error: 'scannedImage (base64 string) is required' });
  }

  try {
    // Extract base64 data
    const base64Data = scannedImage.replace(/^data:image\/[a-z]+;base64,/, '');

    // Determine file extension
    const fileExtension = scannedImage.includes('data:image/png') ? 'png' :
      scannedImage.includes('data:image/jpeg') || scannedImage.includes('data:image/jpg') ? 'jpg' :
      'jpg'; // default jpg

    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join('/var/www/images', filename);

    // Write file to disk
    await fs.promises.writeFile(filePath, base64Data, 'base64');
    await fs.promises.chmod(filePath, 0o644);

    // Generate public URL pointing to BusyBox server
    const serverIp = '198.38.85.92';   // your server IP
    const port = 8080;                 // BusyBox port
    const imageUrl = `http://${serverIp}:${port}/${filename}`;

    logger.info(`Image uploaded successfully: ${imageUrl}`);

    res.status(200).json({
      success: true,
      image_url: imageUrl,
      filename
    });

  } catch (err) {
    logger.error('uploadScannedImageBase64 error:', err);
    res.status(500).json({ error: 'Failed to upload and save image' });
  }
};


