const { Pool } = require('pg');
const { ensureStore } = require('./fileStore');

const shouldUseSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const sslRejectUnauthorized =
  String(process.env.DB_SSL_REJECT_UNAUTHORIZED || 'false').toLowerCase() !== 'false';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: shouldUseSsl
    ? {
        rejectUnauthorized: sslRejectUnauthorized
      }
    : undefined,
  max: 10
});

const ensureSchema = async () => {
  // Ensure we can use UUIDs
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      is_blocked BOOLEAN NOT NULL DEFAULT false,
      failed_attempts INT NOT NULL DEFAULT 0,
      last_login_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      ip_address VARCHAR(100),
      user_agent TEXT,
      device_info JSONB,
      status VARCHAR(20) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mobile VARCHAR(20) NOT NULL,
      code VARCHAR(10) NOT NULL,
      purpose VARCHAR(20) NOT NULL DEFAULT 'auth',
      expires_at TIMESTAMPTZ NOT NULL,
      verified_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_number VARCHAR(30) NOT NULL,
      vehicle_type VARCHAR(30) NOT NULL,
      owner_name VARCHAR(100) NOT NULL,
      owner_phone VARCHAR(20) NOT NULL,
      emergency_contact VARCHAR(20) NOT NULL,
      medical_info TEXT,
      qr_slug VARCHAR(50) NOT NULL UNIQUE,
      qr_code_url TEXT,
      is_public BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, vehicle_number)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      scan_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(100) NOT NULL,
      device VARCHAR(255) NOT NULL,
      latitude NUMERIC(10, 7),
      longitude NUMERIC(10, 7)
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_otp_codes_mobile ON otp_codes(mobile)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_scans_vehicle_id ON scans(vehicle_id)');
};

let storageMode = 'postgres';
let startupError = null;

const ensureStorageReady = async () => {
  try {
    await pool.query('SELECT 1');
    await ensureSchema();
    storageMode = 'postgres';
    startupError = null;
    return storageMode;
  } catch (error) {
    startupError = error;
    storageMode = 'file';
    await ensureStore();
    return storageMode;
  }
};

const getStorageMode = () => storageMode;

const getStartupError = () => startupError;

const isUsingFileStore = () => storageMode === 'file';

module.exports = {
  pool,
  ensureStorageReady,
  getStorageMode,
  getStartupError,
  isUsingFileStore,
  ensureSchema
};
