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
      ).slice(0, 6)
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.67rem", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "5px" }}>
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
            border: `1.5px solid ${value ? accentColor : "var(--card-border-strong)"}`,
            borderRadius: "var(--r-md)",
            fontSize: "0.92rem",
            fontFamily: "var(--font)",
            color: "var(--text-heading)",
            background: value ? `${accentColor}06` : "var(--card-bg)",
            outline: "none",
            transition: "all 0.2s",
            boxShadow: value ? `0 0 0 3px ${accentColor}15` : "none",
            fontWeight: 500,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}20`; }}
          onBlur={e => { e.currentTarget.style.borderColor = value ? accentColor : "var(--card-border-strong)"; e.currentTarget.style.boxShadow = value ? `0 0 0 3px ${accentColor}15` : "none"; }}
        />
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
          <MapPin size={16} style={{ color: value ? accentColor : "var(--text-faint)" }} />
        </div>

        {results.length > 0 && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0, right: 0,
            background: "var(--bg-secondary)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-lg)",
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
                  borderBottom: i < results.length - 1 ? "1px solid var(--card-border)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${accentColor}08`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "8px", background: `${accentColor}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={13} style={{ color: accentColor }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-heading)" }}>{loc.name}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>{loc.address}</p>
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
        border: `1.5px solid ${isSelected ? color : "var(--card-border)"}`,
        borderRadius: "var(--r-md)",
        background: isSelected ? `${color}08` : "var(--card-bg)",
        cursor: "pointer",
        fontFamily: "var(--font)",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s var(--ease)",
        boxShadow: isSelected ? `0 4px 16px ${color}20` : "var(--shadow-sm)",
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = "translateY(-1px)"; }}}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.transform = ""; }}}
    >
      <div style={{ width: 34, height: 34, borderRadius: "9px", background: isSelected ? color : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s" }}>
        {isSelected
          ? <Check size={14} color="#fff" />
          : <MapPin size={14} style={{ color: "var(--text-faint)" }} />
        }
      </div>
      <div>
        <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--text-heading)" }}>{loc.name}</p>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500, marginTop: "2px" }}>{loc.address.split(",")[0]}</p>
      </div>
    </button>
  );

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Header */}
      <div style={{ padding: "20px 24px 0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={onBack}
            style={{ width: 38, height: 38, borderRadius: "11px", border: "1.5px solid var(--card-border-strong)", background: "var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em", lineHeight: 1 }}>Book a Ride</h2>
            <p style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontWeight: 600, marginTop: "3px" }}>Step {Math.min(stepIdx + 1, 4)} of 4</p>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "22px" }}>
          {STEP_LABELS.map((label, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  height: "4px",
                  borderRadius: "99px",
                  background: done ? "var(--primary)" : active ? "var(--primary)" : "var(--card-border)",
                  opacity: done ? 0.5 : active ? 1 : 1,
                  transition: "all 0.35s var(--ease)",
                  boxShadow: active ? "var(--shadow-primary)" : "none",
                }} />
                <p style={{ fontSize: "0.58rem", fontWeight: 800, color: done || active ? "var(--primary)" : "var(--text-faint)", marginTop: "5px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em", transition: "color 0.3s" }}>
                  {done ? "✓" : label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── FINDING DRIVER ── */}
        {step === "finding" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", padding: "40px 0" }}>
            <div style={{ position: "relative" }}>
              <div className="finding-pulse" style={{
                width: 100, height: 100, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 12px 40px rgba(249,115,22,0.4)",
              }}>
                <Zap size={38} color="#fff" strokeWidth={2.5} />
              </div>
              {/* Rings */}
              {[1,2].map(r => (
                <div key={r} style={{ position: "absolute", inset: -(r * 20), borderRadius: "50%", border: "2px solid rgba(249,115,22,0.2)", animation: `pulse-animation ${1.5 + r * 0.5}s infinite ease-out`, opacity: 0 }} />
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Finding your driver...</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "8px", fontWeight: 500 }}>Connecting with nearby Glide operators</p>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ width: "100%", height: "6px", background: "var(--card-border)", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${findingProgress}%`, height: "100%", background: "linear-gradient(90deg, var(--primary), #F59E0B)", borderRadius: "99px", transition: "width 0.1s linear", boxShadow: "0 0 10px rgba(249,115,22,0.5)" }} />
              </div>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>{findingProgress}% matched</p>
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
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "var(--sky-subtle)", border: "1px solid var(--sky-glow)", borderRadius: "var(--r-md)", color: "var(--sky)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", width: "100%", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--sky-subtle)"; }}
            >
              <Navigation size={14} /> Use my current location
            </button>
            <div>
              <p className="section-header" style={{ marginBottom: "10px" }}>Nearby Places</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sortedLocations.slice(0, 4).map(loc => (
                  <LocationCard key={loc.name} loc={loc} isSelected={pickup?.name === loc.name} onClick={() => setPickup(loc)} color="var(--primary)" />
                ))}
              </div>
            </div>
            <button onClick={() => { if (pickup) setStep("dropoff"); }} disabled={!pickup} className="btn btn-primary" style={{ padding: "15px", opacity: pickup ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Continue <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* ── DROPOFF ── */}
        {step === "dropoff" && (
          <>
            {pickup && (
              <div style={{ padding: "14px 16px", background: "var(--primary-subtle)", borderRadius: "var(--r-md)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", gap: "10px" }}>
                <MapPin size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>From</p>
                  <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)", marginTop: "2px", letterSpacing: "-0.01em" }}>{pickup.name}</p>
                </div>
              </div>
            )}
            <LocationPicker label="Destination" value={dropoff} onSelect={setDropoff} placeholder="Where are you going?" accentColor="var(--success)" />
            <div>
              <p className="section-header" style={{ marginBottom: "10px" }}>Popular Destinations</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {sortedDropoffs.map(loc => (
                  <LocationCard key={loc.name} loc={loc} isSelected={dropoff?.name === loc.name} onClick={() => setDropoff(loc)} color="var(--success)" />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setStep("pickup")} className="btn btn-secondary" style={{ padding: "14px 20px", flexShrink: 0, width: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => { if (dropoff) setStep("vehicle"); }} disabled={!dropoff} className="btn btn-primary" style={{ flex: 1, padding: "14px", opacity: dropoff ? 1 : 0.4, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                Choose Vehicle <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* ── VEHICLE ── */}
        {step === "vehicle" && (
          <>
            {pickup && dropoff && (
              <div style={{ padding: "14px 16px", background: "var(--card-bg)", borderRadius: "var(--r-md)", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)", flex: 1 }}>{pickup.name}</span>
                </div>
                <div style={{ width: 1, height: 12, background: "var(--card-border)", marginLeft: "3px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "2px", background: "var(--success)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)", flex: 1 }}>{dropoff.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 800, background: "var(--primary-subtle)", padding: "2px 10px", borderRadius: "99px", border: "1px solid var(--primary-glow)" }}>
                    {distance} km
                  </span>
                </div>
              </div>
            )}
            <RideSelector
              distanceMiles={distance}
              onBookRide={(cat, price) => { setSelectedCategory(cat); setSelectedPrice(price); setStep("confirm"); }}
            />
            <button onClick={() => setStep("dropoff")} className="btn btn-secondary" style={{ padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <ArrowLeft size={16} /> Change Destination
            </button>
          </>
        )}

        {/* ── CONFIRM ── */}
        {step === "confirm" && selectedCategory && (
          <>
            {/* Schedule Toggle */}
            <div style={{ padding: "16px", background: "var(--primary-subtle)", border: "1px solid var(--primary-glow)", borderRadius: "var(--r-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isScheduled ? "14px" : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "10px", background: isScheduled ? "var(--primary)" : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s var(--ease)", boxShadow: isScheduled ? "var(--shadow-primary)" : "none" }}>
                    <Calendar size={16} style={{ color: isScheduled ? "#fff" : "var(--text-muted)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)" }}>Schedule for later</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>Book up to 7 days in advance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduled(!isScheduled)}
                  style={{ width: 48, height: 26, borderRadius: 99, border: "none", background: isScheduled ? "var(--primary)" : "var(--card-border-strong)", cursor: "pointer", position: "relative", transition: "background 0.25s var(--ease)", flexShrink: 0 }}
                >
                  <div style={{ position: "absolute", top: 3, left: isScheduled ? "calc(100% - 23px)" : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.25s var(--ease)", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
              {isScheduled && (
                <div className="animate-slide-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <Calendar size={10} /> Date
                    </label>
                    <input type="date" value={scheduledDate} min={new Date().toISOString().split("T")[0]} onChange={e => setScheduledDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--card-border-strong)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-heading)", background: "var(--bg-secondary)", outline: "none", fontWeight: 500 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                      <Clock size={10} /> Time
                    </label>
                    <input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--card-border-strong)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-heading)", background: "var(--bg-secondary)", outline: "none", fontWeight: 500 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div style={{ padding: "20px", background: "var(--card-bg)", borderRadius: "var(--r-lg)", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
              <p className="section-header">Booking Summary</p>
              {[
                { label: "From", value: pickup?.name || "" },
                { label: "To", value: dropoff?.name || "" },
                { label: "Distance", value: `${distance} km` },
                { label: "Vehicle", value: selectedCategory.name },
                { label: "ETA", value: `${selectedCategory.etaMinutes} min` },
                { label: "Capacity", value: `${selectedCategory.capacity} passengers` },
                ...(isScheduled && scheduledDate && scheduledTime ? [{ label: "Scheduled", value: `${new Date(scheduledDate + "T" + scheduledTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}` }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", paddingBottom: "10px", borderBottom: "1px solid var(--card-border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: "0.82rem", color: label === "Scheduled" ? "var(--primary)" : "var(--text-body)", fontWeight: label === "Scheduled" ? 800 : 700, textAlign: "right", maxWidth: "58%" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)" }}>Total Fare</span>
                <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em" }}>₦{selectedPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setStep("vehicle")} className="btn btn-secondary" style={{ padding: "14px 20px", flexShrink: 0, width: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                <ArrowLeft size={16} /> Edit
              </button>
              <button
                onClick={() => { setStep("finding"); setFindingProgress(0); }}
                className="btn btn-primary"
                style={{ flex: 1, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap" }}
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
