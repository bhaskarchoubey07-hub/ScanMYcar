import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const admin = getAdminClient();
    const headerList = await headers();
    const payload = await request.json();

    const { error } = await admin.from("alerts").insert({
      vehicle_id: payload.vehicleId,
      alert_type: payload.alertType || "sos",
      message: payload.message || "Emergency alert from public scan page.",
      latitude: payload.latitude,
      longitude: payload.longitude,
      city: headerList.get("x-vercel-ip-city") || null,
      region: headerList.get("x-vercel-ip-country-region") || null,
      status: "open"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
