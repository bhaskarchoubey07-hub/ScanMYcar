"use client";

import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { formatPhoneHref, formatWhatsAppHref } from "@/lib/utils";

export function PublicActions({ vehicle }) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Public scan page opened.");
  const [pending, startTransition] = useTransition();

  const logScan = useEffectEvent(async (coords) => {
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
      setStatus(coords ? "Scan logged with location." : "Scan logged.");
    }
  });

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

  const sendAlert = () => {
    startTransition(async () => {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          latitude: location?.latitude || null,
          longitude: location?.longitude || null,
          alertType: "sos",
          message: "SOS alert triggered from public vehicle page."
        })
      });

      setStatus(response.ok ? "Emergency alert sent." : "Unable to send alert right now.");
    });
  };

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
        setStatus("Live location attached for the next SOS alert.");
      },
      () => setStatus("Location permission was denied.")
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <a href={formatPhoneHref(vehicle.owner_phone)} className="primary-button text-center">
          Call owner
        </a>
        <a href={formatWhatsAppHref(vehicle.owner_phone)} target="_blank" rel="noreferrer" className="secondary-button text-center">
          WhatsApp
        </a>
        <button type="button" onClick={sendAlert} disabled={pending} className="danger-button">
          {pending ? "Sending..." : "Emergency alert"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={requestLocation} className="secondary-button">
          Share location
        </button>
        <a href={formatPhoneHref(vehicle.emergency_contact)} className="secondary-button">
          Call emergency contact
        </a>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p>Status: {status}</p>
        {location && (
          <p className="mt-2 text-slate-400">
            Location attached: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}
