"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { LocationData } from "./booking-form";
import { RideStatus } from "./active-ride";

interface MapProps {
  pickup: LocationData | null;
  dropoff: LocationData | null;
  status: RideStatus;
  deviceLocation?: LocationData | null;
}

// Helper component to auto-focus map bounds on route change with responsive overlays offsets
function MapController({
  pickup,
  dropoff,
  deviceLocation,
}: {
  pickup: LocationData | null;
  dropoff: LocationData | null;
  deviceLocation: LocationData | null;
}) {
  const map = useMap();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      
      // Calculate responsive offsets: 
      // Desktop: floating card is 420px wide on left. Add 480px left padding.
      // Mobile: bottom sheet is ~320px tall on bottom. Add 360px bottom padding.
      if (isMobile) {
        map.fitBounds(bounds, {
          paddingTopLeft: [40, 40],
          paddingBottomRight: [40, 360],
          maxZoom: 15
        });
      } else {
        map.fitBounds(bounds, {
          paddingTopLeft: [60, 60],
          paddingBottomRight: [60, 60],
          maxZoom: 15
        });
      }
    } else if (pickup) {
      if (isMobile) {
        // Offset center upward on mobile to make room for bottom sheet
        const offsetLat = pickup.lat - 0.006;
        map.setView([offsetLat, pickup.lng], 14);
      } else {
        // Map is side-by-side on desktop, center normally
        map.setView([pickup.lat, pickup.lng], 14);
      }
    } else if (dropoff) {
      map.setView([dropoff.lat, dropoff.lng], 14);
    } else if (deviceLocation) {
      map.setView([deviceLocation.lat, deviceLocation.lng], 13);
    } else {
      // Default to Lagos, Nigeria
      map.setView([6.5244, 3.3792], 13);
    }
  }, [pickup, dropoff, deviceLocation, map, isMobile]);

  return null;
}

export default function Map({ pickup, dropoff, status, deviceLocation = null }: MapProps) {
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  
  // Custom icons for Leaflet
  const [icons, setIcons] = useState<{
    pickup: L.DivIcon;
    dropoff: L.DivIcon;
    driver: L.DivIcon;
  } | null>(null);

  useEffect(() => {
    setIcons({
      pickup: L.divIcon({
        html: `<div class="pulse-marker"><div class="pulse-ring"></div><div class="pulse-core"></div></div>`,
        className: "custom-leaflet-icon-pickup",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      dropoff: L.divIcon({
        html: `<div style="
          width: 14px; 
          height: 14px; 
          background: #1A6B3C; 
          border: 2px solid white; 
          border-radius: 4px; 
          box-shadow: 0 2px 10px rgba(26, 107, 60, 0.6);
          transform: rotate(45deg);
        "></div>`,
        className: "custom-leaflet-icon-dropoff",
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      }),
      driver: L.divIcon({
        html: `<div style="
          width: 36px; 
          height: 36px; 
          background: #ffffff; 
          border: 2.5px solid #D95F00; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 15px rgba(217, 95, 0, 0.35);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#D95F00" stroke="#D95F00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg); margin-left: -1px; margin-top: -1px;">
            <polygon points="12 2 2 22 12 17 22 22 12 2"></polygon>
          </svg>
        </div>`,
        className: "custom-leaflet-icon-driver",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      })
    });
  }, []);

  // Driver movement simulation
  useEffect(() => {
    if (!pickup || !dropoff) {
      setDriverPos(null);
      return;
    }

    let interval: NodeJS.Timeout;
    let progress = 0;

    if (status === "arriving") {
      const startLat = pickup.lat + 0.004;
      const startLng = pickup.lng + 0.004;
      setDriverPos([startLat, startLng]);

      interval = setInterval(() => {
        progress += 2;
        if (progress >= 100) {
          setDriverPos([pickup.lat, pickup.lng]);
          clearInterval(interval);
        } else {
          const lat = startLat + (pickup.lat - startLat) * (progress / 100);
          const lng = startLng + (pickup.lng - startLng) * (progress / 100);
          setDriverPos([lat, lng]);
        }
      }, 200);

    } else if (status === "arrived") {
      setDriverPos([pickup.lat, pickup.lng]);

    } else if (status === "inprogress") {
      interval = setInterval(() => {
        progress += 1;
        if (progress >= 100) {
          setDriverPos([dropoff.lat, dropoff.lng]);
          clearInterval(interval);
        } else {
          const lat = pickup.lat + (dropoff.lat - pickup.lat) * (progress / 100);
          const lng = pickup.lng + (dropoff.lng - pickup.lng) * (progress / 100);
          setDriverPos([lat, lng]);
        }
      }, 150);

    } else if (status === "completed") {
      setDriverPos([dropoff.lat, dropoff.lng]);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pickup, dropoff, status]);

  if (!icons) return <div style={{ height: "100%", width: "100%", background: "#f8fafc" }}></div>;

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={deviceLocation ? [deviceLocation.lat, deviceLocation.lng] : [6.5244, 3.3792]}
        zoom={13}
        zoomControl={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController pickup={pickup} dropoff={dropoff} deviceLocation={deviceLocation} />

        {/* Pickup Pin */}
        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={icons.pickup} />
        )}

        {/* Dropoff Pin */}
        {dropoff && (
          <Marker position={[dropoff.lat, dropoff.lng]} icon={icons.dropoff} />
        )}

        {/* Active Route Polyline */}
        {pickup && dropoff && (
          <Polyline
            positions={[
              [pickup.lat, pickup.lng],
              [dropoff.lat, dropoff.lng],
            ]}
            color="var(--primary)"
            weight={4}
            opacity={0.7}
            dashArray="8, 6"
          />
        )}

        {/* Driver Vehicle Pin */}
        {driverPos && (
          <Marker position={driverPos} icon={icons.driver} />
        )}
      </MapContainer>
    </div>
  );
}
