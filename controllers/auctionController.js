const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.createAuction = async (req, res) => {
  const { scannedImageIds, startDate, endDate, startingBid, bidIncrement, status = 1 } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('scannedImageIds', sql.VarChar, scannedImageIds.join(','))
      .input('startDate', sql.DateTime, startDate)
      .input('endDate', sql.DateTime, endDate)
      .input('startingBid', sql.Decimal(10,2), startingBid)
      .input('bidIncrement', sql.Decimal(10,2), bidIncrement)
      .input('status', sql.Int, status)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('CreateAuction');
    res.status(201).json({ auctionId: result.recordset[0].NewAuctionId });
  } catch (err) {
    logger.error('CreateAuction error:', err);
    res.status(500).json({ error: 'Failed to create auction' });
  }
};

exports.getOpenAuctions = async (req, res) => {

  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetOpenAuctions');
    res.json(result.recordset); // Return raw recordset to match frontend expectations
  } catch (err) {
    logger.error('GetOpenAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch open auctions' });
  }
};

exports.getClosedAuctions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().execute('GetClosedAuctions');
    res.json(result.recordset); // Return raw recordset to match frontend expectations
  } catch (err) {
    logger.error('GetClosedAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch open auctions' });
  }
};

exports.getAssignedOpenAuctions = async (req, res) => {
  try {
    const pool = await poolPromise;
    // Fetch recyclerCompanyId from User
    const userResult = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT recyclerCompanyId FROM [User] WHERE _id = @userId');
    const recyclerCompanyId = userResult.recordset[0]?.recyclerCompanyId;

    if (!recyclerCompanyId) {
      return res.status(400).json({ error: 'User not associated with a recycler company' });
    }

    const result = await pool.request()
      .input('recyclerCompanyId', sql.Int, recyclerCompanyId)
      .execute('GetAssignedOpenAuctions');
    res.json(result.recordset); // Return raw recordset to match frontend structure
  } catch (err) {
    logger.error('GetAssignedOpenAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch assigned open auctions' });
  }
};

exports.assignAuctionToCompany = async (req, res) => {
  const { auctionId } = req.body;
  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT recyclerCompanyId FROM [User] WHERE _id = @userId');
    const recyclerCompanyId = userResult.recordset[0]?.recyclerCompanyId;

    if (!recyclerCompanyId) {
      return res.status(400).json({ error: 'User not associated with a recycler company' });
    }

    await pool.request()
      .input('auctionId', sql.Int, auctionId)
      .input('recyclerCompanyId', sql.Int, recyclerCompanyId)
      .input('assignedBy', sql.Int, req.user.userId)
      .execute('AssignAuctionToCompany');
    res.json({ message: 'Auction assigned successfully' });
  } catch (err) {
    logger.error('AssignAuctionToCompany error:', err);
    res.status(err.number === 50001 ? 400 : 500).json({ error: err.message || 'Failed to assign auction' });
  }
};

exports.getUserAuctions = async (req, res) => {
  console.log(req.user.userId)
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetUserAuctions');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetUserAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch user auctions' });
  }
};

exports.closeAuction = async (req, res) => {
  const { id } = req.params;
  const { status = 2 } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('auctionId', sql.Int, id)
      .input('status', sql.Int, status)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('CloseAuction');
    console.log('CloseAuction result:', result.recordset); // Debug
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json({ message: 'Auction closed' });
  } catch (err) {
    logger.error('CloseAuction error:', { id, status, error: err.message }); // Debug
    res.status(err.number === 50001 ? 404 : 500).json({ error: err.message || 'Failed to close auction' });
  }
};

