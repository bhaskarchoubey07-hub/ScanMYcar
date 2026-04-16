import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { csvEscape } from "@/lib/utils";

export async function GET() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  let query = supabase.from("vehicles").select("*").order("created_at", { ascending: false });
  if (profile?.role !== "admin") {
    query = query.eq("user_id", user.id);
  }

  const { data: vehicles = [] } = await query;
  const csv = [
    ["vehicle_number", "owner_name", "owner_phone", "emergency_contact", "medical_info", "created_at"].join(","),
    ...vehicles.map((vehicle) =>
      [
        csvEscape(vehicle.vehicle_number),
        csvEscape(vehicle.owner_name),
        csvEscape(vehicle.owner_phone),
        csvEscape(vehicle.emergency_contact),
        csvEscape(vehicle.medical_info || ""),
        csvEscape(vehicle.created_at)
      ].join(",")
    )
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vehicles-export.csv"'
    }
  });
}
