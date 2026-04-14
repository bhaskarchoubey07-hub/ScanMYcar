const supabase = require("../supabaseClient");

/**
 * Get Comprehensive Dashboard Data for a User
 * GET /api/dashboard
 */
const getUserDashboardData = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch all vehicles for user
    const { data: vehicles } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!vehicles) return res.json({ vehicles: [], stats: {}, activity: [] });

    const vehicleIds = vehicles.map(v => v.id);

    // 2. Parallel fetch Scans and Alerts
    const [scansResult, alertsResult] = await Promise.all([
      supabase.from("scans").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false }),
      supabase.from("alerts").select("*").in("vehicle_id", vehicleIds).order("created_at", { ascending: false })
    ]);

    const scans = scansResult.data || [];
    const alerts = alertsResult.data || [];

    // 3. Aggregate Activity Feed
    const activity = [
      ...scans.map(s => ({
        id: s.id,
        type: "scan",
        created_at: s.created_at,
        title: "QR Sequence Decoded",
        description: s.city ? `Scan detected in ${s.city}` : "Public scan logged from anonymous node."
      })),
      ...alerts.map(a => ({
        id: a.id,
        type: "alert",
        created_at: a.created_at,
        title: `CRITICAL: ${a.alert_type.toUpperCase()}`,
        description: a.message,
        isLive: a.status === 'open'
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 15);

    // 4. Calculate Stats
    const stats = {
      totalVehicles: vehicles.length,
      totalScans: scans.length,
      activeAlerts: alerts.filter(a => a.status === 'open').length,
      qrDownloads: vehicles.filter(v => v.qr_slug).length
    };

    return res.json({
      vehicles,
      scans: scans.slice(0, 50),
      alerts,
      stats,
      activity
    });

  } catch (error) {
    console.error("Dashboard Data Failure:", error);
    return res.status(500).json({ error: "Telemetry failed." });
  }
};

module.exports = {
  getUserDashboardData
};
