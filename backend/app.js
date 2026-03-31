const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { pool, ensureStorageReady, getStorageMode, getStartupError, isUsingFileStore } = require('./config/storage');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorMiddleware');
const { findUserByEmail, createUser } = require('./models/userModel');

dotenv.config({ path: path.join(__dirname, '.env') });

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

let startupState = {
  initialized: false,
  initPromise: null
};

const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await findUserByEmail(adminEmail);
  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await createUser({
    name: 'System Admin',
    email: adminEmail,
    phone: '0000000000',
    passwordHash,
    role: 'admin'
  });
};

const initializeApp = async () => {
  if (startupState.initialized) {
    return;
  }

  if (!startupState.initPromise) {
    startupState.initPromise = (async () => {
      await ensureStorageReady();

      const startupError = getStartupError();
      if (startupError) {
        console.warn(
          `MySQL unavailable, using local file storage instead: ${startupError.message || startupError.code}`
        );
      }

      await ensureAdminUser();
      startupState.initialized = true;
    })().catch((error) => {
      startupState.initPromise = null;
      throw error;
    });
  }

  await startupState.initPromise;
};

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
app.use('/public', express.static(path.join(__dirname, 'public')));
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

app.use(errorHandler);

module.exports = {
  app,
  initializeApp,
  getStorageMode
};
