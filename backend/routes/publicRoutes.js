const express = require('express');
const { getPublicVehicle, logScan } = require('../controllers/publicController');

const router = express.Router();

// Public Vehicle Discovery (via Slug)
router.get('/v/:slug', getPublicVehicle);

// Public Scan Event Log
router.post('/scan', logScan);

module.exports = router;
