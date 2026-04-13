const supabase = require("../supabaseClient");

// GET /api/vehicles
const getAllVehicles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAllVehicles:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/vehicles/:id
const getVehicleById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// POST /api/vehicles
const createVehicle = async (req, res) => {
  const { vehicle_number, owner_name, owner_phone, emergency_contact, medical_info } = req.body;

  // Validation
  if (!vehicle_number || !owner_name || !owner_phone || !emergency_contact) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .insert([
        {
          vehicle_number,
          owner_name,
          owner_phone,
          emergency_contact,
          medical_info: medical_info || null
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error in createVehicle:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle
};
