import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  try {
    const admin = getAdminClient();
    const payload = await request.json();
    const headerList = await headers();

    const { error } = await admin.from("scans").insert({
      vehicle_id: payload.vehicleId,
      latitude: payload.latitude,
      longitude: payload.longitude,
      city: headerList.get("x-vercel-ip-city") || null,
      region: headerList.get("x-vercel-ip-country-region") || null,
      user_agent: headerList.get("user-agent") || "Unknown"
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
