const supabase = require("../supabaseClient");

// GET /api/alerts
const getAllAlerts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllAlerts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/alerts
const createAlert = async (req, res) => {
  const { vehicle_id, message } = req.body;

  // Validation
  if (!vehicle_id || !message) {
    return res.status(400).json({ error: "Missing required fields: vehicle_id and message" });
  }

  try {
    const { data, error } = await supabase
      .from("alerts")
      .insert([
        {
          vehicle_id,
          message,
          alert_type: "sos", // Default fallback if needed
          status: "open"
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error in createAlert:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllAlerts,
  createAlert
};
