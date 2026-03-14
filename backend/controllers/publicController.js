const UAParser = require('ua-parser-js');
const { findVehicleById } = require('../models/vehicleModel');
const { createScan } = require('../models/scanModel');
const { sendScanNotification } = require('../utils/email');

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const getPublicVehicle = async (req, res, next) => {
  try {
    const vehicle = await findVehicleById(req.params.vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    return res.json({
      vehicle: {
        id: vehicle.id,
        vehicle_number: vehicle.vehicle_number,
        vehicle_type: vehicle.vehicle_type,
        owner_name: vehicle.owner_name
      }
    });
  } catch (error) {
    return next(error);
  }
};

const logScan = async (req, res, next) => {
  try {
    const { vehicle_id: vehicleId, latitude, longitude } = req.body;
    const vehicle = await findVehicleById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const parser = new UAParser(req.headers['user-agent']);
    const result = parser.getResult();
    const device = [result.device.vendor, result.device.model, result.browser.name, result.os.name]
      .filter(Boolean)
      .join(' | ') || 'Unknown device';

    await createScan({
      vehicleId,
      ipAddress: getClientIp(req),
      device,
      latitude: latitude ?? null,
      longitude: longitude ?? null
    });

    await sendScanNotification({
      email: vehicle.user_email,
      vehicleNumber: vehicle.vehicle_number,
      scannedAt: new Date().toISOString()
    });

    return res.status(201).json({ message: 'Scan logged successfully.' });
  } catch (error) {
    return next(error);
  }
};

const contactRedirect = async (req, res, next) => {
  try {
    const { vehicleId, method } = req.params;
    const vehicle = await findVehicleById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const sanitized = String(vehicle.contact_phone).replace(/[^\d+]/g, '');
    const targets = {
      call: `tel:${sanitized}`,
      whatsapp: `https://wa.me/${sanitized.replace('+', '')}`,
      message: `sms:${sanitized}`
    };

    const target = targets[method];

    if (!target) {
      return res.status(400).json({ message: 'Unsupported contact method.' });
    }

    return res.redirect(target);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPublicVehicle,
  logScan,
  contactRedirect
};
