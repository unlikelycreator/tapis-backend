const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/',
  authenticate,
  authorize(['Bidder', 'Government', 'SuperAdmin', 'Admin']),
  bidController.placeBid
);

router.get(
  '/auction/:auctionId',
  authenticate,
  authorize(['Bidder', 'Admin', 'Government', 'SuperAdmin']),
  bidController.getBidsForAuction
);

router.get(
  '/my-bids',
  authenticate,
  authorize(['Bidder', 'Admin', 'Government', 'SuperAdmin']),
  bidController.getUserBids
);

router.get(
  '/won-auctions',
  authenticate,
  authorize(['Bidder', 'Admin', 'Government', 'SuperAdmin']),
  bidController.getWonAuctions
);

router.get(
  '/bidded-auctions',
  authenticate,
  authorize(['Bidder', 'Admin', 'Government', 'SuperAdmin']),
  bidController.getBiddedAuctions
);

router.get(
  '/summary',
  authenticate,
  authorize(['Bidder', 'Admin', 'Government', 'SuperAdmin']),
  bidController.getUserBidSummary
);

module.exports = router;
