const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool, getStorageMode, isUsingFileStore } = require('../config/storage');
const { initializeApp } = require('./bootstrap');
const authRoutes = require('../routes/authRoutes');
const vehicleRoutes = require('../routes/vehicleRoutes');
const publicRoutes = require('../routes/publicRoutes');
const adminRoutes = require('../routes/adminRoutes');
const { apiLimiter } = require('../middleware/rateLimit');
const { errorHandler } = require('../middleware/errorMiddleware');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

const envOrigins = String(process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const parseOrigin = (origin) => {
  try {
    return new URL(origin);
  } catch (error) {
    return null;
  }
};

const isAllowedVercelOrigin = (origin) => {
  const requestUrl = parseOrigin(origin);
  if (!requestUrl || requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1') {
    return false;
  }

  return envOrigins.some((allowedOrigin) => {
    const allowedUrl = parseOrigin(allowedOrigin);
    if (!allowedUrl || allowedUrl.hostname.endsWith('.vercel.app') === false) {
      return false;
    }

    const allowedLabel = allowedUrl.hostname.replace('.vercel.app', '').split('.')[0];
    return (
      requestUrl.hostname.endsWith('.vercel.app') &&
      requestUrl.hostname.replace('.vercel.app', '').startsWith(allowedLabel)
    );
  });
};

const allowedOrigins = new Set(
  [
    ...envOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ].filter(Boolean)
);

app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || isAllowedVercelOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
app.use('/api', apiLimiter);

app.use(async (req, res, next) => {
  try {
    await initializeApp();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.get('/api/health', async (req, res, next) => {
  try {
    if (!isUsingFileStore()) {
      await pool.query('SELECT 1');
    }

    return res.json({ status: 'ok', storage: getStorageMode() });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/v/:vehicleId', (req, res) => {
  const frontendUrl = (envOrigins[0] || 'http://localhost:5173').replace(/\/$/, '');
  return res.redirect(`${frontendUrl}/vehicle/${req.params.vehicleId}`);
});

app.get('/', (req, res) => {
  res.status(200).json({
    service: 'smart-vehicle-qr-backend',
    health: '/api/health'
  });
});

app.use(errorHandler);

module.exports = app;
