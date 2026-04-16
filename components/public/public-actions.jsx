"use client";

import { useEffect, useCallback, useState } from "react";
import { formatPhoneHref, formatWhatsAppHref } from "@/lib/utils";
import { SosSystem } from "./sos-system";
import { createClient } from "@/lib/supabase/browser";

export function PublicActions({ vehicle }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Public profile accessed.");
  const supabase = createClient();

  const logScan = useCallback(async (coords) => {
    const sessionKey = `scan_logged_${vehicle.id}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('scans')
        .insert([{
          vehicle_id: vehicle.id,
          user_agent: navigator.userAgent,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null
        }]);

      if (error) throw error;

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(sessionKey, "true");
      }
      setStatus(coords ? "Location-aware scan logged." : "Anonymous scan recorded.");
    } catch (err) {
      console.error("Auto-scan reporting failed:", err);
    }
  }, [vehicle.id, supabase]);

  useEffect(() => {
    if (!navigator.geolocation) {
      logScan();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        await logScan(coords);
      },
      async () => {
        await logScan();
      }
    );
  }, [logScan]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setLocation(coords);
        setStatus("Live location updated.");
      },
      () => setStatus("Location access denied.")
    );
  };

  return (
    <div className="space-y-6">
      <SosSystem vehicle={vehicle} location={location} />

      <div className="grid gap-3 sm:grid-cols-2">
        <a href={formatPhoneHref(vehicle.owner_phone)} className="primary-button text-center w-full">
          Call Owner
        </a>
        <a href={formatWhatsAppHref(vehicle.owner_phone)} target="_blank" rel="noreferrer" className="secondary-button text-center w-full">
          WhatsApp Message
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={requestLocation} className="secondary-button text-xs font-bold uppercase tracking-widest px-6">
          Refetch GPS
        </button>
        <a href={formatPhoneHref(vehicle.emergency_contact)} className="secondary-button text-xs font-bold uppercase tracking-widest px-6">
          Call Family
        </a>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-[10px] text-slate-400 font-medium">
        <p className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Telemetric Status: {status}
        </p>
        {location && (
          <p className="mt-2 font-mono opacity-60">
            GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}

