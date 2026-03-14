const express = require('express');
const { param, body } = require('express-validator');
const { getPublicVehicle, logScan, contactRedirect } = require('../controllers/publicController');
const { publicScanLimiter } = require('../middleware/rateLimit');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.get(
  '/vehicles/:vehicleId',
  publicScanLimiter,
  [param('vehicleId').isInt({ min: 1 })],
  validateRequest,
  getPublicVehicle
);

router.get(
  '/vehicles/:vehicleId/contact/:method',
  publicScanLimiter,
  [
    param('vehicleId').isInt({ min: 1 }),
    param('method').isIn(['call', 'whatsapp', 'message'])
  ],
  validateRequest,
  contactRedirect
);

router.post(
  '/scan',
  publicScanLimiter,
  [
    body('vehicle_id').isInt({ min: 1 }),
    body('latitude').optional({ nullable: true }).isFloat({ min: -90, max: 90 }),
    body('longitude').optional({ nullable: true }).isFloat({ min: -180, max: 180 })
  ],
  validateRequest,
  logScan
);

module.exports = router;
