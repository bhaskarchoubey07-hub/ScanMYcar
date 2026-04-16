"use client";

import { motion } from "framer-motion";
import { Download, Printer, ShieldCheck } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";

const THEMES = {
  emerald: "from-emerald-600/20 via-emerald-900/40 to-slate-950",
  blue: "from-blue-600/20 via-blue-900/40 to-slate-950",
  purple: "from-purple-600/20 via-purple-900/40 to-slate-950",
  gold: "from-amber-600/20 via-amber-900/40 to-slate-950"
};

const ACCENTS = {
  emerald: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10 shadow-emerald-500/20",
  blue: "border-blue-500/30 text-blue-400 bg-blue-500/10 shadow-blue-500/20",
  purple: "border-purple-500/30 text-purple-400 bg-purple-500/10 shadow-purple-500/20",
  gold: "border-amber-500/30 text-amber-400 bg-amber-500/10 shadow-amber-500/20"
};

export function PremiumQrCard({ vehicle }) {
  const cardRef = useRef(null);
  const [theme, setTheme] = useState("emerald");
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `QR-Card-${vehicle.vehicle_number}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download QR card", err);
    } finally {
      setDownloading(false);
    }
  };

  const printCard = () => {
    window.print();
  };

  const qrValue = mounted 
    ? `${origin}/v/${vehicle.qr_slug}`
    : `https://scanmycar.com/v/${vehicle.qr_slug}`;

  return (
    <div className="space-y-8">
      {/* Theme Picker */}
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-slate-400">Card Theme:</p>
        <div className="flex gap-2">
          {Object.keys(THEMES).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`size-6 rounded-full border-2 transition-all ${
                theme === t ? "border-white scale-110" : "border-transparent opacity-50 hover:opacity-100"
              }`}
              style={{ backgroundColor: t === "emerald" ? "#10b981" : t === "blue" ? "#3b82f6" : t === "purple" ? "#a855f7" : "#f59e0b" }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-10 lg:flex-row lg:items-start">
        {/* Actual Card Container */}
        <div className="print:m-0 print:p-0">
          <div
            ref={cardRef}
            className={`relative w-[380px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br p-8 shadow-2xl transition-colors duration-700 ${THEMES[theme]}`}
          >
            {/* Glossy Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opaicty-20" />
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl border p-2 ${ACCENTS[theme]}`}>
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">Smart Vehicle Identity</h3>
                  <p className="text-[10px] tracking-widest text-slate-400 uppercase">Emergency Response System</p>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div className="relative mt-8 flex justify-center">
              <div className={`relative rounded-3xl border-2 bg-white p-4 shadow-xl transition-all ${ACCENTS[theme].split(" ")[0]}`}>
                {/* Visual pulse glow behind QR */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className={`absolute inset-0 -z-10 rounded-3xl blur-2xl ${ACCENTS[theme].split(" ")[3]}`}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}`}
                  alt="Vehicle QR"
                  className="size-48"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="mt-10 space-y-4">
              <div className="text-center">
                <p className={`text-xs font-bold uppercase tracking-[0.4em] ${ACCENTS[theme].split(" ")[1]}`}>Vehicle Number</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-white">{vehicle.vehicle_number}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Authorized Owner</p>
                  <p className="text-sm font-semibold text-white truncate">{vehicle.owner_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500">Emergency SOS</p>
                  <p className={`text-sm font-bold ${ACCENTS[theme].split(" ")[1]}`}>{vehicle.emergency_contact}</p>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-black/40 py-2 px-4 border border-white/5">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Encrypted Identity Secured by ScanMyCar</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-[380px]">
          <div className="glass-panel space-y-4 rounded-3xl p-6">
            <h4 className="font-semibold text-white">Identity Card Controls</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Download this card for high-resolution printing. You can keep a physical copy in your vehicle for roadside emergencies.
            </p>
            
            <button
              onClick={downloadCard}
              disabled={downloading}
              className="primary-button w-full flex items-center justify-center gap-3"
            >
              {downloading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Download className="size-4" />
              )}
              {downloading ? "Processing..." : "Download as PNG"}
            </button>
            
            <button
              onClick={printCard}
              className="secondary-button w-full flex items-center justify-center gap-3"
            >
              <Printer className="size-4" />
              Print Layout
            </button>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
            <p className="text-xs text-slate-500 leading-relaxed italic">
              * The dynamic QR code redirects scans to your public identity profile, where people can view your emergency contact or medical info instantly.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 380px;
          }
        }
      `}</style>
    </div>
  );
}