exports.getAuctionDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('auctionId', sql.Int, id)
      .query(`
        SELECT 
          a._id AS auctionId,
          a.startDate,
          a.endDate,
          a.startingBid,
          a.currentHighestBid,
          a.bidIncrement,
          a.status AS auctionStatus,
          a.winnerUserId,
          u.fullname AS winnerName
        FROM Auction a
        LEFT JOIN [User] u ON a.winnerUserId = u._id
        WHERE a._id = @auctionId;

        SELECT 
          s._id,
          s.material,
          s.confidence,
          s.points,
          s.carbon_points,
          s.weight,
          s.area,
          s.image_url
        FROM ScannedImage s
        INNER JOIN AuctionScannedImage asi ON s._id = asi.scannedImageId
        WHERE asi.auctionId = @auctionId;
      `);

    if (result.recordsets[0].length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json({
      ...result.recordsets[0][0],
      images: result.recordsets[1],
    });
  } catch (err) {
    logger.error('GetAuctionDetails error:', err);
    res.status(500).json({ error: 'Failed to fetch auction details' });
  }
};

exports.selectWinnerAndClose = async (req, res) => {
  const { id: auctionId } = req.params;
  const { bidId } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('auctionId', sql.Int, auctionId)
      .input('bidId', sql.Int, bidId)
      .input('modifiedBy', sql.Int, req.user.userId)
      .execute('ManuallySelectWinnerAndClose');
    
    console.log('ManuallySelectWinnerAndClose result:', result.recordset); // Debug
    if (result.recordset[0].RowsAffected === 0) {
      return res.status(404).json({ error: 'Auction or bid not found' });
    }
    res.json({ message: 'Winner selected and auction closed' });
  } catch (err) {
    logger.error('ManuallySelectWinnerAndClose error:', { auctionId, bidId, error: err.message }); // Debug
    res.status(err.number === 50001 ? 404 : 500).json({ error: err.message || 'Failed to select winner and close auction' });
  }
};

exports.getRecyclerAuctions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetRecyclerAuctions');
    
    // Process the multiple result sets
    const auctions = result.recordsets[0].map(auction => ({
      ...auction,
      images: [],
      bidCount: 0,
      userBid: null
    }));

    // Map images to auctions
    const auctionImages = result.recordsets[1];
    auctions.forEach(auction => {
      auction.images = auctionImages.filter(img => img.auctionId === auction.auctionId);
    });

    // Map bid counts and user bids
    const auctionBids = result.recordsets[2];
    auctions.forEach(auction => {
      const bids = auctionBids.filter(bid => bid.auctionId === auction.auctionId);
      auction.bidCount = bids.length;
      auction.userBid = bids.find(bid => bid.bidderUserId === req.user.userId) || null;
    });

    res.json(auctions);
  } catch (err) {
    logger.error('GetRecyclerAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch recycler auctions' });
  }
};


exports.getAllAuctions = async (req, res) => {
  console.log("Got Request")
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        a._id AS auctionId,
        a.startDate,
        a.endDate,
        a.startingBid,
        a.currentHighestBid,
        a.bidIncrement,
        a.status AS auctionStatus,
        a.winnerUserId,
        u.fullname AS winnerName,
        STUFF((
          SELECT ',' + si.material
          FROM ScannedImage si
          INNER JOIN AuctionScannedImage asi ON si._id = asi.scannedImageId
          WHERE asi.auctionId = a._id
          FOR XML PATH('')
        ), 1, 1, '') AS materials,
        STUFF((
          SELECT ',' + si.image_url
          FROM ScannedImage si
          INNER JOIN AuctionScannedImage asi ON si._id = asi.scannedImageId
          WHERE asi.auctionId = a._id
          FOR XML PATH('')
        ), 1, 1, '') AS image_urls,
        SUM(si.weight) AS total_weight
      FROM Auction a
      LEFT JOIN [User] u ON a.winnerUserId = u._id
      LEFT JOIN AuctionScannedImage asi ON a._id = asi.auctionId
      LEFT JOIN ScannedImage si ON asi.scannedImageId = si._id
      GROUP BY 
        a._id, a.startDate, a.endDate, a.startingBid, a.currentHighestBid, 
        a.bidIncrement, a.status, a.winnerUserId, u.fullname
      ORDER BY a._id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetAllAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch all auctions' });
  }
};