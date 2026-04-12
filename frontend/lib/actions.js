"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { generateVehicleQrSvg } from "@/lib/qr";
import { normalizeVehicleNumber, slugFromVehicle } from "@/lib/utils";

async function saveQrAsset(slug) {
  const admin = getAdminClient();
  const svg = await generateVehicleQrSvg(slug);
  const filePath = `qr/${slug}.svg`;

  await admin.storage.from("vehicle-qr").upload(filePath, Buffer.from(svg), {
    contentType: "image/svg+xml",
    upsert: true
  });

  const { data } = admin.storage.from("vehicle-qr").getPublicUrl(filePath);
  return {
    filePath,
    publicUrl: data.publicUrl
  };
}

function readVehiclePayload(formData) {
  return {
    vehicle_number: normalizeVehicleNumber(formData.get("vehicle_number")),
    owner_name: formData.get("owner_name")?.trim(),
    owner_phone: formData.get("owner_phone")?.trim(),
    emergency_contact: formData.get("emergency_contact")?.trim(),
    medical_info: formData.get("medical_info")?.trim() || null,
    is_public: formData.get("is_public") === "on"
  };
}

export async function upsertVehicleAction(formData, scope = "owner", userId = null) {
  const supabase = await createClient();
  const recordId = formData.get("id") || null;
  const payload = readVehiclePayload(formData);
  const effectiveUserId = userId || formData.get("user_id");

  if (!payload.vehicle_number || !payload.owner_name || !payload.owner_phone || !payload.emergency_contact) {
    return { success: false, message: "Complete all required vehicle fields." };
  }

  if (recordId) {
    const { data: existing } = await supabase.from("vehicles").select("*").eq("id", recordId).single();

    if (!existing) {
      return { success: false, message: "Vehicle record not found." };
    }

    const canEdit = existing.user_id === effectiveUserId || scope === "admin";
    if (!canEdit) {
      return { success: false, message: "You do not have permission to edit this vehicle." };
    }

    await supabase.from("vehicles").update(payload).eq("id", recordId);

    try {
      const qr = await saveQrAsset(existing.qr_slug);
      await supabase
        .from("vehicles")
        .update({
          qr_code_path: qr.filePath,
          qr_code_public_url: qr.publicUrl
        })
        .eq("id", recordId);
    } catch {
      // The QR download endpoint remains available even if storage upload is not ready.
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/vehicles");
    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/vehicles/${recordId}/edit`);
    revalidatePath(`/v/${existing.qr_slug}`);

    return {
      success: true,
      message: "Vehicle updated successfully.",
      redirectTo: scope === "admin" ? "/dashboard/admin" : "/dashboard/vehicles"
    };
  }

  const id = randomUUID();
  const slug = slugFromVehicle(payload.vehicle_number, id);
  const { error } = await supabase.from("vehicles").insert({
    ...payload,
    id,
    user_id: effectiveUserId,
    qr_slug: slug
  });

  if (error) {
    return { success: false, message: error.message };
  }

  try {
    const qr = await saveQrAsset(slug);
    await supabase
      .from("vehicles")
      .update({
        qr_code_path: qr.filePath,
        qr_code_public_url: qr.publicUrl
      })
      .eq("id", id);
  } catch {
    // Storage upload can be configured later without blocking record creation.
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard/admin");
  revalidatePath(`/v/${slug}`);

  return {
    success: true,
    message: "Vehicle created and QR code generated.",
    redirectTo: "/dashboard/vehicles"
  };
}

export async function deleteVehicleAction(vehicleId, userId) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("vehicles").select("*").eq("id", vehicleId).single();

  if (!existing) {
    return { success: false, message: "Vehicle not found." };
  }

  if (existing.user_id !== userId) {
    return { success: false, message: "You do not have permission to delete this vehicle." };
  }

  await supabase.from("vehicles").delete().eq("id", vehicleId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vehicles");
  revalidatePath("/dashboard/admin");

  return { success: true, message: "Vehicle deleted." };
}
