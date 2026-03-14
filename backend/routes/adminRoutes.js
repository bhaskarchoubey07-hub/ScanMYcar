const express = require('express');
const { getUsers, getVehicles, getScans } = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/users', getUsers);
router.get('/vehicles', getVehicles);
router.get('/scans', getScans);

module.exports = router;
