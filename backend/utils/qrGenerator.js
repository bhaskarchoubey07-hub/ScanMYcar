const QRCode = require('qrcode');

const generateVehicleQr = async (vehicleId, publicBaseUrl) => {
  const vehicleLink = `${publicBaseUrl.replace(/\/$/, '')}/v/${vehicleId}`;
  const svgMarkup = await QRCode.toString(vehicleLink, {
    type: 'svg',
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    },
    margin: 1,
    width: 720
  });

  const publicUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  return {
    publicUrl,
    vehicleLink
  };
};

module.exports = { generateVehicleQr };
