"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Star, Clock, Zap, Mic, X, Bell, ChevronRight, Home, Briefcase, Car } from "lucide-react";
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
  avatarUrl?: string;
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
  avatarUrl,
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
    <div className="map-screen" style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-top-bar {
          animation: slide-down-spring 0.65s var(--ease-spring) both;
        }
        .animate-bottom-sheet {
          animation: sheet-up-spring 0.7s var(--ease-spring) both;
        }
        .text-gradient-flow {
          background: linear-gradient(135deg, var(--primary) 0%, #ffaa00 50%, var(--primary) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shimmer 3s linear infinite;
        }
        .glass-btn-hover {
          transition: all 0.25s var(--ease) !important;
        }
        .glass-btn-hover:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 82, 0, 0.35) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 12px rgba(255,82,0,0.1) !important;
        }
        .popular-badge-hover {
          transition: all 0.22s var(--ease) !important;
        }
        .popular-badge-hover:hover {
          background: linear-gradient(135deg, rgba(255,82,0,0.15), rgba(255,82,0,0.05)) !important;
          border-color: rgba(255, 82, 0, 0.45) !important;
          transform: scale(1.04) translateY(-1px);
        }
        @keyframes slide-down-spring {
          from { transform: translateY(-70px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes sheet-up-spring {
          from { transform: translateY(120px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes gradient-shimmer {
          to { background-position: 200% center; }
        }
        .bottom-sheet-glass {
          background: rgba(10, 14, 24, 0.78) !important;
          backdrop-filter: blur(28px) saturate(210%) !important;
          -webkit-backdrop-filter: blur(28px) saturate(210%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.06) !important;
        }
      `}} />

      {/* ── Floating Top Bar ── */}
      <div className="top-bar animate-top-bar" style={{ zIndex: 101 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "rgba(10, 14, 24, 0.75)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRadius: "var(--r-xl)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary) 0%, #e05a12 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-primary)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1 }}>Glide</div>
              <div style={{ fontSize: "0.56rem", color: "var(--text-3)", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "1px" }}>UYO · AKWA IBOM</div>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={onShowNotifications}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-2)",
                transition: "all 0.2s",
                position: "relative",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            >
              <Bell size={16} />
              <div style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", border: "1.5px solid rgba(10,14,24,1)" }} />
            </button>
            <button
              onClick={onShowProfile}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                background: avatarColor,
                border: "2px solid rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                fontSize: "0.95rem", fontWeight: 900, color: "#fff",
                fontFamily: "var(--font)",
                boxShadow: `0 0 0 1px ${avatarColor}30, 0 8px 24px rgba(0,0,0,0.3)`,
                transition: "transform 0.2s var(--ease-spring)",
                overflow: "hidden",
                padding: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                userInitial
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Ride Banner */}
      {isBooked && rideStatus !== "completed" && (
        <div
          style={{
            position: "absolute",
            top: 96,
            left: 20, right: 20,
            zIndex: 100,
            animation: "slide-down-spring 0.5s var(--ease-spring) both",
          }}
        >
          <button
            onClick={onTrackRide}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px",
              background: "linear-gradient(135deg, var(--primary) 0%, #ff5200 100%)",
              borderRadius: "var(--r-xl)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 12px 36px rgba(255,82,0,0.4)",
              fontFamily: "var(--font)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Car size={18} style={{ color: "#fff", animation: "finding-pulse 1.5s infinite" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                  {rideStatus === "searching" && "Finding your driver..."}
                  {rideStatus === "arriving" && "Driver on the way!"}
                  {rideStatus === "arrived" && "Driver has arrived! 📍"}
                  {rideStatus === "inprogress" && "On your way 🚀"}
                </div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.8)", marginTop: "2.5px", fontWeight: 600 }}>
                  {selectedCategoryName || "Glide"} · Live Connection
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#fff", background: "rgba(255,255,255,0.22)", padding: "6px 12px", borderRadius: "99px" }}>
              Track →
            </div>
          </button>
        </div>
      )}

      {/* ── Glass Bottom Sheet ── */}
      <div className="bottom-sheet bottom-sheet-glass animate-bottom-sheet" style={{ maxHeight: "64vh", paddingBottom: "env(safe-area-inset-bottom, 12px)" }}>
        <div className="sheet-handle" style={{ background: "rgba(255,255,255,0.15)" }} />

        <div style={{ padding: "16px 20px 0 20px" }}>
          {/* Greeting */}
          <div style={{ marginBottom: "18px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{greeting}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em", marginTop: "2px", lineHeight: 1.25 }}>
              {greeting}, <span className="text-gradient-flow">{firstName}</span> 👋
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "4px", fontWeight: 600 }}>Where are you headed?</div>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative", marginBottom: "18px" }}>
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
            <input
              ref={inputRef}
              value={searchText}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={() => searchText && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search destination in Uyo..."
              style={{
                width: "100%",
                padding: "15px 44px 15px 48px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "var(--r-xl)",
                color: "var(--text-1)",
                fontFamily: "var(--font)",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all 0.22s var(--ease)",
                fontWeight: 500,
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,82,0,0.12), inset 0 1px 3px rgba(0,0,0,0.15)";
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {searchText ? (
              <button onClick={() => { setSearchText(""); setSuggestions([]); setShowSuggestions(false); }} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                <X size={16} />
              </button>
            ) : (
              <button style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--primary)", padding: 4 }}>
                <Mic size={16} />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "rgba(10, 14, 24, 0.95)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.09)",
                borderRadius: "var(--r-lg)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                zIndex: 150,
                overflow: "hidden",
                animation: "slide-down-spring 0.25s var(--ease) both",
              }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleSuggestionSelect(s)}
                    style={{
                      width: "100%", padding: "14px 18px",
                      display: "flex", alignItems: "center", gap: "14px",
                      border: "none", borderBottom: i < suggestions.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      background: "transparent", cursor: "pointer",
                      fontFamily: "var(--font)", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: "10px", background: "rgba(255,82,0,0.12)", border: "1px solid rgba(255,82,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin size={15} style={{ color: "var(--primary)" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 750, color: "var(--text-1)" }}>{s.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 550, marginTop: "2px" }}>{s.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Shortcuts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Home", icon: <Home size={15} style={{ color: "var(--primary)" }} />, loc: favoriteHome, fallback: { name: "Home", lat: 5.0253, lng: 7.9306, address: "Set your home address" } },
              { label: "Work", icon: <Briefcase size={15} style={{ color: "var(--cyan)" }} />, loc: favoriteWork, fallback: { name: "Work", lat: 5.0480, lng: 7.9520, address: "Set your work address" } },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => handleQuickBook(item.loc || item.fallback)}
                className="glass-card glass-btn-hover"
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px",
                  cursor: "pointer", fontFamily: "var(--font)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "var(--r-xl)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: item.label === "Home" ? "rgba(255,82,0,0.1)" : "rgba(0,180,255,0.1)",
                  border: item.label === "Home" ? "1px solid rgba(255,82,0,0.2)" : "1px solid rgba(0,180,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "inset 0 1px 3px rgba(255,255,255,0.03)"
                }}>
                  {item.icon}
                </div>
                <div style={{ textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 600, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "2px" }}>
                    {item.loc ? "Saved" : "Add address"}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Popular Places */}
          <div style={{ marginBottom: "10px" }}>
            <div className="section-label" style={{ marginBottom: "12px", fontSize: "0.7rem", fontWeight: 800 }}>
              <Zap size={11} style={{ color: "var(--primary)" }} />
              Popular in Uyo
            </div>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
              {POPULAR.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickBook(loc)}
                  className="popular-badge-hover"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "var(--r-lg)",
                    cursor: "pointer", fontFamily: "var(--font)",
                    flexShrink: 0,
                    minWidth: 84,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,82,0,0.1)", border: "1px solid rgba(255,82,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={15} style={{ color: "var(--primary)" }} />
                  </div>
                  <span style={{ fontSize: "0.74rem", fontWeight: 750, color: "var(--text-2)", whiteSpace: "nowrap" }}>{loc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Trips */}
          {recentDestinations.length > 0 && (
            <div style={{ marginTop: "18px", paddingBottom: "12px" }}>
              <div className="section-label" style={{ marginBottom: "12px", fontSize: "0.7rem", fontWeight: 800 }}>
                <Clock size={11} style={{ color: "var(--text-3)" }} />
                Recent Places
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {recentDestinations.slice(0, 3).map((loc, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickBook(loc)}
                    style={{
                      display: "flex", alignItems: "center", gap: "14px",
                      padding: "12px 14px",
                      background: "transparent",
                      border: "none", borderRadius: "var(--r-md)",
                      cursor: "pointer", fontFamily: "var(--font)", textAlign: "left",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Clock size={15} style={{ color: "var(--text-3)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 750, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{loc.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 550, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>{loc.address}</div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book CTA */}
          <div style={{ padding: "12px 0 20px 0" }}>
            <button
              onClick={() => onStartBooking()}
              className="btn btn-primary"
              style={{
                borderRadius: "var(--r-xl)",
                fontSize: "1.05rem",
                fontWeight: 900,
                background: "linear-gradient(135deg, var(--primary) 0%, #ff5200 100%)",
                boxShadow: "0 8px 30px rgba(255,82,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "16px",
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 36px rgba(255,82,0,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,82,0,0.35)"; }}
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
