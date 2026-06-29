"use client";

import React, { useEffect, useRef, useState } from "react";
import { LocationData } from "./booking-form";
import { RideStatus } from "./active-ride";

interface MapProps {
  pickup: LocationData | null;
  dropoff: LocationData | null;
  status: RideStatus;
  deviceLocation?: LocationData | null;
  surgeMultiplier?: number;
  showSurgeOverlay?: boolean;
  driverLat?: number;
  driverLng?: number;
}

const DEFAULT_MAP_KEY = "AIzaSyC9pjeW86GjRVxD61kagnVyopzLuRamdpA";
const MAP_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEFAULT_MAP_KEY;

export default function Map({
  pickup, dropoff, status, deviceLocation = null, surgeMultiplier = 1, showSurgeOverlay = false,
  driverLat, driverLng
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState(0);

  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropoffMarkerRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const surgeCirclesRef = useRef<any[]>([]);


  // Load Google Maps Script dynamically to prevent build-time/SSR failures
  useEffect(() => {
    const callback = () => setGoogleMapsLoaded(true);
    if (typeof window === "undefined") return;

    if ((window as any).google && (window as any).google.maps) {
      callback();
      return;
    }

    const existingScript = document.getElementById("googleMapsScript");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&libraries=geometry`;
      script.id = "googleMapsScript";
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.head.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkInterval);
          callback();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize Google Maps instance
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    const googleMaps = (window as any).google.maps;
    const defaultCenter = { lat: 5.0301, lng: 7.9273 }; // Uyo, Nigeria
    const center = deviceLocation ? { lat: deviceLocation.lat, lng: deviceLocation.lng } : defaultCenter;

    mapInstanceRef.current = new googleMaps.Map(mapRef.current, {
      center,
      zoom: 13,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        // Custom minimal style to fit Glide's dark/luxury theme
        { featureType: "all", elementType: "labels.text.fill", color: "#747474" },
        { featureType: "administrative", elementType: "geometry.fill", color: "#000000" },
        { featureType: "landscape", elementType: "geometry.fill", color: "#f8fafc" },
        { featureType: "poi", elementType: "geometry.fill", color: "#f1f5f9" },
        { featureType: "road", elementType: "geometry.fill", color: "#ffffff" },
        { featureType: "road.highway", elementType: "geometry.fill", color: "#ffe1cc" },
        { featureType: "road.highway", elementType: "geometry.stroke", color: "#ffc299" },
        { featureType: "water", elementType: "geometry.fill", color: "#cbd5e1" },
      ],
    });
  }, [googleMapsLoaded, deviceLocation]);

  // Function to calculate bearing between two coordinates
  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const lat1 = (startLat * Math.PI) / 180;
    const lat2 = (endLat * Math.PI) / 180;
    const dLng = ((endLng - startLng) * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = Math.atan2(y, x);
    return ((brng * 180) / Math.PI + 360) % 360;
  };

  // Smooth marker interpolation and bearing updates from Firebase streamed coordinates
  useEffect(() => {
    if (driverLat === undefined || driverLng === undefined || driverLat === null || driverLng === null) {
      setDriverPos(null);
      return;
    }

    const startPos = driverPos || [driverLat, driverLng];
    const endPos: [number, number] = [driverLat, driverLng];

    if (startPos[0] === endPos[0] && startPos[1] === endPos[1]) {
      return;
    }

    // Calculate heading/bearing
    const newHeading = calculateBearing(startPos[0], startPos[1], endPos[0], endPos[1]);
    setHeading(newHeading);

    // Smooth transition over 1200ms
    let startTime: number | null = null;
    const duration = 1200;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // cubic bezier-like easeInOutQuad easing
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentLat = startPos[0] + (endPos[0] - startPos[0]) * ease;
      const currentLng = startPos[1] + (endPos[1] - startPos[1]) * ease;

      setDriverPos([currentLat, currentLng]);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [driverLat, driverLng]);

  // Update markers, polyline and bounds
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;

    const googleMaps = (window as any).google.maps;
    const map = mapInstanceRef.current;

    // 1. Pickup Marker (Orange Pulse)
    if (pickup) {
      const position = { lat: pickup.lat, lng: pickup.lng };
      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = new googleMaps.Marker({
          position,
          map,
          icon: {
            url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='6' fill='%23D95F00' stroke='%23ffffff' stroke-width='2.5'/><circle cx='12' cy='12' r='10' fill='none' stroke='%23D95F00' stroke-width='1.5' stroke-opacity='0.4'/></svg>",
            scaledSize: new googleMaps.Size(24, 24),
            anchor: new googleMaps.Point(12, 12),
          },
          title: "Pickup Location",
        });
      } else {
        pickupMarkerRef.current.setPosition(position);
        pickupMarkerRef.current.setMap(map);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.setMap(null);
    }

    // 2. Dropoff Marker (Green Diamond)
    if (dropoff) {
      const position = { lat: dropoff.lat, lng: dropoff.lng };
      if (!dropoffMarkerRef.current) {
        dropoffMarkerRef.current = new googleMaps.Marker({
          position,
          map,
          icon: {
            url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><rect x='4' y='4' width='12' height='12' rx='2' fill='%231A6B3C' stroke='%23ffffff' stroke-width='2' transform='rotate(45 10 10)'/></svg>",
            scaledSize: new googleMaps.Size(20, 20),
            anchor: new googleMaps.Point(10, 10),
          },
          title: "Dropoff Location",
        });
      } else {
        dropoffMarkerRef.current.setPosition(position);
        dropoffMarkerRef.current.setMap(map);
      }
    } else if (dropoffMarkerRef.current) {
      dropoffMarkerRef.current.setMap(null);
    }

    // 3. Polyline Connecting Points
    if (pickup && dropoff) {
      const path = [
        { lat: pickup.lat, lng: pickup.lng },
        { lat: dropoff.lat, lng: dropoff.lng },
      ];
      if (!polylineRef.current) {
        polylineRef.current = new googleMaps.Polyline({
          path,
          geodesic: true,
          strokeColor: "#D95F00",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });
      } else {
        polylineRef.current.setPath(path);
        polylineRef.current.setMap(map);
      }
    } else if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // 4. Center Map / Fit bounds
    if (pickup && dropoff) {
      const bounds = new googleMaps.LatLngBounds();
      bounds.extend({ lat: pickup.lat, lng: pickup.lng });
      bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
      if (driverPos) {
        bounds.extend({ lat: driverPos[0], lng: driverPos[1] });
      }
      map.fitBounds(bounds, { top: 80, bottom: 280, left: 60, right: 60 });
    } else if (pickup) {
      map.setCenter({ lat: pickup.lat, lng: pickup.lng });
      map.setZoom(14);
    } else if (dropoff) {
      map.setCenter({ lat: dropoff.lat, lng: dropoff.lng });
      map.setZoom(14);
    } else if (deviceLocation) {
      map.setCenter({ lat: deviceLocation.lat, lng: deviceLocation.lng });
      map.setZoom(13);
    }
  }, [googleMapsLoaded, pickup, dropoff, deviceLocation, driverPos]);

  // Update Driver position Marker with real-time steering rotation
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;

    const googleMaps = (window as any).google.maps;
    const map = mapInstanceRef.current;

    if (driverPos) {
      const position = { lat: driverPos[0], lng: driverPos[1] };
      if (!driverMarkerRef.current) {
        driverMarkerRef.current = new googleMaps.Marker({
          position,
          map,
          icon: {
            path: "M0-12L10,8L3,5L0,8L-3,5L-10,8Z",
            scale: 2.2,
            fillColor: "#D95F00",
            fillOpacity: 1.0,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            rotation: heading,
          },
          title: "Driver Location (Toyota Corolla)",
        });
      } else {
        driverMarkerRef.current.setPosition(position);
        driverMarkerRef.current.setIcon({
          path: "M0-12L10,8L3,5L0,8L-3,5L-10,8Z",
          scale: 2.2,
          fillColor: "#D95F00",
          fillOpacity: 1.0,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          rotation: heading,
        });
        driverMarkerRef.current.setMap(map);
      }
    } else if (driverMarkerRef.current) {
      driverMarkerRef.current.setMap(null);
    }
  }, [googleMapsLoaded, driverPos, heading]);

  // Update Surge Heatmap circles
  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;

    // Clear old circles
    surgeCirclesRef.current.forEach(c => c.setMap(null));
    surgeCirclesRef.current = [];

    if (showSurgeOverlay && surgeMultiplier > 1) {
      const googleMaps = (window as any).google.maps;
      const map = mapInstanceRef.current;

      const zones = [
        { center: { lat: 5.0325, lng: 7.9255 }, radius: 600, color: "#FF5200", opacity: 0.15 }, // Ibom Plaza
        { center: { lat: 5.0419, lng: 7.9238 }, radius: 800, color: "#F59E0B", opacity: 0.12 }, // UNIUYO
        { center: { lat: 5.0277, lng: 7.9262 }, radius: 500, color: "#FF007A", opacity: 0.15 }, // City Mall
      ];

      zones.forEach(zone => {
        const circle = new googleMaps.Circle({
          strokeColor: zone.color,
          strokeOpacity: 0.35,
          strokeWeight: 1.5,
          fillColor: zone.color,
          fillOpacity: zone.opacity,
          map,
          center: zone.center,
          radius: zone.radius,
          clickable: false,
        });
        surgeCirclesRef.current.push(circle);
      });
    }

    return () => {
      surgeCirclesRef.current.forEach(c => c.setMap(null));
      surgeCirclesRef.current = [];
    };
  }, [googleMapsLoaded, showSurgeOverlay, surgeMultiplier]);

  return (
    <div
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        background: "#070a13",
        position: "relative",
      }}
    >
      {!googleMapsLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#070a13",
            color: "rgba(255,255,255,0.4)",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid rgba(217,95,0,0.4)",
                borderTopColor: "var(--primary)",
                borderRadius: "50%",
                animation: "spin 1s infinite linear",
                margin: "0 auto 12px auto",
              }}
            />
            <span style={{ fontSize: "0.85rem" }}>Loading Google Maps...</span>
          </div>
        </div>
      )}
    </div>
  );
}
