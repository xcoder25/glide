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
  surgeMultiplier?: number;
  onConfirmed: (pickup: LocationData, dropoff: LocationData, category: RideCategory, price: number) => void;
  onScheduleRide?: (pickup: LocationData, dropoff: LocationData, category: RideCategory, price: number) => void;
  onCarpoolRequest?: (pickup: LocationData, dropoff: LocationData, category: RideCategory, price: number) => void;
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
  label, value, onSelect, placeholder, accentColor,
}: {
  label: string;
  value: LocationData | null;
  onSelect: (loc: LocationData) => void;
  placeholder: string;
  accentColor: string;
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
      ).slice(0, 5)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label className="section-label">
        <MapPin size={10} style={{ color: accentColor }} /> {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: "14px 16px 14px 44px",
            border: `1.5px solid ${value ? accentColor : "var(--border)"}`,
            borderRadius: "var(--r-xl)",
            fontSize: "0.95rem",
            fontFamily: "var(--font)",
            color: "var(--text-1)",
            background: "var(--bg-elevated)",
            outline: "none",
            transition: "all 0.2s",
            fontWeight: 500,
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}25`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = value ? accentColor : "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
          <MapPin size={16} style={{ color: value ? accentColor : "var(--text-3)" }} />
        </div>

        {results.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0, right: 0,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-med)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-xl)",
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
                  padding: "13px 16px",
                  width: "100%",
                  border: "none",
                  borderBottom: i < results.length - 1 ? "1px solid var(--border)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "8px", background: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={13} style={{ color: accentColor }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-1)" }}>{loc.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 500 }}>{loc.address}</p>
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
  surgeMultiplier = 1,
  onConfirmed,
  onScheduleRide,
  onCarpoolRequest,
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

  useEffect(() => {
    const now = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    setScheduledDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    setScheduledTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
  }, []);

  const distance = pickup && dropoff ? getDistance(pickup, dropoff) : 0;

  const sortedLocations = [...PRESET_LOCATIONS];
  if (deviceLocation) {
    sortedLocations.sort((a, b) => {
      const dA = Math.sqrt((a.lat - deviceLocation.lat) ** 2 + (a.lng - deviceLocation.lng) ** 2);
      const dB = Math.sqrt((b.lat - deviceLocation.lat) ** 2 + (b.lng - deviceLocation.lng) ** 2);
      return dA - dB;
    });
  }
  const sortedDropoffs = sortedLocations.filter(loc => loc.name !== pickup?.name).slice(0, 4);

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
  }, [step]); // eslint-disable-line

  const steps: BookingStep[] = ["pickup", "dropoff", "vehicle", "confirm"];
  const stepIdx = steps.indexOf(step === "finding" ? "confirm" : step);
  const STEP_LABELS = ["Pickup", "Drop-off", "Vehicle", "Confirm"];

  const LocationCard = ({ loc, isSelected, onClick, color }: { loc: LocationData; isSelected: boolean; onClick: () => void; color: string }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "13px 14px",
        border: `1.5px solid ${isSelected ? color : "var(--border)"}`,
        borderRadius: "var(--r-lg)",
        background: isSelected ? `${color}10` : "var(--bg-elevated)",
        cursor: "pointer",
        fontFamily: "var(--font)",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s var(--ease)",
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = color; }}}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--border)"; }}}
    >
      <div style={{ width: 34, height: 34, borderRadius: "9px", background: isSelected ? color : "var(--border-med)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
        {isSelected
          ? <Check size={14} color="#fff" />
          : <MapPin size={14} style={{ color: "var(--text-3)" }} />
        }
      </div>
      <div>
        <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-1)" }}>{loc.name}</p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 500, marginTop: "2px" }}>{loc.address.split(",")[0]}</p>
      </div>
    </button>
  );

  return (
    <div className="full-screen animate-screen-in">

      {/* Header */}
      <div className="page-header">
        <button onClick={onBack} className="back-btn" style={{ width: 40, height: 40 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="page-title">Book a Ride</h2>
          <p style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 700, marginTop: "2px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Step {Math.min(stepIdx + 1, 4)} of 4 · {STEP_LABELS[Math.min(stepIdx, 3)]}
          </p>
        </div>
      </div>

      <div className="full-screen-scroll safe-bottom">
        {/* Step Progress Bar */}
        <div style={{ display: "flex", gap: "8px", padding: "20px 20px 10px 20px", borderBottom: "1px solid var(--border)" }}>
          {STEP_LABELS.map((label, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: active ? "var(--primary-gradient)" : done ? "var(--accent-teal-gradient)" : "var(--bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: active || done ? "#fff" : "var(--text-3)",
                  boxShadow: active ? "0 0 14px var(--primary-glow)" : done ? "0 0 10px rgba(5, 245, 155, 0.2)" : "none",
                  border: active || done ? "none" : "1.5px solid var(--border)",
                  transition: "all 0.3s var(--ease)",
                }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ display: "block", fontSize: "0.6rem", fontWeight: active ? 800 : 600, color: active ? "var(--primary)" : done ? "var(--green)" : "var(--text-3)", textAlign: "center", marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "16px 20px 24px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── FINDING DRIVER ── */}
          {step === "finding" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", padding: "20px 0" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 90, height: 90, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, #e05a12 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "var(--shadow-primary)",
                  animation: "heartbeat 2s infinite",
                }}>
                  <Zap size={32} color="#fff" strokeWidth={2.5} />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Finding your driver...</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginTop: "6px", fontWeight: 500 }}>Connecting with nearby Glide operators</p>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ width: "100%", height: "5px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${findingProgress}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), #e05a12)", borderRadius: "99px", transition: "width 0.1s linear" }} />
                </div>
                <p style={{ fontSize: "0.74rem", color: "var(--text-3)", textAlign: "center", fontWeight: 700 }}>{findingProgress}% matched</p>
              </div>
            </div>
          )}

          {/* ── PICKUP ── */}
          {step === "pickup" && (
            <>
              <LocationPicker label="Pickup Location" value={pickup} onSelect={setPickup} placeholder="Search pickup point..." accentColor="var(--primary)" />
              <button
                onClick={() => {
                  const loc: LocationData = deviceLocation || { name: "My Current Location", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom State" };
                  setPickup(loc);
                }}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "var(--cyan-dim)", border: "1px solid var(--cyan-glow)", borderRadius: "var(--r-xl)", color: "var(--cyan)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", width: "100%", transition: "all 0.2s" }}
              >
                <Navigation size={14} /> Use my current location
              </button>
              <div>
                <p className="section-header" style={{ marginBottom: "10px" }}>Nearby Places</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {sortedLocations.slice(0, 3).map(loc => (
                    <LocationCard key={loc.name} loc={loc} isSelected={pickup?.name === loc.name} onClick={() => setPickup(loc)} color="var(--primary)" />
                  ))}
                </div>
              </div>
              <button onClick={() => { if (pickup) setStep("dropoff"); }} disabled={!pickup} className="btn btn-primary" style={{ borderRadius: "var(--r-xl)", opacity: pickup ? 1 : 0.4 }}>
                Continue <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* ── DROPOFF ── */}
          {step === "dropoff" && (
            <>
              {pickup && (
                <div style={{ padding: "12px 14px", background: "var(--primary-dim)", borderRadius: "var(--r-lg)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <MapPin size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Pickup Point</p>
                    <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-1)", marginTop: "2px" }}>{pickup.name}</p>
                  </div>
                </div>
              )}
              <LocationPicker label="Destination" value={dropoff} onSelect={setDropoff} placeholder="Where are you going?" accentColor="var(--green)" />
              <div>
                <p className="section-header" style={{ marginBottom: "10px" }}>Popular Destinations</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {sortedDropoffs.slice(0, 3).map(loc => (
                    <LocationCard key={loc.name} loc={loc} isSelected={dropoff?.name === loc.name} onClick={() => setDropoff(loc)} color="var(--green)" />
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setStep("pickup")} className="btn btn-secondary" style={{ borderRadius: "var(--r-xl)", flexShrink: 0, width: "auto", padding: "14px 20px" }}>
                  <ArrowLeft size={16} />
                </button>
                <button onClick={() => { if (dropoff) setStep("vehicle"); }} disabled={!dropoff} className="btn btn-primary" style={{ flex: 1, borderRadius: "var(--r-xl)", opacity: dropoff ? 1 : 0.4 }}>
                  Choose Vehicle <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}

          {/* ── VEHICLE ── */}
          {step === "vehicle" && (
            <>
              {pickup && dropoff && (
                <div style={{ padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", flex: 1 }}>{pickup.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "2px", background: "var(--green)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", flex: 1 }}>{dropoff.name}</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 800, background: "var(--primary-dim)", padding: "2px 8px", borderRadius: "99px", border: "1px solid var(--primary-glow)" }}>
                      {distance} km
                    </span>
                  </div>
                </div>
              )}
              <RideSelector
                distanceMiles={distance}
                surgeMultiplier={surgeMultiplier}
                onBookRide={(cat, price) => { setSelectedCategory(cat); setSelectedPrice(price); setStep("confirm"); }}
                onSchedule={(cat, price) => {
                  if (pickup && dropoff) {
                    onScheduleRide?.(pickup, dropoff, cat, price);
                  }
                }}
                onCarpoolSelect={(cat, price) => {
                  if (pickup && dropoff) {
                    onCarpoolRequest?.(pickup, dropoff, cat, price);
                  }
                }}
              />
              <button onClick={() => setStep("dropoff")} className="btn btn-secondary" style={{ borderRadius: "var(--r-xl)", fontSize: "0.86rem" }}>
                <ArrowLeft size={15} /> Change Destination
              </button>
            </>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && selectedCategory && (
            <>
              {/* Schedule Toggle */}
              <div style={{ padding: "14px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isScheduled ? "14px" : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "10px", background: isScheduled ? "var(--primary-dim)" : "var(--border-med)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s" }}>
                      <Calendar size={16} style={{ color: isScheduled ? "var(--primary)" : "var(--text-3)" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>Schedule for later</p>
                      <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px", fontWeight: 500 }}>Book in advance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsScheduled(!isScheduled)}
                    className="toggle-track"
                    data-on={isScheduled}
                  >
                    <div className="toggle-thumb" />
                  </button>
                </div>
                {isScheduled && (
                  <div className="animate-slide-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                    <div>
                      <label className="section-label" style={{ marginBottom: "6px" }}>Date</label>
                      <input type="date" value={scheduledDate} min={new Date().toISOString().split("T")[0]} onChange={e => setScheduledDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-surface)", outline: "none", fontWeight: 500 }} />
                    </div>
                    <div>
                      <label className="section-label" style={{ marginBottom: "6px" }}>Time</label>
                      <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-surface)", outline: "none", fontWeight: 500 }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
                <p className="section-header">Summary</p>
                {[
                  { label: "From", value: pickup?.name || "" },
                  { label: "To", value: dropoff?.name || "" },
                  { label: "Distance", value: `${distance} km` },
                  { label: "Vehicle", value: selectedCategory.name },
                  { label: "ETA", value: `${selectedCategory.etaMinutes} min` },
                  ...(isScheduled && scheduledDate && scheduledTime ? [{ label: "Scheduled", value: `${new Date(scheduledDate + "T" + scheduledTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: "0.78rem", color: label === "Scheduled" ? "var(--primary)" : "var(--text-2)", fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-1)" }}>Total Fare</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 950, color: "var(--primary)" }}>₦{selectedPrice.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setStep("vehicle")} className="btn btn-secondary" style={{ borderRadius: "var(--r-xl)", flexShrink: 0, width: "auto", padding: "14px 20px" }}>
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => { setStep("finding"); setFindingProgress(0); }}
                  className="btn btn-primary"
                  style={{ flex: 1, borderRadius: "var(--r-xl)" }}
                >
                  <Zap size={15} /> Confirm Booking
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
