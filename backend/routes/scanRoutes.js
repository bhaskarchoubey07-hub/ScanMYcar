const express = require("express");
const router = express.Router();
const scanController = require("../controllers/scanController");

router.get("/", scanController.getAllScans);
router.post("/", scanController.createScan);

module.exports = router;
