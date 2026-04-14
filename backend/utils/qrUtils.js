const QRCode = require("qrcode");

/**
 * Generate a high-resolution QR code DataURL for a vehicle slug
 * @param {string} slug - The unique 8-char slug
 * @returns {Promise<string>} - Base64 Image DataURL
 */
const generateVehicleQR = async (slug) => {
  const host = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${host}/v/${slug}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      margin: 1,
      width: 1024,
      color: {
        dark: "#000000",
        light: "#ffffff"
      },
      errorCorrectionLevel: "H"
    });
    return qrDataUrl;
  } catch (err) {
    console.error("QR Generation Error:", err);
    throw new Error("Failed to generate secure QR payload.");
  }
};

module.exports = {
  generateVehicleQR
};
