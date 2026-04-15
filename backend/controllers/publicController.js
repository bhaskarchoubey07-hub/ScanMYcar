const { pool } = require("../config/storage");
const UAParser = require("ua-parser-js");

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return forwarded ? forwarded.split(",")[0].trim() : req.ip || "unknown";
};

/**
 * Public Identity Discovery
 */
const getPublicVehicle = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, vehicle_number, vehicle_type, owner_name, owner_phone, emergency_contact, medical_info, is_public FROM public.vehicles WHERE qr_slug = $1 AND is_public = true",
      [slug]
    );

    const vehicle = result.rows[0];

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle identity not found or restricted." });
    }

    return res.json(vehicle);
  } catch (error) {
    console.error("Public Discovery Failure:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Scan Telemetry & AI Anomaly Detection
 */
const logScan = async (req, res) => {
  const { vehicle_id, latitude, longitude, city, region } = req.body;

  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();
    const device = [result.device.vendor, result.device.model, result.browser.name, result.os.name]
      .filter(Boolean)
      .join(" | ") || "Unknown node";

    // 1. Log the scan event
    const { data: scan, error: sError } = await supabase.from("scans").insert([
      {
        vehicle_id,
        ip_address: getClientIp(req),
        device_info: device,
        latitude,
        longitude,
        city,
        region
      }
    ]).select().single();

    if (sError) throw sError;

    // 2. AI Anomaly Detection (Institutional Security)
    // Check for high-frequency scanning (DoS or Tampering)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count, error: cError } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("vehicle_id", vehicle_id)
      .gte("created_at", oneMinuteAgo);

    if (!cError && count > 5) {
      console.log(`[SECURITY-AI] Anomaly detected for vehicle ${vehicle_id}. Triggering auto-alert.`);
      
      // Auto-generate SOS Alert due to tampering
      await supabase.from("alerts").insert([{
        vehicle_id,
        alert_type: "tampering",
        message: `High-frequency scan detected (${count} scans in 60s). Possible malicious activity.`,
        status: "open",
        latitude,
        longitude,
        city
      }]);
    }

    return res.status(201).json({ message: "Scan sequence logged." });
  } catch (error) {
    console.error("Scan Telemetry Failure:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPublicVehicle,
  logScan
};
