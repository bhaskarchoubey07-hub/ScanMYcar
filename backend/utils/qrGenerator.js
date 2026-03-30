const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const qrDir = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR, 'qr')
  : path.join(__dirname, '..', 'public', 'qr');

const ensureQrDir = async () => {
  await fs.promises.mkdir(qrDir, { recursive: true });
};

const generateVehicleQr = async (vehicleId, publicBaseUrl) => {
  await ensureQrDir();

  const vehicleLink = `${publicBaseUrl.replace(/\/$/, '')}/v/${vehicleId}`;
  const fileName = `vehicle-${vehicleId}.png`;
  const filePath = path.join(qrDir, fileName);

  await QRCode.toFile(filePath, vehicleLink, {
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    margin: 1,
    width: 720
  });

  return {
    fileName,
    filePath,
    publicUrl: `${publicBaseUrl.replace(/\/$/, '')}/public/qr/${fileName}`,
    vehicleLink
  };
};

module.exports = { generateVehicleQr };
