const {
  createVehicle,
  updateVehicleQr,
  listVehiclesByUserId,
  getVehicleStatsForUser
} = require('../models/vehicleModel');
const { generateVehicleQr } = require('../utils/qrGenerator');

const addVehicle = async (req, res, next) => {
  try {
    const {
      vehicle_number: vehicleNumber,
      vehicle_type: vehicleType,
      owner_name: ownerName,
      contact_phone: contactPhone,
      emergency_contact: emergencyContact
    } = req.body;

    const vehicleId = await createVehicle({
      userId: req.user.id,
      vehicleNumber,
      vehicleType,
      ownerName,
      contactPhone,
      emergencyContact,
      qrCodeUrl: ''
    });

    const qr = await generateVehicleQr(vehicleId, process.env.PUBLIC_BASE_URL);
    await updateVehicleQr(vehicleId, qr.publicUrl);

    return res.status(201).json({
      message: 'Vehicle added successfully.',
      vehicle: {
        id: vehicleId,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        owner_name: ownerName,
        contact_phone: contactPhone,
        emergency_contact: emergencyContact,
        qr_code_url: qr.publicUrl,
        qr_target_url: qr.vehicleLink
      }
    });
  } catch (error) {
    return next(error);
  }
};

const myVehicles = async (req, res, next) => {
  try {
    const vehicles = await listVehiclesByUserId(req.user.id);
    const stats = await getVehicleStatsForUser(req.user.id);

    return res.json({
      vehicles,
      stats
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  addVehicle,
  myVehicles
};
