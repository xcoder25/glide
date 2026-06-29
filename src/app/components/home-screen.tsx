"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Star, Clock, ChevronRight, Zap, Mic, Send, X, Sparkles } from "lucide-react";
import { PRESET_LOCATIONS, type LocationData } from "./booking-form";

interface HomeScreenProps {
  userName: string;
  recentDestinations: LocationData[];
  favoriteHome?: LocationData;
  favoriteWork?: LocationData;
  deviceLocation?: LocationData | null;
  onStartBooking: (pickup?: LocationData, dropoff?: LocationData) => void;
}

export default function HomeScreen({
  userName,
  recentDestinations,
  favoriteHome,
  favoriteWork,
  deviceLocation = null,
  onStartBooking,
}: HomeScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [copilotText, setCopilotText] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "ai" | "user"; text: string; action?: React.ReactNode }[]>([
    { sender: "ai", text: "👋 Hi! I'm your Glide AI. Ask me to book airport rides, find hospitals, or check your spend." }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [showCommuteBanner, setShowCommuteBanner] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const UYO_CENTER: LocationData = { name: "Uyo City Centre", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom State" };

  const parseAIIntent = (input: string) => {
    const text = input.trim().toLowerCase();
    if (!text) return;
    setChatHistory(prev => [...prev, { sender: "user", text: input }]);
    setCopilotText("");

    setTimeout(() => {
      if (text.includes("airport") || text.includes("flight")) {
        const dropoff = PRESET_LOCATIONS[0];
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [...prev, { sender: "ai", text: `✈️ Airport Run ready! Destination set to Akwa Ibom Airport.`, action: (
          <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: "10px", marginTop: "6px" }} onClick={() => onStartBooking(pickupLoc, dropoff)}>Book Airport Ride</button>
        )}]);
        return;
      }
      if (text.includes("hospital") || text.includes("clinic") || text.includes("doctor")) {
        const dest = PRESET_LOCATIONS.find(l => l.name.includes("Hospital")) || { name: "Ibom Specialist Hospital", lat: 5.0218, lng: 7.9418, address: "Itam, Uyo, Akwa Ibom State" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [...prev, { sender: "ai", text: `🏥 Ibom Specialist Hospital found nearby in Itam.`, action: (
          <button className="btn btn-accent" style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: "10px", marginTop: "6px" }} onClick={() => onStartBooking(pickupLoc, dest)}>Confirm Medical Booking</button>
        )}]);
        return;
      }
      if (text.includes("atm") || text.includes("bank")) {
        const dest: LocationData = { name: "UBA Uyo Branch", lat: 5.0290, lng: 7.9240, address: "Abak Rd, Uyo, Akwa Ibom" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [...prev, { sender: "ai", text: `🏧 UBA Uyo Branch on Abak Rd — 3 mins away.`, action: (
          <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: "10px", marginTop: "6px" }} onClick={() => onStartBooking(pickupLoc, dest)}>Book Ride to Bank</button>
        )}]);
        return;
      }
      if (text.includes("budget") || text.includes("spent") || text.includes("cost")) {
        setChatHistory(prev => [...prev, { sender: "ai", text: `📊 You spent ₦12,100 across 2 rides this month (avg ₦4,033/trip). Averaging 10 km per trip.` }]);
        return;
      }
      if (text.includes("cheapest") || text.includes("cheap")) {
        setChatHistory(prev => [...prev, { sender: "ai", text: `💰 Glide Lite is your cheapest option — ₦600 base + ₦150/km. Book now and save!` }]);
        return;
      }
      setChatHistory(prev => [...prev, { sender: "ai", text: `🔍 Try: "Airport ride", "Hospital", "Bank", "Budget stats", or "Cheapest ride"` }]);
    }, 900);
  };

  const startVoiceBookingSimulation = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const pickupLoc = deviceLocation || UYO_CENTER;
      const homeLoc: LocationData = { name: "Home", lat: 5.0450, lng: 7.9320, address: "Ewet Housing Estate, Uyo" };
      setChatHistory(prev => [...prev,
        { sender: "user", text: "Book me a ride home." },
        { sender: "ai", text: `🏡 Voice booking detected! Destination: Home (Ewet Housing, Uyo). Est. ₦1,200.`, action: (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button className="btn btn-primary" style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: "10px" }} onClick={() => onStartBooking(pickupLoc, homeLoc)}>Confirm</button>
            <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: "0.76rem", borderRadius: "10px" }} onClick={() => setChatHistory(p => [...p, { sender: "ai", text: "Cancelled." }])}>Cancel</button>
          </div>
        )}
      ]);
    }, 2000);
  };

  useEffect(() => {
    if (searchText.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    const q = searchText.toLowerCase();
    setSuggestions(PRESET_LOCATIONS.filter(l => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)).slice(0, 5));
    setShowSuggestions(true);
  }, [searchText]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const sortedPresets = [...PRESET_LOCATIONS];
  if (deviceLocation) {
    sortedPresets.sort((a, b) => {
      const dA = Math.sqrt((a.lat - deviceLocation.lat) ** 2 + (a.lng - deviceLocation.lng) ** 2);
      const dB = Math.sqrt((b.lat - deviceLocation.lat) ** 2 + (b.lng - deviceLocation.lng) ** 2);
      return dA - dB;
    });
  }

  const quickDestinations: LocationData[] = [
    ...(favoriteHome ? [{ ...favoriteHome, name: "Home" }] : []),
    ...(favoriteWork ? [{ ...favoriteWork, name: "Work" }] : []),
    ...sortedPresets,
  ].slice(0, 4);

  const quickDestIcons = ["🏠", "💼", "📍", "📍", "📍", "📍"];

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Smart Commute Banner */}
      {showCommuteBanner && (
        <div className="animate-slide-up" style={{
          margin: "0",
          background: "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(14,165,233,0.07) 100%)",
          borderBottom: "1px solid rgba(249,115,22,0.12)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "10px", background: "var(--primary-subtle)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--primary-subtle)", padding: "2px 8px", borderRadius: "99px", border: "1px solid var(--primary-glow)" }}>Smart Suggestion</span>
            </div>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-heading)" }}>Ready for your morning office ride?</p>
            <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.4 }}>Traffic is moderate on Abak Rd. Leave 10 mins early.</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: "0.72rem", borderRadius: "8px" }}
                onClick={() => {
                  const pickupLoc = deviceLocation || UYO_CENTER;
                  const targetWork = favoriteWork || { name: "UNIUYO", lat: 5.0419, lng: 7.9238, address: "Ikpa Road, Uyo" };
                  onStartBooking(pickupLoc, targetWork);
                }}>
                Book Office Ride
              </button>
              <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.72rem", borderRadius: "8px" }} onClick={() => setShowCommuteBanner(false)}>Dismiss</button>
            </div>
          </div>
          <button onClick={() => setShowCommuteBanner(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 28px) 0", display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 22px)" }}>

        {/* Header */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{greeting} 👋</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "4px 10px",
              background: "var(--sky-subtle)",
              border: "1px solid var(--sky-glow)",
              borderRadius: "99px",
              fontSize: "0.62rem", fontWeight: 800, color: "var(--sky)",
              letterSpacing: "0.04em",
            }}>
              📍 Uyo, AKS
            </span>
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem, 5vw, 1.9rem)", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Where to,{" "}
            <span style={{ color: "var(--primary)" }}>{userName.split(" ")[0]}</span>?
          </h2>
          <p style={{ fontSize: "0.76rem", color: "var(--text-faint)", marginTop: "6px", fontWeight: 500 }}>
            Rides across Uyo &amp; Akwa Ibom State
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 16px",
              background: "var(--bg-secondary)",
              border: "1.5px solid var(--card-border-strong)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-md)",
              cursor: "text",
              transition: "box-shadow 0.2s, border-color 0.2s",
            }}
            onClick={() => inputRef.current?.focus()}
          >
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Search size={16} style={{ color: "var(--primary)" }} />
            </div>
            <input
              ref={inputRef}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onFocus={() => searchText.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search destination in Uyo..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "0.92rem",
                fontFamily: "var(--font)",
                color: "var(--text-heading)",
                outline: "none",
                fontWeight: 500,
              }}
            />
            <button
              onClick={() => onStartBooking()}
              style={{
                padding: "8px 16px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r-sm)",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font)",
                boxShadow: "var(--shadow-primary)",
                transition: "all 0.2s var(--ease)",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
            >
              Go →
            </button>
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="animate-slide-up" style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0, right: 0,
              background: "var(--bg-secondary)",
              border: "1px solid var(--card-border)",
              borderRadius: "var(--r-lg)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 50,
              overflow: "hidden",
            }}>
              {suggestions.map((loc, i) => (
                <button
                  key={loc.name}
                  onMouseDown={() => { setSearchText(""); setShowSuggestions(false); onStartBooking(undefined, loc); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 18px",
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--card-border)" : "none",
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-subtle)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={13} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-heading)" }}>{loc.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>{loc.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Location Button */}
        <button
          onClick={() => onStartBooking(deviceLocation || { name: "My Location", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom State" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            background: "var(--sky-subtle)",
            border: "1px solid var(--sky-glow)",
            borderRadius: "var(--r-md)",
            color: "var(--sky)",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font)",
            width: "100%",
            transition: "all 0.2s var(--ease)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--sky-subtle)"; e.currentTarget.style.transform = ""; }}
        >
          <Navigation size={15} />
          Use my current location
        </button>

        {/* Quick Destinations */}
        <div>
          <p className="section-header" style={{ marginBottom: "10px" }}>Quick Destinations</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {quickDestinations.map((loc, i) => (
              <button
                key={i}
                onClick={() => onStartBooking(undefined, loc)}
                style={{
                  padding: "14px",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--r-md)",
                  background: "var(--card-bg)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "all 0.2s var(--ease)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--card-shadow-hover)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: "10px", background: "var(--primary-subtle)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1rem" }}>
                  {quickDestIcons[i] || "📍"}
                </div>
                <div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-heading)" }}>{loc.name.replace(/^🏠 |^💼 /, "")}</p>
                  <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", marginTop: "1px", lineHeight: 1.3 }}>
                    {loc.address.split(",")[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Copilot */}
        <div style={{
          background: "linear-gradient(135deg, rgba(249,115,22,0.05) 0%, rgba(14,165,233,0.05) 100%)",
          border: "1px solid var(--card-border-strong)",
          borderRadius: "var(--r-xl)",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Copilot Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 30, height: 30, borderRadius: "9px", background: "linear-gradient(135deg, var(--primary), var(--sky))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-primary)", flexShrink: 0 }}>
              <Zap size={15} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-heading)", lineHeight: 1 }}>Glide AI Copilot</p>
              <p style={{ fontSize: "0.62rem", color: "var(--text-faint)", fontWeight: 500 }}>Your intelligent ride assistant</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "0.58rem", fontWeight: 800, color: "var(--sky)", background: "var(--sky-subtle)", border: "1px solid var(--sky-glow)", borderRadius: "20px", padding: "3px 8px" }}>LIVE</span>
          </div>

          {/* Chat Window */}
          <div style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--r-md)",
            maxHeight: "150px",
            minHeight: "90px",
            overflowY: "auto",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}>
            {chatHistory.map((chat, idx) => {
              const isAi = chat.sender === "ai";
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignSelf: isAi ? "flex-start" : "flex-end", maxWidth: "88%" }}>
                  <div style={{
                    background: isAi ? "var(--card-bg)" : "var(--primary)",
                    border: isAi ? "1px solid var(--card-border)" : "none",
                    color: isAi ? "var(--text-body)" : "#fff",
                    borderRadius: isAi ? "10px 10px 10px 3px" : "10px 10px 3px 10px",
                    padding: "7px 10px",
                    fontSize: "0.76rem",
                    lineHeight: 1.45,
                  }}>
                    {chat.text}
                  </div>
                  {chat.action && <div style={{ marginTop: "4px", alignSelf: "flex-start" }}>{chat.action}</div>}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chips */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            {[
              { label: "✈️ Airport", query: "Book me to the airport" },
              { label: "🏥 Hospital", query: "Hospital nearby" },
              { label: "💰 Cheapest", query: "cheapest ride" },
              { label: "📊 Budget", query: "budget stats" },
            ].map(tag => (
              <button
                key={tag.label}
                onClick={() => parseAIIntent(tag.query)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "99px",
                  border: "1px solid var(--card-border-strong)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  background: "var(--bg-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font)",
                  transition: "all 0.2s var(--ease)",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-subtle)"; e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Voice + Text Row */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={startVoiceBookingSimulation}
              disabled={isListening}
              title="Voice Booking"
              style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: isListening ? "var(--danger)" : "var(--primary)",
                border: "none",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: isListening ? "0 0 20px rgba(239,68,68,0.5)" : "var(--shadow-primary)",
                animation: isListening ? "finding-pulse 1.2s infinite" : "none",
                flexShrink: 0,
                transition: "all 0.2s var(--ease)",
              }}
            >
              <Mic size={16} />
            </button>

            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <input
                value={copilotText}
                onChange={e => setCopilotText(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask Copilot anything..."}
                disabled={isListening}
                onKeyDown={e => e.key === "Enter" && parseAIIntent(copilotText)}
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 14px",
                  border: "1.5px solid var(--card-border-strong)",
                  borderRadius: "var(--r-md)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-heading)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
              />
              <button
                onClick={() => parseAIIntent(copilotText)}
                disabled={isListening || !copilotText.trim()}
                style={{
                  position: "absolute", right: 10,
                  border: "none", background: "none",
                  cursor: copilotText.trim() ? "pointer" : "default",
                  color: copilotText.trim() ? "var(--primary)" : "var(--text-faint)",
                  transition: "color 0.2s",
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Destinations */}
        {recentDestinations.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <p className="section-header">Recent Trips</p>
              <button style={{ border: "none", background: "none", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: "4px" }}>
                See all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentDestinations.slice(0, 3).map((loc, i) => (
                <button
                  key={i}
                  onClick={() => onStartBooking(undefined, loc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    border: "1px solid var(--card-border)",
                    borderRadius: "var(--r-md)",
                    background: "var(--card-bg)",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    width: "100%",
                    textAlign: "left",
                    transition: "all 0.2s var(--ease)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--card-border)"; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "9px", background: "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock size={14} style={{ color: "var(--text-faint)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)" }}>{loc.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "1px" }}>{loc.address.split(",")[0]}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-faint)" }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loyalty Status */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
          borderRadius: "var(--r-xl)",
          padding: "20px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-primary)",
          marginBottom: "clamp(72px, 12vw, 96px)",
        }}>
          {/* Background circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: 10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "10px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} fill="#fff" stroke="#fff" />
              </div>
              <div>
                <p style={{ fontSize: "0.88rem", fontWeight: 800, lineHeight: 1 }}>Glide Loyalty Club</p>
                <p style={{ fontSize: "0.68rem", opacity: 0.8, marginTop: "2px", fontWeight: 500 }}>Emerald Member · Tier 2</p>
              </div>
            </div>
            <span style={{ background: "rgba(255,255,255,0.22)", padding: "4px 12px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 800 }}>
              🎁 220 pts left
            </span>
          </div>

          <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "99px", overflow: "hidden", position: "relative", zIndex: 1 }}>
            <div style={{ width: "78%", height: "100%", background: "rgba(255,255,255,0.7)", borderRadius: "99px", boxShadow: "0 0 10px rgba(255,255,255,0.4)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", opacity: 0.85, marginTop: "8px", fontWeight: 600, position: "relative", zIndex: 1 }}>
            <span>780 / 1,000 points</span>
            <span>Free ride at 1,000 ✨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
