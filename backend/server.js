const { app, initializeApp, getStorageMode } = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeApp();
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT} (${getStorageMode()} storage)`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message || error.code || error);
    process.exit(1);
  }
};

startServer();
