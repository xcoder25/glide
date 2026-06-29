"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Star, Clock, Zap, Mic, X, Bell, ChevronRight } from "lucide-react";
import { PRESET_LOCATIONS, type LocationData } from "./booking-form";
import type { RideStatus } from "./active-ride";

interface HomeScreenProps {
  userName: string;
  recentDestinations: LocationData[];
  favoriteHome?: LocationData;
  favoriteWork?: LocationData;
  deviceLocation?: LocationData | null;
  onStartBooking: (pickup?: LocationData, dropoff?: LocationData) => void;
  onShowNotifications: () => void;
  onShowProfile: () => void;
  userInitial: string;
  avatarColor?: string;
  isBooked?: boolean;
  rideStatus?: RideStatus;
  selectedCategoryName?: string;
  onTrackRide?: () => void;
}

const POPULAR: LocationData[] = [
  { name: "Airport", lat: 4.8725, lng: 8.0925, address: "Akwa Ibom International Airport" },
  { name: "Ibom Plaza", lat: 5.0253, lng: 7.9306, address: "Udo Udoma Ave, Uyo" },
  { name: "UNIUYO", lat: 5.0153, lng: 7.9336, address: "University of Uyo Campus" },
  { name: "Ibom Hotel", lat: 5.0378, lng: 7.9142, address: "Nwaniba Rd, Uyo" },
];

const CATEGORY_ICONS = ["⚡", "🚗", "👑", "🌿"];
const CATEGORY_NAMES = ["Lite", "Ride", "Premium", "Max"];
const CATEGORY_DESCS = ["Budget", "Comfort", "Executive", "Luxury"];

