const supabase = require("../supabaseClient");
const crypto = require("crypto");

/**
 * Generate a unique 8-character QR slug
 */
const generateSlug = () => crypto.randomBytes(4).toString("hex");

// GET /api/vehicles
const getAllVehicles = async (req, res) => {
  const userId = req.user.id; // From authenticate middleware

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
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
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
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
  const { 
    vehicle_number, 
    vehicle_type, 
    owner_name, 
    contact_phone, 
    emergency_contact, 
    medical_info,
    is_public 
  } = req.body;
  const userId = req.user.id;

  // Validation
  if (!vehicle_number || !vehicle_type || !owner_name || !contact_phone || !emergency_contact) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const qr_slug = generateSlug();
    
    const { data, error } = await supabase
      .from("vehicles")
      .insert([
        {
          user_id: userId,
          vehicle_number,
          vehicle_type,
          owner_name,
          owner_phone: contact_phone,
          emergency_contact,
          medical_info: medical_info || null,
          qr_slug,
          is_public: is_public ?? true
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

// PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { vehicle_number, vehicle_type, owner_name, contact_phone, emergency_contact, medical_info, is_public } = req.body;
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .update({
        vehicle_number,
        vehicle_type,
        owner_name,
        owner_phone: contact_phone,
        emergency_contact,
        medical_info,
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Vehicle not found or unauthorized" });
    }

    return res.json(data[0]);
  } catch (error) {
    console.error("Error in updateVehicle:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
