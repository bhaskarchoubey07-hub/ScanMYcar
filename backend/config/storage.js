const mysql = require('mysql2/promise');
const { ensureStore } = require('./fileStore');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let storageMode = 'mysql';
let startupError = null;

const ensureStorageReady = async () => {
  try {
    await pool.query('SELECT 1');
    storageMode = 'mysql';
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
  isUsingFileStore
};
