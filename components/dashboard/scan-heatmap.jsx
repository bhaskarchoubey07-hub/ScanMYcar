"use client";

import { useEffect, useState } from "react";
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Tooltip,
  useMap 
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";

// Helper to update map flyTo when scans change significantly
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 20 || center[1] !== 77) {
      map.flyTo(center, 12, { duration: 2 });
    }
  }, [center, map]);
  return null;
}

export default function ScanHeatmap({ scans = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-slate-900/50 animate-pulse rounded-3xl" />;

  // Default center (India or generic)
  const lastScan = scans[0];
  const center = lastScan?.latitude ? [lastScan.latitude, lastScan.longitude] : [20, 77];

  return (
    <div className="glass-panel overflow-hidden rounded-3xl h-[400px] relative border border-white/10">
      <div className="absolute top-4 left-4 z-[1000] rounded-full bg-slate-950/80 px-4 py-2 border border-white/10 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
          <div className="size-2 rounded-full bg-neon animate-pulse" />
          Live Spatial Analytics
        </p>
      </div>

      <MapContainer 
        center={center} 
        zoom={5} 
        style={{ height: "100%", width: "100%", background: "#020617" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapController center={center} />

        {scans.map((scan) => {
          if (!scan.latitude || !scan.longitude) return null;
          
          return (
            <CircleMarker
              key={scan.id}
              center={[scan.latitude, scan.longitude]}
              radius={8}
              pathOptions={{
                fillColor: "#38bdf8",
                color: "#1e293b",
                weight: 1,
                fillOpacity: 0.6
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={1} permanent={false}>
                <div className="rounded-lg bg-slate-900 p-2 text-xs font-semibold text-white">
                  {scan.city || "Scan location"}
                  <p className="text-[10px] font-normal text-slate-400 mt-1">
                    {new Date(scan.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
