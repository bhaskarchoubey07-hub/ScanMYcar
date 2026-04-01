const { Pool } = require('pg');

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

module.exports = pool;
