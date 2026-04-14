const { generateVehicleQR } = require("../utils/qrUtils");
const supabase = require("../supabaseClient");

/**
 * Handle QR Download Request
 * GET /api/vehicles/qr/:slug
 */
const downloadQR = async (req, res) => {
  const { slug } = req.params;

  try {
    // 1. Verify slug exists
    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select("vehicle_number")
      .eq("qr_slug", slug)
      .single();

    if (error || !vehicle) {
      return res.status(404).json({ error: "QR payload not found." });
    }

    // 2. Generate high-res QR
    const qrDataUrl = await generateVehicleQR(slug);
    
    // 3. Convert DataURL to Buffer
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const img = Buffer.from(base64Data, 'base64');

    // 4. Send as downloadable file
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="ScanMyCar_QR_${vehicle.vehicle_number}.png"`,
      'Content-Length': img.length
    });
    
    return res.end(img);
  } catch (err) {
    console.error("QR Download Error:", err);
    return res.status(500).json({ error: "Failed to generate download." });
  }
};

module.exports = {
  downloadQR
};
