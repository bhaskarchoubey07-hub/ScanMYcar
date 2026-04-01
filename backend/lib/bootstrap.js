const bcrypt = require('bcryptjs');
const { ensureStorageReady, getStartupError, getStorageMode } = require('../config/storage');
const { findUserByEmail, createUser } = require('../models/userModel');

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
          `PostgreSQL unavailable, using local file storage instead: ${startupError.message || startupError.code}`
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

module.exports = {
  initializeApp,
  getStorageMode
};
