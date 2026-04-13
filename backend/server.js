require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const scanRoutes = require("./routes/scanRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/alerts", alertRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "ScanMyCar Secure Identity API Server Online" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Critical API Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Backend server successfully running on port ${PORT}`);
});
