const { pool, isUsingFileStore } = require('../config/storage');
const { readStore, withStore } = require('../config/fileStore');

const createScan = async ({
  vehicleId,
  ipAddress,
  device,
  latitude = null,
  longitude = null
}) => {
  if (isUsingFileStore()) {
    return withStore(async (data) => {
      const id = data.nextIds.scans++;
      data.scans.push({
        id,
        vehicle_id: Number(vehicleId),
        scan_time: new Date().toISOString(),
        ip_address: ipAddress,
        device,
        latitude,
        longitude
      });
      return id;
    });
  }

  const result = await pool.query(
    `INSERT INTO scans (vehicle_id, ip_address, device, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [vehicleId, ipAddress, device, latitude, longitude]
  );

  return result.rows[0].id;
};

const listScans = async () => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.scans
      .map((scan) => {
        const vehicle = data.vehicles.find((entry) => entry.id === scan.vehicle_id);
        return {
          ...scan,
          vehicle_number: vehicle?.vehicle_number || null,
          owner_name: vehicle?.owner_name || null
        };
      })
      .sort((a, b) => new Date(b.scan_time) - new Date(a.scan_time));
  }

  const result = await pool.query(
    `SELECT
      s.id,
      s.vehicle_id,
      s.scan_time,
      s.ip_address,
      s.device,
      s.latitude,
      s.longitude,
      v.vehicle_number,
      v.owner_name
     FROM scans s
     JOIN vehicles v ON v.id = s.vehicle_id
     ORDER BY s.scan_time DESC`
  );
  return result.rows;
};

const countScans = async () => {
  if (isUsingFileStore()) {
    const data = await readStore();
    return data.scans.length;
  }

  const result = await pool.query('SELECT COUNT(*) AS "totalScans" FROM scans');
  return result.rows[0]?.totalScans || 0;
};

module.exports = {
  createScan,
  listScans,
  countScans
};
