const supabase = require("../supabaseClient");

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
    const { data: vehicle, error: vError } = await supabase
      .from("vehicles")
      .select("vehicle_number, owner_name, emergency_contact, user_id")
      .eq("id", vehicle_id)
      .single();

    if (vError || !vehicle) {
      return res.status(404).json({ error: "Vehicle not found." });
    }

    // 2. Create the alert entry
    const { data: alert, error: aError } = await supabase
      .from("alerts")
      .insert([
        {
          vehicle_id,
          alert_type: alert_type || "sos",
          message: message || `Emergency escalation triggered for ${vehicle.vehicle_number}`,
          status: "open",
          latitude,
          longitude,
          city,
          region
        }
      ])
      .select();

    if (aError) {
      return res.status(500).json({ error: aError.message });
    }

    // 3. Simulate WhatsApp/SMS Notification
    console.log(`[FINTECH-ALERTS] CRITICAL SOS ESCALATION`);
    console.log(`[NOTIFY] To Owner: ${vehicle.owner_name} (${vehicle.emergency_contact})`);
    console.log(`[MSG] Your vehicle ${vehicle.vehicle_number} has triggered an SOS alert!`);
    if (latitude) console.log(`[URL] Live Location: https://www.google.com/maps?q=${latitude},${longitude}`);

    return res.status(201).json({
      message: "SOS alert triggered and owner notified successfully.",
      alert: alert[0]
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
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicle_id)
      .eq("user_id", userId)
      .single();

    if (!vehicle) {
      return res.status(403).json({ error: "Unauthorized access to alerts." });
    }

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("vehicle_id", vehicle_id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  triggerSos,
  getVehicleAlerts
};
