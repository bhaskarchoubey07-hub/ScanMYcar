const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const qrController = require("../controllers/qrController");
const { authenticate } = require("../middleware/authMiddleware");

// All vehicle routes require authentication
router.use(authenticate);

router.get("/", vehicleController.getAllVehicles);
router.post("/", vehicleController.createVehicle);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

// QR Asset Retrieval (Owner Only Download)
router.get("/qr/download/:slug", qrController.downloadQR);

module.exports = router;
