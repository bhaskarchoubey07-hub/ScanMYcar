const { listUsers } = require('../models/userModel');
const { listAllVehicles } = require('../models/vehicleModel');
const { listScans, countScans } = require('../models/scanModel');

const getUsers = async (req, res, next) => {
  try {
    const users = await listUsers();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
};

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await listAllVehicles();
    return res.json({ vehicles });
  } catch (error) {
    return next(error);
  }
};

const getScans = async (req, res, next) => {
  try {
    const scans = await listScans();
    const totalScans = await countScans();
    return res.json({ scans, totalScans });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUsers,
  getVehicles,
  getScans
};
