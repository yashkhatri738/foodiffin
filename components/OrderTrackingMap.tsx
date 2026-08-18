"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Custom Leaflet DivIcons to avoid image loading issues
const createRiderIcon = () => {
  return L.divIcon({
    html: `<div class="w-9 h-9 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-lg text-lg animate-bounce">🚴</div>`,
    className: "custom-rider-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const createCustomerIcon = () => {
  return L.divIcon({
    html: `<div class="w-9 h-9 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg text-lg">🏠</div>`,
    className: "custom-customer-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const createKitchenIcon = () => {
  return L.divIcon({
    html: `<div class="w-9 h-9 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center shadow-lg text-lg">🍳</div>`,
    className: "custom-kitchen-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

interface OrderTrackingMapProps {
  customerLat: number;
  customerLng: number;
  kitchenLat: number;
  kitchenLng: number;
  riderLat?: number | null;
  riderLng?: number | null;
  riderName?: string;
  kitchenName?: string;
}

export default function OrderTrackingMap({
  customerLat,
  customerLng,
  kitchenLat,
  kitchenLng,
  riderLat,
  riderLng,
  riderName = "Delivery Partner",
  kitchenName = "Kitchen",
}: OrderTrackingMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-80 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-500 font-medium">
        Loading tracker map...
      </div>
    );
  }

  // Midpoint centering
  const centerLat = (customerLat + kitchenLat) / 2;
  const centerLng = (customerLng + kitchenLng) / 2;

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden shadow-inner border border-stone-250/60 relative z-10">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Customer Home */}
        <Marker position={[customerLat, customerLng]} icon={createCustomerIcon()}>
          <Popup>
            <div className="text-xs font-semibold text-stone-800">Your Home Address 🏠</div>
          </Popup>
        </Marker>

        {/* Kitchen Location */}
        <Marker position={[kitchenLat, kitchenLng]} icon={createKitchenIcon()}>
          <Popup>
            <div className="text-xs font-semibold text-stone-800">{kitchenName} 🍳</div>
          </Popup>
        </Marker>

        {/* Rider Live GPS Marker */}
        {riderLat && riderLng && (
          <Marker position={[riderLat, riderLng]} icon={createRiderIcon()}>
            <Popup>
              <div className="text-xs font-semibold text-stone-800">{riderName} 🚴 (Live Tracking)</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
