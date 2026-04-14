"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  GoogleMap, 
  useJsApiLoader, 
  HeatmapLayer, 
  MarkerClustererF, 
  MarkerF,
  InfoWindowF
} from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 20.5937, // Center of India
  lng: 78.9629,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#020617" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b1" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

const libraries = ["visualization"];

export default function GoogleMapHeatmap({ scans = [] }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [map, setMap] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const heatmapPoints = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    return scans
      .filter(s => s.latitude && s.longitude)
      .map(s => new window.google.maps.LatLng(s.latitude, s.longitude));
  }, [scans, isLoaded]);

  const markers = useMemo(() => {
    return scans.filter(s => s.latitude && s.longitude).map(s => ({
      id: s.id,
      position: { lat: Number(s.latitude), lng: Number(s.longitude) },
      city: s.city,
      time: new Date(s.created_at).toLocaleTimeString()
    }));
  }, [scans]);

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full bg-slate-900/50 animate-pulse rounded-3xl flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Mapping Intel Grid...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden rounded-3xl h-[400px] relative border border-white/10 group">
      <div className="absolute top-4 left-4 z-10 rounded-full bg-slate-950/80 px-4 py-2 border border-white/10 backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
          <div className="size-2 rounded-full bg-neon animate-pulse" />
          Neural Heat Analytics
        </p>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markers[0]?.position || defaultCenter}
        zoom={markers.length > 0 ? 10 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <HeatmapLayer
          data={heatmapPoints}
          options={{
            radius: 30,
            opacity: 0.6,
          }}
        />

        <MarkerClustererF>
          {(clusterer) =>
            markers.map((marker) => (
              <MarkerF
                key={marker.id}
                position={marker.position}
                clusterer={clusterer}
                onClick={() => setSelectedScan(marker)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  fillColor: "#10b981",
                  fillOpacity: 1,
                  strokeWeight: 0,
                  scale: 6,
                }}
              />
            ))
          }
        </MarkerClustererF>

        {selectedScan && (
          <InfoWindowF
            position={selectedScan.position}
            onCloseClick={() => setSelectedScan(null)}
          >
            <div className="p-2 min-w-[120px]">
              <p className="text-xs font-bold text-slate-900">{selectedScan.city || "Scan point"}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{selectedScan.time}</p>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
