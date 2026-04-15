const supabase = require("../supabaseClient");

// GET /api/scans
const getAllScans = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllScans:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/scans
const createScan = async (req, res) => {
  const { vehicleId, latitude, longitude, city } = req.body;
  const userAgent = req.headers["user-agent"] || "Unknown";

  if (!vehicleId) {
    return res.status(400).json({ error: "Missing required field: vehicleId" });
  }

  try {
    const { data, error } = await supabase
      .from("scans")
      .insert([
        {
          vehicle_id: vehicleId,
          user_agent: userAgent,
          latitude: latitude || null,
          longitude: longitude || null,
          city: city || null
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error in createScan:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllScans,
  createScan
};
