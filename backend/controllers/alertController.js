const { pool } = require("../config/storage");

/**
 * Trigger an SOS Alert from a public scan page
 */
const triggerSos = async (req, res) => {
  const { vehicle_id, alert_type, message, latitude, longitude, city, region } = req.body;

  if (!vehicle_id) {
    return res.status(400).json({ error: "Vehicle identity required to trigger SOS." });
  }

  try {
    // 1. Fetch vehicle and owner info for the "alert notification"
    const vResult = await pool.query(
      "SELECT vehicle_number, owner_name, emergency_contact, user_id FROM public.vehicles WHERE id = $1",
      [vehicle_id]
    );

    const vehicle = vResult.rows[0];

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // 2. Create the alert entry
    const aResult = await pool.query(
      `INSERT INTO public.alerts (vehicle_id, alert_type, message, status, latitude, longitude, city, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        vehicle_id,
        alert_type || "sos",
        message || `Emergency escalation triggered for ${vehicle.vehicle_number}`,
        "open",
        latitude || null,
        longitude || null,
        city || null,
        region || null
      ]
    );

    const alert = aResult.rows[0];

    // 3. Simulate WhatsApp/SMS Notification
    console.log(`[FINTECH-ALERTS] CRITICAL SOS ESCALATION`);
    console.log(`[NOTIFY] To Owner: ${vehicle.owner_name} (${vehicle.emergency_contact})`);
    console.log(`[MSG] Your vehicle ${vehicle.vehicle_number} has triggered an SOS alert!`);
    if (latitude) console.log(`[URL] Live Location: https://www.google.com/maps?q=${latitude},${longitude}`);

    return res.status(201).json({
      message: "SOS alert triggered and owner notified successfully.",
      alert
    });
  } catch (error) {
    console.error("Error in triggerSos:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get alerts for a specific vehicle (Owner only)
 */
const getVehicleAlerts = async (req, res) => {
  const { vehicle_id } = req.params;
  const userId = req.user.id;

  try {
    // Verify ownership
    const vResult = await pool.query(
      "SELECT id FROM public.vehicles WHERE id = $1 AND user_id = $2",
      [vehicle_id, userId]
    );

    if (vResult.rows.length === 0) {
      return res.status(403).json({ error: "Unauthorized access to alerts." });
    }

    const aResult = await pool.query(
      "SELECT * FROM public.alerts WHERE vehicle_id = $1 ORDER BY created_at DESC",
      [vehicle_id]
    );

    return res.json(aResult.rows);
  } catch (error) {
    console.error("Error in getVehicleAlerts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  triggerSos,
  getVehicleAlerts
};
