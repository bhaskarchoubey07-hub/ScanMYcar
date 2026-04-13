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
  const { vehicle_id, location } = req.body;

  // Validation
  if (!vehicle_id) {
    return res.status(400).json({ error: "Missing required field: vehicle_id" });
  }

  try {
    const { data, error } = await supabase
      .from("scans")
      .insert([
        {
          vehicle_id,
          city: location || null
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
