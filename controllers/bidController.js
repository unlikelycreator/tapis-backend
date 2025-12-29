// controllers/bidController.js
const { sql, poolPromise } = require('../config/db');
const logger = require('../utils/logger');

exports.placeBid = async (req, res) => {
  const { auctionId, bidAmount } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('auctionId', sql.Int, auctionId)
      .input('bidderUserId', sql.Int, req.user.userId)
      .input('bidAmount', sql.Decimal(10,2), bidAmount)
      .input('createdBy', sql.Int, req.user.userId)
      .execute('PlaceBid');
    res.status(201).json({ bidId: result.recordset[0].NewBidId });
  } catch (err) {
    logger.error('PlaceBid error:', err);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};

exports.getBidsForAuction = async (req, res) => {
  const { auctionId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('auctionId', sql.Int, auctionId)
      .execute('GetBidsForAuction');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetBidsForAuction error:', err);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
};

exports.getUserBids = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetUserBids');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetUserBids error:', err);
    res.status(500).json({ error: 'Failed to fetch user bids' });
  }
};

// Get auctions won by the user's organization
exports.getWonAuctions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetWonAuctions');
    res.json(result.recordset);
  } catch (err) {
    logger.error('GetWonAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch won auctions' });
  }
};

// Get active auctions where the user's organization has placed bids
exports.getBiddedAuctions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetBiddedAuctions');
    
    // Process multiple result sets
    const auctions = result.recordsets[0].map(auction => ({
      ...auction,
      bids: [],
    }));

    // Map bids to auctions
    const auctionBids = result.recordsets[1];
    auctions.forEach(auction => {
      auction.bids = auctionBids.filter(bid => bid.auctionId === auction.auctionId);
    });

    res.json(auctions);
  } catch (err) {
    logger.error('GetBiddedAuctions error:', err);
    res.status(500).json({ error: 'Failed to fetch bidded auctions' });
  }
};

// Add to controllers/bidController.js
exports.getUserBidSummary = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .execute('GetUserBidSummary');
    res.json(result.recordset[0]);
  } catch (err) {
    logger.error('GetUserBidSummary error:', err);
    res.status(500).json({ error: 'Failed to fetch bid summary' });
  }
};
