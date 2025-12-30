const express = require('express');
const router = express.Router();
const scannedImageController = require('../controllers/scannedImageController');
const { authenticate, authorize } = require('../middleware/auth');

router.post(
  '/',
  authenticate,
  authorize(['User', 'Government', 'SuperAdmin', 'Admin']),
  scannedImageController.createScannedImage
);

router.get(
  '/my-images',
  authenticate,
  authorize(['User', 'Government', 'SuperAdmin', 'Admin']),
  scannedImageController.getUserScannedImages
);

router.get(
  '/starta-images',
  authenticate,
  authorize(['User', 'Government', 'SuperAdmin', 'Admin']),
  scannedImageController.getStartaScannedImages
);

router.post(
  '/check-auction',
  authenticate,
  authorize(['User', 'Government', 'SuperAdmin', 'Admin']),
  scannedImageController.checkImagesInAuction
);

router.get(
  '/trends',
  authenticate,
  authorize(['Government', 'SuperAdmin', "Admin"]),
  scannedImageController.getRecyclingTrends
);

router.get(
  '/material-distribution',
  authenticate,
  authorize(['Government', 'SuperAdmin', "Admin"]),
  scannedImageController.getMaterialDistribution
);


router.get(
  '/strata-waste/:strataId',
  authenticate,
  authorize(['Government', 'SuperAdmin', "Admin"]),
  scannedImageController.getStrataWaste
);

router.post('/upload-base64', scannedImageController.uploadScannedImageBase64);

module.exports = router;
