const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");

// All dashboard telemetry requires authentication
router.get("/", authenticate, dashboardController.getUserDashboardData);

module.exports = router;