export default function HomeScreen({
  userName,
  recentDestinations,
  favoriteHome,
  favoriteWork,
  deviceLocation,
  onStartBooking,
  onShowNotifications,
  onShowProfile,
  userInitial,
  avatarColor = "#FF6B1A",
  isBooked,
  rideStatus,
  selectedCategoryName,
  onTrackRide,
}: HomeScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17) setGreeting("Good evening");
    else setGreeting("Good morning");
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchText(val);
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = val.toLowerCase();
    const results = PRESET_LOCATIONS.filter(
      l => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    ).slice(0, 5);
    setSuggestions(results);
    setShowSuggestions(true);
  };

  const handleSuggestionSelect = (loc: LocationData) => {
    const pickup = deviceLocation || { name: "Current Location", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom" };
    setSearchText("");
    setSuggestions([]);
    setShowSuggestions(false);
    onStartBooking(pickup, loc);
  };

  const handleQuickBook = (dest: LocationData) => {
    const pickup = deviceLocation || { name: "Current Location", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom" };
    onStartBooking(pickup, dest);
  };

  const firstName = userName.split(" ")[0] || "Rider";

  return (
    <div className="map-screen">

      {/* ── Floating Top Bar ── */}
      <div className="top-bar">
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "var(--bg-glass)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          borderRadius: "var(--r-xl)",
          border: "1px solid var(--border-med)",
          boxShadow: "var(--shadow-lg)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary) 0%, #e05a12 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-primary)",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }}>Glide</div>
              <div style={{ fontSize: "0.56rem", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>UYO · AKWA IBOM</div>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={onShowNotifications}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "var(--bg-card)",
                border: "1px solid var(--border-med)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-2)",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <Bell size={16} />
              <div style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", border: "1.5px solid var(--bg-surface)" }} />
            </button>
            <button
              onClick={onShowProfile}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: avatarColor,
                border: "2px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.9rem", fontWeight: 800, color: "#fff",
                fontFamily: "var(--font)",
                boxShadow: `0 0 0 1px ${avatarColor}40, var(--shadow-md)`,
                transition: "transform 0.2s var(--ease-spring)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {userInitial}
            </button>
          </div>
        </div>
      </div>

      {/* Live Ride Banner */}
      {isBooked && rideStatus !== "completed" && (
        <div
          style={{
            position: "absolute",
            top: 90,
            left: 20, right: 20,
            zIndex: 20,
            animation: "slide-up 0.4s var(--ease) both",
          }}
        >
          <button
            onClick={onTrackRide}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              background: "linear-gradient(135deg, var(--primary) 0%, #e05a12 100%)",
              borderRadius: "var(--r-xl)",
              border: "none",
              cursor: "pointer",
              boxShadow: "var(--shadow-primary)",
              fontFamily: "var(--font)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.1rem", animation: "finding-pulse 1.5s infinite" }}>🚗</span>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                  {rideStatus === "searching" && "Finding your driver..."}
                  {rideStatus === "arriving" && "Driver on the way!"}
                  {rideStatus === "arrived" && "Driver has arrived! 📍"}
                  {rideStatus === "inprogress" && "On your way 🚀"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.75)", marginTop: "2px", fontWeight: 600 }}>
                  {selectedCategoryName || "Glide"} · Marcus Sterling
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#fff", background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: "99px" }}>
              Track →
            </div>
          </button>
        </div>
      )}

      {/* ── Glass Bottom Sheet ── */}
      <div className="bottom-sheet" style={{ maxHeight: "62vh" }}>
        <div className="sheet-handle" />

        <div style={{ padding: "16px 20px 0 20px" }}>
          {/* Greeting */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{greeting}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginTop: "2px" }}>
              {greeting}, <span style={{ background: "var(--primary-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{firstName}</span> 👋
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 500 }}>Where are you headed?</div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <Search size={17} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              value={searchText}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => searchText && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search destination..."
              style={{
                width: "100%",
                padding: "14px 42px 14px 44px",
                background: "var(--bg-elevated)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--r-xl)",
                color: "var(--text-1)",
                fontFamily: "var(--font)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.22s var(--ease)",
                fontWeight: 500,
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-ring)";
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {searchText ? (
              <button onClick={() => { setSearchText(""); setSuggestions([]); setShowSuggestions(false); }} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                <X size={15} />
              </button>
            ) : (
              <button style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--primary)", padding: 4 }}>
                <Mic size={15} />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-med)",
                borderRadius: "var(--r-lg)",
                boxShadow: "var(--shadow-xl)",
                zIndex: 50,
                overflow: "hidden",
                animation: "slide-up 0.2s var(--ease) both",
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSuggestionSelect(s)}
                    style={{
                      width: "100%", padding: "13px 16px",
                      display: "flex", alignItems: "center", gap: "12px",
                      border: "none", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                      background: "transparent", cursor: "pointer",
                      fontFamily: "var(--font)", textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: "9px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin size={14} style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-1)" }}>{s.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>{s.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Shortcuts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
            {[
              { label: "Home", icon: "🏠", loc: favoriteHome, fallback: { name: "Home", lat: 5.0253, lng: 7.9306, address: "Set your home address" } },
              { label: "Work", icon: "💼", loc: favoriteWork, fallback: { name: "Work", lat: 5.0480, lng: 7.9520, address: "Set your work address" } },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => handleQuickBook(item.loc || item.fallback)}
                className="glass-card glass-card-hover"
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px",
                  cursor: "pointer", fontFamily: "var(--font)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--bg-elevated)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", boxShadow: "inset 0 1px 3px rgba(255,255,255,0.05)"
                }}>
                  {item.icon}
                </div>
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: "0.86rem", fontWeight: 850, color: "var(--text-1)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {item.loc ? "Saved" : "Add address"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Popular Places */}
          <div style={{ marginBottom: "8px" }}>
            <div className="section-label" style={{ marginBottom: "12px" }}>
              <Zap size={10} style={{ color: "var(--primary)" }} />
              Popular in Uyo
            </div>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
              {POPULAR.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickBook(loc)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    cursor: "pointer", fontFamily: "var(--font)",
                    flexShrink: 0,
                    minWidth: 80,
                    transition: "all 0.2s var(--ease)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-dim)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} style={{ color: "var(--primary)" }} />
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-2)", whiteSpace: "nowrap" }}>{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Trips */}
          {recentDestinations.length > 0 && (
            <div style={{ marginTop: "16px", paddingBottom: "16px" }}>
              <div className="section-label" style={{ marginBottom: "12px" }}>
                <Clock size={10} style={{ color: "var(--text-3)" }} />
                Recent
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {recentDestinations.slice(0, 3).map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickBook(loc)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 14px",
                      background: "transparent",
                      border: "none", borderRadius: "var(--r-md)",
                      cursor: "pointer", fontFamily: "var(--font)", textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={15} style={{ color: "var(--text-3)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.address}</div>
                    </div>
                    <ChevronRight size={15} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book CTA */}
          <div style={{ padding: "8px 0 20px 0" }}>
            <button
              onClick={() => onStartBooking()}
              className="btn btn-primary"
              style={{ borderRadius: "var(--r-xl)", fontSize: "1rem", fontWeight: 800 }}
            >
              <Navigation size={18} />
              Book a Ride
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
