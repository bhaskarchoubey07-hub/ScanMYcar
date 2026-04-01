const { pool, isUsingFileStore } = require('../config/storage');
const { readStore, withStore } = require('../config/fileStore');

const normalizeVehicleScanCount = (vehicle) => ({
  ...vehicle,
  total_scans: Number(vehicle.total_scans || 0)
});

const createVehicle = async ({
  userId,
  vehicleNumber,
  vehicleType,
  ownerName,
  contactPhone,
  emergencyContact,
  qrCodeUrl
}) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      const id = data.nextIds.vehicles++;
      data.vehicles.push({
        id,
        user_id: Number(userId),
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        owner_name: ownerName,
        contact_phone: contactPhone,
        emergency_contact: emergencyContact,
        qr_code_url: qrCodeUrl,
        created_at: new Date().toISOString()
      });
      return id;
    });
  }

  const result = await pool.query(
    `INSERT INTO vehicles (
      user_id,
      vehicle_number,
      vehicle_type,
      owner_name,
      contact_phone,
      emergency_contact,
      qr_code_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [userId, vehicleNumber, vehicleType, ownerName, contactPhone, emergencyContact, qrCodeUrl]
  );

  return result.rows[0].id;
};

const updateVehicleQr = async (vehicleId, qrCodeUrl) => {
  if (isUsingFileStore()) {
    await withStore(async (data) => {
      const vehicle = data.vehicles.find((entry) => entry.id === Number(vehicleId));
      if (vehicle) {
        vehicle.qr_code_url = qrCodeUrl;
      }
    });
    return;
  }

  await pool.query('UPDATE vehicles SET qr_code_url = $1 WHERE id = $2', [qrCodeUrl, vehicleId]);
};

const findVehicleById = async (vehicleId) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    const vehicle = data.vehicles.find((entry) => entry.id === Number(vehicleId));
    if (!vehicle) {
      return null;
    }

    const user = data.users.find((entry) => entry.id === vehicle.user_id);
    return {
      ...vehicle,
      user_email: user?.email || null
    };
  }

  const result = await pool.query(
    `SELECT v.*, u.email AS user_email
     FROM vehicles v
     JOIN users u ON u.id = v.user_id
     WHERE v.id = $1
     LIMIT 1`,
    [vehicleId]
  );
  return result.rows[0] || null;
};

const listVehiclesByUserId = async (userId) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.vehicles
      .filter((vehicle) => vehicle.user_id === Number(userId))
      .map((vehicle) => ({
        ...vehicle,
        total_scans: data.scans.filter((scan) => scan.vehicle_id === vehicle.id).length
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const result = await pool.query(
    `SELECT
      v.*,
      COUNT(s.id) AS total_scans
     FROM vehicles v
     LEFT JOIN scans s ON s.vehicle_id = v.id
     WHERE v.user_id = $1
     GROUP BY v.id
     ORDER BY v.created_at DESC`,
    [userId]
  );
  return result.rows.map(normalizeVehicleScanCount);
};

const listAllVehicles = async () => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.vehicles
      .map((vehicle) => {
        const user = data.users.find((entry) => entry.id === vehicle.user_id);
        return {
          ...vehicle,
          user_name: user?.name || null,
          user_email: user?.email || null,
          total_scans: data.scans.filter((scan) => scan.vehicle_id === vehicle.id).length
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const result = await pool.query(
    `SELECT
      v.*,
      u.name AS user_name,
      u.email AS user_email,
      COUNT(s.id) AS total_scans
     FROM vehicles v
     JOIN users u ON u.id = v.user_id
     LEFT JOIN scans s ON s.vehicle_id = v.id
     GROUP BY v.id, u.name, u.email
     ORDER BY v.created_at DESC`
  );
  return result.rows.map(normalizeVehicleScanCount);
};

const getVehicleStatsForUser = async (userId) => {
  if (isUsingFileStore()) {
    const data = await readStore();
    const userVehicles = data.vehicles.filter((vehicle) => vehicle.user_id === Number(userId));
    const totalScans = userVehicles.reduce(
      (count, vehicle) => count + data.scans.filter((scan) => scan.vehicle_id === vehicle.id).length,
      0
    );

    return {
      totalVehicles: userVehicles.length,
      totalScans
    };
  }

  const result = await pool.query(
    `SELECT
      COUNT(*) AS totalVehicles,
      COALESCE(SUM(scan_count), 0) AS totalScans
     FROM (
       SELECT v.id, COUNT(s.id) AS scan_count
       FROM vehicles v
       LEFT JOIN scans s ON s.vehicle_id = v.id
       WHERE v.user_id = $1
       GROUP BY v.id
     ) AS stats`,
    [userId]
  );

  return {
    totalVehicles: Number(result.rows[0]?.totalvehicles || 0),
    totalScans: Number(result.rows[0]?.totalscans || 0)
  };
};

module.exports = {
  createVehicle,
  updateVehicleQr,
  findVehicleById,
  listVehiclesByUserId,
  listAllVehicles,
  getVehicleStatsForUser
};
