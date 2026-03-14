const express = require('express');
const { body } = require('express-validator');
const { addVehicle, myVehicles } = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const router = express.Router();

router.use(authenticate);

router.get('/my', myVehicles);

router.post(
  '/add',
  [
    body('vehicle_number').trim().isLength({ min: 4, max: 30 }),
    body('vehicle_type').trim().isIn(['car', 'bike', 'scooter', 'truck', 'other']),
    body('owner_name').trim().isLength({ min: 2, max: 100 }),
    body('contact_phone').trim().isLength({ min: 8, max: 20 }),
    body('emergency_contact').trim().isLength({ min: 8, max: 20 })
  ],
  validateRequest,
  addVehicle
);

module.exports = router;
