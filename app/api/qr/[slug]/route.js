import { NextResponse } from "next/server";
import { generateVehicleQrSvg } from "@/lib/qr";

export async function GET(_request, { params }) {
  const { slug } = await params;
  const svg = await generateVehicleQrSvg(slug);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Content-Disposition": `attachment; filename="${slug}.svg"`
    }
  });
}
