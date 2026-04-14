const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { authenticate } = require("../middleware/authMiddleware");

// Public SOS trigger (No Auth required for the scanner)
router.post("/trigger", alertController.triggerSos);

// Owner-only alert retrieval
router.get("/vehicle/:vehicle_id", authenticate, alertController.getVehicleAlerts);

module.exports = router;
