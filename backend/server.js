require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const scanRoutes = require("./routes/scanRoutes");
const alertRoutes = require("./routes/alertRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const publicRoutes = require("./routes/publicRoutes");

// Import Middleware
const { authLimiter } = require("./middleware/rateLimiter");

// Import Storage
const { ensureStorageReady } = require("./config/storage");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/public", publicRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "ScanMyCar Secure Identity API Server Online" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Critical API Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

async function startServer() {
  try {
    console.log("Initializing Fintech Database Schema...");
    await ensureStorageReady();
    app.listen(PORT, () => {
      console.log(`[SECURE] Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FAILED TO START SERVER:", error.message);
    process.exit(1);
  }
}

startServer();
