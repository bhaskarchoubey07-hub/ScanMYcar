"use client";

import { useEffect, useCallback, useState, useTransition } from "react";
import { formatPhoneHref, formatWhatsAppHref } from "@/lib/utils";
import { SosSystem } from "./sos-system";

export function PublicActions({ vehicle }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Public scan page opened.");
  const [pending, startTransition] = useTransition();

  const logScan = useCallback(async (coords) => {
    const sessionKey = `scan_logged_${vehicle.id}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          latitude: coords?.latitude || null,
          longitude: coords?.longitude || null
        })
      });

      if (response.ok) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(sessionKey, "true");
        }
        setStatus(coords ? "Location-aware scan logged." : "Anonymous scan recorded.");
      }
    } catch (err) {
      console.error("Auto-scan reporting failed:", err);
    }
  }, [vehicle.id]);

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
      setStatus("Geolocation is not supported on this device.");
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
      () => setStatus("Location permission was denied.")
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SOS Critical Feature (Major Upgrade) */}
      <SosSystem vehicle={vehicle} location={location} />

      {/* 2. Owner & Emergency Contact Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={formatPhoneHref(vehicle.owner_phone)} className="primary-button text-center w-full">
          Call owner
        </a>
        <a href={formatWhatsAppHref(vehicle.owner_phone)} target="_blank" rel="noreferrer" className="secondary-button text-center w-full">
          WhatsApp Owner
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={requestLocation} className="secondary-button text-xs font-bold uppercase tracking-widest">
          Refetch GPS Location
        </button>
        <a href={formatPhoneHref(vehicle.emergency_contact)} className="secondary-button text-xs font-bold uppercase tracking-widest">
          Contact Family Directly
        </a>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-xs text-slate-400">
        <p>Telemetric Status: {status}</p>
        {location && (
          <p className="mt-2 font-mono opacity-80">
            GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
}

