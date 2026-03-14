const nodemailer = require('nodemailer');

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    : null;

const sendScanNotification = async ({ email, vehicleNumber, scannedAt }) => {
  if (!transporter || !email) {
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: `Vehicle QR scanned: ${vehicleNumber}`,
    text: `Your QR sticker for vehicle ${vehicleNumber} was scanned at ${scannedAt}.`
  });
};

module.exports = { sendScanNotification };
