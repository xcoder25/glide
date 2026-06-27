"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Star, Clock, ChevronRight, Zap } from "lucide-react";
import { PRESET_LOCATIONS, type LocationData } from "./booking-form";

interface HomeScreenProps {
  userName: string;
  recentDestinations: LocationData[];
  favoriteHome?: LocationData;
  favoriteWork?: LocationData;
  onStartBooking: (pickup?: LocationData, dropoff?: LocationData) => void;
}

export default function HomeScreen({
  userName,
  recentDestinations,
  favoriteHome,
  favoriteWork,
  onStartBooking,
}: HomeScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchText.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = searchText.toLowerCase();
    const matches = PRESET_LOCATIONS.filter(
      l => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    );
    setSuggestions(matches.slice(0, 5));
    setShowSuggestions(true);
  }, [searchText]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const quickDestinations: LocationData[] = [
    ...(favoriteHome ? [{ ...favoriteHome, name: "🏠 Home" }] : []),
    ...(favoriteWork ? [{ ...favoriteWork, name: "💼 Work" }] : []),
    ...PRESET_LOCATIONS.slice(0, favoriteHome && favoriteWork ? 2 : favoriteHome || favoriteWork ? 3 : 4),
  ].slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 0 24px" }}>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>{greeting} 👋</p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.02em", marginTop: "2px" }}>
          Where to, <span style={{ color: "var(--primary)" }}>{userName.split(" ")[0]}</span>?
        </h2>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "16px 24px 0 24px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            background: "rgba(255,255,255,0.9)",
            border: "1.5px solid var(--card-border-focus)",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(217,95,0,0.08)",
            cursor: "text",
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <Search size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search destination in Lagos..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "0.95rem",
              fontFamily: "var(--font-sans)",
              color: "var(--text-main)",
              outline: "none",
            }}
          />
          <button
            onClick={() => onStartBooking()}
            style={{
              padding: "6px 14px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-sans)",
            }}
          >
            Go
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="animate-slide-up"
            style={{
              position: "absolute",
              top: "calc(100% - 4px)",
              left: 24,
              right: 24,
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {suggestions.map((loc, i) => (
              <button
                key={loc.name}
                onMouseDown={() => {
                  setSearchText("");
                  setShowSuggestions(false);
                  onStartBooking(undefined, loc);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "13px 18px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  borderBottom: i < suggestions.length - 1 ? "1px solid var(--card-border)" : "none",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,95,0,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <MapPin size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>{loc.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>{loc.address}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <div style={{ padding: "12px 24px 0 24px" }}>
        <button
          onClick={() => onStartBooking({ name: "My Location", lat: 6.4281, lng: 3.4219, address: "Victoria Island, Lagos" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 16px",
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
          <Navigation size={15} />
          Use my current location
        </button>
      </div>

      <div style={{ padding: "24px 24px 0 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Quick Destinations */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Quick Destinations
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {quickDestinations.map((loc, i) => (
              <button
                key={i}
                onClick={() => onStartBooking(undefined, loc)}
                className="glass-card-interactive"
                style={{
                  padding: "14px",
                  border: "1px solid var(--card-border)",
                  borderRadius: "14px",
                  background: "rgba(0,0,0,0.015)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <MapPin size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>{loc.name.replace(/^🏠 |^💼 /, "")}</p>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px", lineHeight: 1.3 }}>
                    {loc.address.split(",")[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Copilot */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217,95,0,0.07) 0%, rgba(26,107,60,0.07) 100%)",
          border: "1px solid rgba(217,95,0,0.18)",
          borderRadius: "16px",
          padding: "16px 18px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: "50%", background: "rgba(217,95,0,0.1)", filter: "blur(16px)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <div style={{ width: 24, height: 24, borderRadius: "7px", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={13} color="#fff" />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-main)" }}>Glide AI Copilot</span>
            <span style={{ marginLeft: "auto", fontSize: "0.62rem", fontWeight: 700, color: "var(--primary)", background: "rgba(217,95,0,0.1)", border: "1px solid rgba(217,95,0,0.2)", borderRadius: "20px", padding: "2px 7px" }}>LIVE</span>
          </div>
          {[
            { icon: "🚦", text: "Third Mainland Bridge — heavy traffic. Try Carter Bridge." },
            { icon: "⏱️", text: "Lekki-Epe Expressway is clear. Best time to head to the island." },
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", padding: "8px 10px", background: "rgba(255,255,255,0.5)", borderRadius: "10px", fontSize: "0.74rem", color: "var(--text-main)", lineHeight: 1.5, marginBottom: i === 0 ? "6px" : 0 }}>
              <span style={{ flexShrink: 0 }}>{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>

        {/* Recent Destinations */}
        {recentDestinations.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Trips</p>
              <button style={{ border: "none", background: "none", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: "4px" }}>
                See all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentDestinations.slice(0, 3).map((loc, i) => (
                <button
                  key={i}
                  onClick={() => onStartBooking(undefined, loc)}
                  className="glass-card-interactive"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    border: "1px solid var(--card-border)",
                    borderRadius: "12px",
                    background: "rgba(0,0,0,0.01)",
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Clock size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{loc.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>{loc.address.split(",")[0]}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loyalty Status */}
        <div style={{ padding: "16px 18px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--card-border)", borderRadius: "16px", marginBottom: "80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Star size={14} fill="var(--primary)" stroke="var(--primary)" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)" }}>Glide Emerald Club</span>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)" }}>Tier 2</span>
          </div>
          <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.05)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: "78%", height: "100%", background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: "99px" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "6px" }}>
            <span>780 / 1,000 points</span>
            <span>220 pts to free ride</span>
          </div>
        </div>
      </div>
    </div>
  );
}
