"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Navigation, ChevronRight, Check, Zap, Calendar, Clock } from "lucide-react";
import { PRESET_LOCATIONS, type LocationData } from "./booking-form";
import RideSelector, { type RideCategory } from "./ride-selector";

type BookingStep = "pickup" | "dropoff" | "vehicle" | "confirm" | "finding";

interface BookingScreenProps {
  initialPickup?: LocationData;
  initialDropoff?: LocationData;
  deviceLocation?: LocationData | null;
  onConfirmed: (pickup: LocationData, dropoff: LocationData, category: RideCategory, price: number) => void;
  onBack: () => void;
}

function getDistance(a: LocationData, b: LocationData): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))).toFixed(1));
}

function LocationPicker({
  label,
  value,
  onSelect,
  placeholder,
  color,
}: {
  label: string;
  value: LocationData | null;
  onSelect: (loc: LocationData) => void;
  placeholder: string;
  color: string;
}) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState<LocationData[]>([]);

  useEffect(() => { if (value) setQuery(value.name); }, [value]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length < 1) { setResults([]); return; }
    setResults(
      PRESET_LOCATIONS.filter(l =>
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        l.address.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 6)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
        <MapPin size={11} style={{ color }} /> {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "13px 16px",
            border: `1.5px solid ${value ? color : "var(--card-border)"}`,
            borderRadius: "14px",
            fontSize: "0.9rem",
            fontFamily: "var(--font-sans)",
            color: "var(--text-main)",
            background: value ? `${color}08` : "rgba(0,0,0,0.01)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
        />
        {results.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--card-border)",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 50,
            overflow: "hidden",
          }}>
            {results.map((loc, i) => (
              <button
                key={loc.name}
                onMouseDown={() => { onSelect(loc); setQuery(loc.name); setResults([]); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  width: "100%",
                  border: "none",
                  borderBottom: i < results.length - 1 ? "1px solid var(--card-border)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <MapPin size={14} style={{ color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.86rem", fontWeight: 600, color: "var(--text-main)" }}>{loc.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{loc.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingScreen({
  initialPickup,
  initialDropoff,
  deviceLocation = null,
  onConfirmed,
  onBack,
}: BookingScreenProps) {
  const [step, setStep] = useState<BookingStep>(
    initialDropoff ? "vehicle" : initialPickup ? "dropoff" : "pickup"
  );
  const [pickup, setPickup] = useState<LocationData | null>(initialPickup || null);
  const [dropoff, setDropoff] = useState<LocationData | null>(initialDropoff || null);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [findingProgress, setFindingProgress] = useState(0);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // Pre-fill scheduled date/time to 1 hour from now
  useEffect(() => {
    const now = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setScheduledTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }, []);

  const distance = pickup && dropoff ? getDistance(pickup, dropoff) : 0;

  // Sort locations by proximity to deviceLocation
  const sortedLocations = [...PRESET_LOCATIONS];
  if (deviceLocation) {
    sortedLocations.sort((a, b) => {
      const distA = Math.sqrt((a.lat - deviceLocation.lat) ** 2 + (a.lng - deviceLocation.lng) ** 2);
      const distB = Math.sqrt((b.lat - deviceLocation.lat) ** 2 + (b.lng - deviceLocation.lng) ** 2);
      return distA - distB;
    });
  }

  // Filter out the selected pickup location from dropoff recommendations
  const sortedDropoffs = sortedLocations.filter(loc => loc.name !== pickup?.name).slice(0, 4);

  // "Finding driver" fake progress
  useEffect(() => {
    if (step !== "finding") return;
    const interval = setInterval(() => {
      setFindingProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          if (pickup && dropoff && selectedCategory) {
            onConfirmed(pickup, dropoff, selectedCategory, selectedPrice);
          }
          return 100;
        }
        return p + 4;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [step]);

  const steps: BookingStep[] = ["pickup", "dropoff", "vehicle", "confirm"];
  const stepIdx = steps.indexOf(step === "finding" ? "confirm" : step);

  const STEP_LABELS = ["Pickup", "Destination", "Vehicle", "Confirm"];

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={onBack}
            style={{
              width: 38,
              height: 38,
              borderRadius: "12px",
              border: "1px solid var(--card-border)",
              background: "rgba(0,0,0,0.02)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>Book a Ride</h2>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Step {Math.min(stepIdx + 1, 4)} of 4</p>
          </div>
        </div>

        {/* Step Progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {STEP_LABELS.map((label, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  height: "4px",
                  borderRadius: "99px",
                  background: done || active ? "var(--primary)" : "rgba(0,0,0,0.08)",
                  opacity: done ? 0.5 : active ? 1 : 0.3,
                  transition: "all 0.3s ease",
                }} />
                <p style={{ fontSize: "0.6rem", fontWeight: 600, color: done || active ? "var(--primary)" : "var(--text-muted)", marginTop: "4px", textAlign: "center" }}>
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* STEP: Finding Driver */}
        {step === "finding" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "32px 0" }}>
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <div className="finding-pulse" style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(217,95,0,0.35)",
              }}>
                <Zap size={36} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>Finding your driver...</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px" }}>Connecting with nearby Glide operators</p>
            </div>
            <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                width: `${findingProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
                borderRadius: "99px",
                transition: "width 0.1s linear",
              }} />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{findingProgress}% matched</p>
          </div>
        )}

        {/* STEP: Pickup */}
        {step === "pickup" && (
          <>
            <LocationPicker
              label="Pickup Location"
              value={pickup}
              onSelect={setPickup}
              placeholder="Search pickup point..."
              color="var(--primary)"
            />
            <button
              onClick={() => {
                const currentLoc: LocationData = deviceLocation || {
                  name: "My Current Location",
                  lat: 5.0301,
                  lng: 7.9273,
                  address: "Uyo, Akwa Ibom State",
                };
                setPickup(currentLoc);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: "rgba(26,107,60,0.06)",
                border: "1px solid rgba(26,107,60,0.15)",
                borderRadius: "12px",
                color: "var(--accent)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                width: "100%",
              }}
            >
              <Navigation size={15} /> Use current location
            </button>
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Nearby Places</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sortedLocations.slice(0, 4).map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => setPickup(loc)}
                    className="glass-card-interactive"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      border: pickup?.name === loc.name ? "1.5px solid var(--primary)" : "1px solid var(--card-border)",
                      borderRadius: "12px",
                      background: pickup?.name === loc.name ? "rgba(217,95,0,0.06)" : "rgba(0,0,0,0.01)",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    {pickup?.name === loc.name
                      ? <Check size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                      : <MapPin size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                    }
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{loc.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{loc.address.split(",")[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { if (pickup) setStep("dropoff"); }}
              disabled={!pickup}
              className="btn btn-primary"
              style={{ padding: "15px", fontSize: "0.95rem", opacity: pickup ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* STEP: Dropoff */}
        {step === "dropoff" && (
          <>
            {pickup && (
              <div style={{ padding: "12px 14px", background: "rgba(217,95,0,0.05)", borderRadius: "12px", border: "1px solid rgba(217,95,0,0.15)", fontSize: "0.82rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>From</p>
                <p style={{ fontWeight: 700, color: "var(--text-main)", marginTop: "2px" }}>{pickup.name}</p>
              </div>
            )}
            <LocationPicker
              label="Destination"
              value={dropoff}
              onSelect={setDropoff}
              placeholder="Where are you going?"
              color="var(--accent)"
            />
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Popular Destinations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sortedDropoffs.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => setDropoff(loc)}
                    className="glass-card-interactive"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px 14px",
                      border: dropoff?.name === loc.name ? "1.5px solid var(--accent)" : "1px solid var(--card-border)",
                      borderRadius: "12px",
                      background: dropoff?.name === loc.name ? "rgba(26,107,60,0.06)" : "rgba(0,0,0,0.01)",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                      width: "100%",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                  >
                    {dropoff?.name === loc.name
                      ? <Check size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                      : <MapPin size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    }
                    <div>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{loc.name}</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{loc.address.split(",")[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setStep("pickup")} className="btn btn-secondary" style={{ padding: "14px 20px", fontSize: "0.9rem" }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => { if (dropoff) setStep("vehicle"); }}
                disabled={!dropoff}
                className="btn btn-primary"
                style={{ flex: 1, padding: "14px", fontSize: "0.95rem", opacity: dropoff ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                Choose Vehicle <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP: Vehicle */}
        {step === "vehicle" && (
          <>
            {pickup && dropoff && (
              <div style={{ padding: "12px 14px", background: "rgba(0,0,0,0.015)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={13} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{pickup.name}</span>
                </div>
                <div style={{ width: 1, height: 12, background: "var(--card-border)", marginLeft: 6, marginTop: 2, marginBottom: 2 }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={13} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>{dropoff.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, background: "rgba(217,95,0,0.08)", padding: "2px 8px", borderRadius: "99px" }}>
                    {distance} km
                  </span>
                </div>
              </div>
            )}
            <RideSelector
              distanceMiles={distance}
              onBookRide={(cat, price) => {
                setSelectedCategory(cat);
                setSelectedPrice(price);
                setStep("confirm");
              }}
            />
            <button onClick={() => setStep("dropoff")} className="btn btn-secondary" style={{ padding: "12px", fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <ArrowLeft size={16} /> Change Destination
            </button>
          </>
        )}

        {/* STEP: Confirm */}
        {step === "confirm" && selectedCategory && (
          <>
            {/* ── Schedule Toggle ── */}
            <div style={{ padding: "16px", background: "rgba(217,95,0,0.04)", border: "1.5px solid rgba(217,95,0,0.15)", borderRadius: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isScheduled ? "14px" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "10px", background: isScheduled ? "var(--primary)" : "rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
                    <Calendar size={16} color={isScheduled ? "#fff" : "var(--text-muted)"} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>Schedule for later</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>Book up to 7 days in advance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduled(!isScheduled)}
                  style={{ width: 48, height: 26, borderRadius: 99, border: "none", background: isScheduled ? "var(--primary)" : "rgba(0,0,0,0.12)", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 3, left: isScheduled ? "calc(100% - 23px)" : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>

              {isScheduled && (
                <div className="animate-slide-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <Calendar size={10} /> Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setScheduledDate(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--card-border-focus)", borderRadius: "10px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(255,255,255,0.8)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <Clock size={10} /> Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={e => setScheduledTime(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--card-border-focus)", borderRadius: "10px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(255,255,255,0.8)", outline: "none" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "20px", background: "rgba(0,0,0,0.015)", borderRadius: "16px", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Booking Summary</p>
              {[
                { label: "From", value: pickup?.name || "" },
                { label: "To", value: dropoff?.name || "" },
                { label: "Distance", value: `${distance} km` },
                { label: "Vehicle", value: selectedCategory.name },
                { label: "ETA", value: `${selectedCategory.etaMinutes} min` },
                { label: "Capacity", value: `${selectedCategory.capacity} passengers` },
                ...(isScheduled && scheduledDate && scheduledTime ? [{ label: "Scheduled", value: `${new Date(scheduledDate + "T" + scheduledTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ color: label === "Scheduled" ? "var(--primary)" : "var(--text-main)", fontWeight: label === "Scheduled" ? 700 : 600, textAlign: "right", maxWidth: "55%" }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>Total Fare</span>
                <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--primary)" }}>₦{selectedPrice.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0, width: "100%" }}>
              <button 
                onClick={() => setStep("vehicle")} 
                className="btn btn-secondary" 
                style={{ padding: "14px 20px", flexShrink: 0, width: "auto" }}
              >
                <ArrowLeft size={16} /> Edit
              </button>
              <button
                onClick={() => { setStep("finding"); setFindingProgress(0); }}
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  padding: "14px 18px", 
                  fontSize: "clamp(0.85rem, 2.4vw, 0.95rem)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                <Zap size={16} style={{ flexShrink: 0 }} /> 
                {isScheduled ? "Schedule Ride" : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
