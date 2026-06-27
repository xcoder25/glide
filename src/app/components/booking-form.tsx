"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, X, Clock, Compass } from "lucide-react";

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

// Preset locations in Uyo, Akwa Ibom State
export const PRESET_LOCATIONS: LocationData[] = [
  { name: "Akwa Ibom Airport", lat: 5.0273, lng: 7.9961, address: "Airport Road, Uyo, Akwa Ibom State" },
  { name: "University of Uyo (UNIUYO)", lat: 5.0419, lng: 7.9238, address: "Ikpa Road, Uyo, Akwa Ibom State" },
  { name: "Uyo City Mall", lat: 5.0277, lng: 7.9262, address: "Abak Road, Uyo, Akwa Ibom State" },
  { name: "Ibom Plaza", lat: 5.0325, lng: 7.9255, address: "Abak Road, Uyo, Akwa Ibom State" },
  { name: "Akwa Ibom Government House", lat: 5.0248, lng: 7.9363, address: "Wellington Bassey Way, Uyo" },
  { name: "Ibom Specialist Hospital", lat: 5.0218, lng: 7.9418, address: "Itam, Uyo, Akwa Ibom State" },
  { name: "Uyo Central Market", lat: 5.0305, lng: 7.9222, address: "Ekpenyong Ntuk St, Uyo, Akwa Ibom" },
  { name: "Godswill Akpabio Stadium", lat: 5.0503, lng: 7.9085, address: "Oron Road, Uyo, Akwa Ibom State" },
  { name: "Ibom Icon Hotel & Golf Resort", lat: 5.0112, lng: 7.9491, address: "Nwaniba Road, Uyo, Akwa Ibom" },
  { name: "Legacy Polytechnic", lat: 5.0467, lng: 7.8975, address: "Ikot Osurua, Ikot Ekpene Rd, Uyo" },
];

interface BookingFormProps {
  onRouteSelected: (pickup: LocationData, dropoff: LocationData) => void;
  onClear: () => void;
}

