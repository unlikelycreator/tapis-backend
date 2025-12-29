const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']),
  auctionController.createAuction
);

router.get(
  '/all',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin', 'Bidder', 'User']),
  auctionController.getAllAuctions
);

router.get(
  '/open',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']), // Admins see all open auctions
  auctionController.getOpenAuctions
);

router.get(
  '/closed',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']), // Admins see all open auctions
  auctionController.getClosedAuctions
);

router.get(
  '/assigned-open',
  authenticate,
  authorize(['Bidder', 'Admin']), // Bidders see assigned auctions
  auctionController.getAssignedOpenAuctions
);

router.post(
  '/assign',
  authenticate,
  authorize(['Admin', 'SuperAdmin']), // Admins assign auctions
  auctionController.assignAuctionToCompany
);

router.get(
  '/user',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']),
  auctionController.getUserAuctions
);

router.put(
  '/:id/close',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']),
  auctionController.closeAuction
);

router.get(
  '/:id',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin', 'Bidder']),
  auctionController.getAuctionDetails
);

router.put(
  '/:id/select-winner',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']),
  auctionController.selectWinnerAndClose
);

router.get(
  '/recycler',
  authenticate,
  authorize(['Government', 'Admin', 'SuperAdmin']),
  auctionController.getRecyclerAuctions
);

module.exports = router;