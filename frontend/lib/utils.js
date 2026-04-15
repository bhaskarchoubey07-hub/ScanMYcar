export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatDayLabel(value) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatPhoneHref(value) {
  return `tel:${String(value || "").replace(/[^\d+]/g, "")}`;
}

export function formatWhatsAppHref(value, text = "Emergency support required for your vehicle.") {
  const phone = String(value || "").replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function normalizeVehicleNumber(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function slugFromVehicle(vehicleNumber, id) {
  return `${normalizeVehicleNumber(vehicleNumber).toLowerCase()}-${String(id).slice(0, 8)}`;
}

export function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://scan-m-ycar-frontend.vercel.app");

  return url.endsWith("/") ? url : `${url}/`;
}

export function getSiteUrl() {
  return getURL().slice(0, -1);
}

export function getAuthRedirectUrl() {
  return `${getURL()}auth/callback`;
}

export function buildPublicVehicleUrl(slug) {
  return `${getSiteUrl()}/v/${slug}`;
}

export function csvEscape(value) {
  const content = String(value ?? "");
  if (content.includes(",") || content.includes('"') || content.includes("\n")) {
    return `"${content.replace(/"/g, '""')}"`;
  }
  return content;
}
