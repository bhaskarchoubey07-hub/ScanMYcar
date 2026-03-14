const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const { pool, ensureStorageReady, getStorageMode, getStartupError, isUsingFileStore } = require('./config/storage');
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { apiLimiter } = require('./middleware/rateLimit');
const { errorHandler } = require('./middleware/errorMiddleware');
const { findUserByEmail, createUser } = require('./models/userModel');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173'
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
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
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  return res.redirect(`${frontendUrl}/vehicle/${req.params.vehicleId}`);
});

app.use(errorHandler);

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

const startServer = async () => {
  try {
    await ensureStorageReady();

    const startupError = getStartupError();
    if (startupError) {
      console.warn(`MySQL unavailable, using local file storage instead: ${startupError.message || startupError.code}`);
    }

    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT} (${getStorageMode()} storage)`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message || error.code || error);
    process.exit(1);
  }
};

startServer();
