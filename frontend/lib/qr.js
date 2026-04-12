import QRCode from "qrcode";
import { buildPublicVehicleUrl } from "@/lib/utils";

export async function generateVehicleQrSvg(slug) {
  return QRCode.toString(buildPublicVehicleUrl(slug), {
    type: "svg",
    margin: 1,
    color: {
      dark: "#38bdf8",
      light: "#0b1120"
    }
  });
}