export default function BookingForm({ onRouteSelected, onClear }: BookingFormProps) {
  const [pickupInput, setPickupInput] = useState("");
  const [dropoffInput, setDropoffInput] = useState("");
  
  const [selectedPickup, setSelectedPickup] = useState<LocationData | null>(null);
  const [selectedDropoff, setSelectedDropoff] = useState<LocationData | null>(null);
  
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [activeSearch, setActiveSearch] = useState<"pickup" | "dropoff" | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setActiveSearch(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle autocomplete
  const handleInputChange = (value: string, type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickupInput(value);
      if (selectedPickup && value !== selectedPickup.name) {
        setSelectedPickup(null);
        onClear();
      }
    } else {
      setDropoffInput(value);
      if (selectedDropoff && value !== selectedDropoff.name) {
        setSelectedDropoff(null);
        onClear();
      }
    }

    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    // Filter preset locations based on search query
    const filtered = PRESET_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase()) ||
        loc.address.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const handleFocus = (type: "pickup" | "dropoff") => {
    setActiveSearch(type);
    const value = type === "pickup" ? pickupInput : dropoffInput;
    if (value.trim().length === 0) {
      // Show all presets as recent searches when input is empty
      setSuggestions(PRESET_LOCATIONS.slice(0, 5));
    } else {
      handleInputChange(value, type);
    }
  };

  const selectSuggestion = (location: LocationData) => {
    if (activeSearch === "pickup") {
      setSelectedPickup(location);
      setPickupInput(location.name);
      
      // Auto focus dropoff if empty
      if (!selectedDropoff) {
        setTimeout(() => {
          const dropoffField = document.getElementById("dropoff-input");
          dropoffField?.focus();
        }, 100);
      }
    } else if (activeSearch === "dropoff") {
      setSelectedDropoff(location);
      setDropoffInput(location.name);
    }

    setSuggestions([]);
    setActiveSearch(null);
  };

  // Submit route once both are selected
  useEffect(() => {
    if (selectedPickup && selectedDropoff) {
      onRouteSelected(selectedPickup, selectedDropoff);
    }
  }, [selectedPickup, selectedDropoff, onRouteSelected]);

  // Use current location simulation
  const handleUseCurrentLocation = () => {
    const currentLoc: LocationData = {
      name: "My Current Location",
      lat: 5.0301,
      lng: 7.9273,
      address: "Uyo, Akwa Ibom State (Simulated)"
    };
    setSelectedPickup(currentLoc);
    setPickupInput(currentLoc.name);
    
    // Auto focus dropoff
    setTimeout(() => {
      const dropoffField = document.getElementById("dropoff-input");
      dropoffField?.focus();
    }, 100);
  };

  const clearInput = (type: "pickup" | "dropoff") => {
    if (type === "pickup") {
      setPickupInput("");
      setSelectedPickup(null);
    } else {
      setDropoffInput("");
      setSelectedDropoff(null);
    }
    setSuggestions([]);
    onClear();
  };

  return (
    <div ref={formRef} style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
      
      {/* Route Inputs Wrapper */}
      <div style={{ display: "flex", position: "relative", gap: "14px" }}>
        
        {/* Sleek Vertical Connector Line */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 0",
            width: "24px",
          }}
        >
          {/* Pickup Dot (Electric Indigo/Cyan) */}
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              boxShadow: "0 0 10px rgba(217, 95, 0, 0.4)",
              zIndex: 2,
              transition: "transform 0.3s ease",
              transform: activeSearch === "pickup" ? "scale(1.3)" : "scale(1)",
            }}
          />
          {/* Glowing Vertical Line */}
          <div
            style={{
              flex: 1,
              width: "2px",
              background: "linear-gradient(180deg, var(--primary) 0%, var(--accent) 100%)",
              opacity: 0.25,
              margin: "6px 0",
              boxShadow: "0px 1px 3px rgba(217, 95, 0, 0.15)",
            }}
          />
          {/* Dropoff Dot (Electric Sky Blue) */}
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              boxShadow: "0 0 10px rgba(26, 107, 60, 0.4)",
              zIndex: 2,
              transition: "transform 0.3s ease",
              transform: activeSearch === "dropoff" ? "scale(1.3)" : "scale(1)",
            }}
          />
        </div>

        {/* Inputs list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Pickup Input */}
          <div style={{ position: "relative" }}>
            <input
              id="pickup-input"
              type="text"
              placeholder="Enter pickup location..."
              value={pickupInput}
              onChange={(e) => handleInputChange(e.target.value, "pickup")}
              onFocus={() => handleFocus("pickup")}
              style={{
                width: "100%",
                padding: "14px 40px 14px 16px",
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid " + (activeSearch === "pickup" ? "var(--primary)" : "rgba(0, 0, 0, 0.08)"),
                borderRadius: "var(--radius-md)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.25s",
                boxShadow: activeSearch === "pickup" ? "0 0 15px rgba(217, 95, 0, 0.12)" : "none",
              }}
            />
            {pickupInput ? (
              <button
                type="button"
                onClick={() => clearInput("pickup")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  animation: "pulse-slow 2s infinite ease-in-out",
                }}
                title="Use current location"
              >
                <Compass size={16} />
              </button>
            )}
          </div>

          {/* Dropoff Input */}
          <div style={{ position: "relative" }}>
            <input
              id="dropoff-input"
              type="text"
              placeholder="Where to?"
              value={dropoffInput}
              onChange={(e) => handleInputChange(e.target.value, "dropoff")}
              onFocus={() => handleFocus("dropoff")}
              style={{
                width: "100%",
                padding: "14px 40px 14px 16px",
                background: "rgba(255, 255, 255, 0.75)",
                border: "1px solid " + (activeSearch === "dropoff" ? "var(--primary)" : "rgba(0, 0, 0, 0.08)"),
                borderRadius: "var(--radius-md)",
                color: "var(--text-main)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.25s",
                boxShadow: activeSearch === "dropoff" ? "0 0 15px rgba(217, 95, 0, 0.12)" : "none",
              }}
            />
            {dropoffInput && (
              <button
                type="button"
                onClick={() => clearInput("dropoff")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Autocomplete Suggestions Box */}
      {activeSearch && suggestions.length > 0 && (
        <div
          className="glass-panel animate-slide-up"
          style={{
            position: "absolute",
            top: "120px",
            left: 0,
            right: 0,
            zIndex: 100,
            borderRadius: "var(--radius-md)",
            padding: "8px",
            background: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08), 0 0 20px rgba(99, 102, 241, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "6px 12px 10px 12px",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Clock size={12} /> Recent & Preset Locations
          </div>
          {suggestions.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => selectSuggestion(loc)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.04)";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0px)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.02)",
                  color: activeSearch === "pickup" ? "var(--primary)" : "var(--accent)",
                  border: "1px solid rgba(0, 0, 0, 0.04)",
                }}
              >
                <MapPin size={15} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{loc.name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                  {loc.address}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
