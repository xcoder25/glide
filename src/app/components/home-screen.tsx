"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Navigation, Star, Clock, ChevronRight, Zap, Mic, Send, Volume2, X } from "lucide-react";
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

  // ── AI Copilot & Voice Booking States ──
  const [copilotText, setCopilotText] = useState("");
  const [chatHistory, setChatHistory] = useState<{ sender: "ai" | "user"; text: string; action?: React.ReactNode }[]>([
    { sender: "ai", text: "Hello! I am your Glide AI Copilot. Ask me to book a ride, find points of interest, or display receipt summaries." }
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
      // 1. Airport Booking Intent
      if (text.includes("airport") || text.includes("flight")) {
        const dropoff = PRESET_LOCATIONS[0]; // Akwa Ibom Airport
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `✈️ Preparing your Airport Run! Setting destination to Akwa Ibom Airport. Let's choose your ride.`,
            action: (
              <button
                className="btn btn-primary"
                style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", marginTop: "6px" }}
                onClick={() => onStartBooking(pickupLoc, dropoff)}
              >
                Go to Vehicle Select
              </button>
            )
          }
        ]);
        return;
      }

      // 2. Points of Interest
      if (text.includes("atm") || text.includes("bank") || text.includes("cash")) {
        const dest: LocationData = { name: "UBA Uyo Branch", lat: 5.0290, lng: 7.9240, address: "Abak Rd, Uyo, Akwa Ibom" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `🏧 Found UBA Uyo Branch on Abak Rd, just 3 minutes away. Book a ride there?`,
            action: (
              <button
                className="btn btn-primary"
                style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", marginTop: "6px" }}
                onClick={() => onStartBooking(pickupLoc, dest)}
              >
                Book Ride to Bank
              </button>
            )
          }
        ]);
        return;
      }

      if (text.includes("hospital") || text.includes("clinic") || text.includes("doctor") || text.includes("medical")) {
        const dest: LocationData = PRESET_LOCATIONS.find(l => l.name.includes("Hospital")) || { name: "Ibom Specialist Hospital", lat: 5.0218, lng: 7.9418, address: "Itam, Uyo, Akwa Ibom State" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `🏥 Ibom Specialist Hospital is nearby in Itam. Traffic is normal. Ready to book?`,
            action: (
              <button
                className="btn btn-accent"
                style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", marginTop: "6px" }}
                onClick={() => onStartBooking(pickupLoc, dest)}
              >
                Confirm Medical Booking
              </button>
            )
          }
        ]);
        return;
      }

      if (text.includes("pharmacy") || text.includes("drug") || text.includes("medication")) {
        const dest: LocationData = { name: "HealthPlus Pharmacy Uyo", lat: 5.0315, lng: 7.9250, address: "Abak Road, Uyo, Akwa Ibom" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `💊 Found HealthPlus Pharmacy on Abak Road, Uyo. Let's arrange a ride.`,
            action: (
              <button
                className="btn btn-primary"
                style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", marginTop: "6px" }}
                onClick={() => onStartBooking(pickupLoc, dest)}
              >
                Book Pharmacy Ride
              </button>
            )
          }
        ]);
        return;
      }

      if (text.includes("restaurant") || text.includes("eat") || text.includes("food") || text.includes("dinner")) {
        const dest: LocationData = { name: "Ibom Icon Hotel & Suites", lat: 5.0112, lng: 7.9491, address: "Nwaniba Road, Uyo, Akwa Ibom" };
        const pickupLoc = deviceLocation || UYO_CENTER;
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `🍽️ Ibom Icon Hotel has excellent dining experiences. Shall I book your ride there?`,
            action: (
              <button
                className="btn btn-primary"
                style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", marginTop: "6px" }}
                onClick={() => onStartBooking(pickupLoc, dest)}
              >
                Let's Dine
              </button>
            )
          }
        ]);
        return;
      }

      // 3. Cheapest ride
      if (text.includes("cheapest") || text.includes("cheap") || text.includes("low")) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `💰 Our most cost-efficient option is Glide Standard (₦800 base rate + ₦200/km). Let's set your route to apply this rate.`
          }
        ]);
        return;
      }

      // 4. Receipt/Budget Stats
      if (text.includes("budget") || text.includes("receipt") || text.includes("spent") || text.includes("cost") || text.includes("money") || text.includes("budgeting")) {
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `📊 **Receipt Intelligence**: You spent ₦12,100 across 2 completed rides this month (average ₦4,033 per trip). You saved 28.4 kg of CO₂ emissions using our efficient fleet.`
          }
        ]);
        return;
      }

      // 5. Default
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: `🔍 I can search places like "Airport", "Hospital", "Bank", or explain "Cheapest ride" or "Budget stats".`
        }
      ]);
    }, 1000);
  };

  const startVoiceBookingSimulation = () => {
    setIsListening(true);
    setCopilotText("Listening...");
    
    setTimeout(() => {
      setIsListening(false);
      setCopilotText("Book me a ride home.");
      
      setChatHistory(prev => [...prev, { sender: "user", text: "Book me a ride home." }]);
      setCopilotText("");
      
      setTimeout(() => {
        const pickupLoc = deviceLocation || UYO_CENTER;
        const homeLoc: LocationData = {
          name: "Home",
          lat: 5.0450,
          lng: 7.9320,
          address: "Ewet Housing Estate, Uyo, Akwa Ibom"
        };
        
        setChatHistory(prev => [
          ...prev,
          {
            sender: "ai",
            text: `🏡 Voice Booking recognized! Destination: Home (Ewet Housing, Uyo). Estimated Standard fare: ₦1,200. Confirm?`,
            action: (
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px" }}
                  onClick={() => onStartBooking(pickupLoc, homeLoc)}
                >
                  Yes, Confirm
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px" }}
                  onClick={() => setChatHistory(prev => [...prev, { sender: "ai", text: "Voice booking cancelled." }])}
                >
                  Cancel
                </button>
              </div>
            )
          }
        ]);
      }, 1000);
    }, 2000);
  };

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

  const sortedPresets = [...PRESET_LOCATIONS];
  if (deviceLocation) {
    sortedPresets.sort((a, b) => {
      const distA = Math.sqrt((a.lat - deviceLocation.lat) ** 2 + (a.lng - deviceLocation.lng) ** 2);
      const distB = Math.sqrt((b.lat - deviceLocation.lat) ** 2 + (b.lng - deviceLocation.lng) ** 2);
      return distA - distB;
    });
  }

  const quickDestinations: LocationData[] = [
    ...(favoriteHome ? [{ ...favoriteHome, name: "🏠 Home" }] : []),
    ...(favoriteWork ? [{ ...favoriteWork, name: "💼 Work" }] : []),
    ...sortedPresets,
  ].slice(0, 4);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      
      {/* Predictive Commute Banner */}
      {showCommuteBanner && (
        <div
          className="animate-slide-up"
          style={{
            background: "linear-gradient(135deg, rgba(217,95,0,0.08) 0%, rgba(26,107,60,0.08) 100%)",
            borderBottom: "1.5px solid rgba(217,95,0,0.15)",
            padding: "14px 20px 14px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            textAlign: "left",
            position: "relative",
          }}
        >
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "var(--primary)",
                background: "rgba(217,95,0,0.1)",
                padding: "2px 8px",
                borderRadius: "20px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Smart Suggestion
            </span>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)", marginTop: "6px" }}>
              Ready for your morning office ride?
            </p>
            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.45 }}>
              You usually head to UNIUYO (Ikpa Road) around 8:15 AM. Traffic is moderate on Abak Road today. Leaving 10 minutes earlier is advised.
            </p>
            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <button
                className="btn btn-primary"
                style={{ padding: "6px 14px", fontSize: "0.72rem", borderRadius: "8px" }}
                onClick={() => {
                  const pickupLoc = deviceLocation || { name: "Current Location", lat: 5.0301, lng: 7.9273, address: "Uyo, Akwa Ibom State" };
                  const targetWork = favoriteWork || { name: "University of Uyo (UNIUYO)", lat: 5.0419, lng: 7.9238, address: "Ikpa Road, Uyo, Akwa Ibom" };
                  onStartBooking(pickupLoc, targetWork);
                }}
              >
                Book Office Ride
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.72rem", borderRadius: "8px" }}
                onClick={() => setShowCommuteBanner(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCommuteBanner(false)}
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 28px) 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <p style={{ fontSize: "clamp(0.82rem, 2.5vw, 0.9rem)", color: "var(--text-muted)", fontWeight: 500 }}>{greeting} 👋</p>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            background: "rgba(217,95,0,0.08)",
            border: "1px solid rgba(217,95,0,0.18)",
            borderRadius: "99px",
            fontSize: "0.65rem",
            fontWeight: 800,
            color: "var(--primary)",
            letterSpacing: "0.04em",
          }}>
            📍 Uyo, AKS
          </span>
        </div>
        <h2 style={{ fontSize: "clamp(1.4rem, 5vw, 1.8rem)", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: "4px" }}>
          Where to, <span style={{ color: "var(--primary)" }}>{userName.split(" ")[0]}</span>?
        </h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>
          Rides across Uyo & Akwa Ibom State
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "14px clamp(16px, 5vw, 28px) 0", position: "relative" }}>
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
            placeholder="Search destination in Uyo..."
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
      <div style={{ padding: "10px clamp(16px, 5vw, 28px) 0" }}>
        <button
          onClick={() =>
            onStartBooking(
              deviceLocation || {
                name: "My Location",
                lat: 5.0301,
                lng: 7.9273,
                address: "Uyo, Akwa Ibom State",
              }
            )
          }
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

      <div style={{ padding: "clamp(16px, 4vw, 24px) clamp(16px, 5vw, 28px) 0", display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 24px)" }}>
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

        {/* Interactive AI Copilot & Voice Booking Console */}
        <div style={{
          background: "linear-gradient(135deg, rgba(217,95,0,0.06) 0%, rgba(26,107,60,0.06) 100%)",
          border: "1.5px solid rgba(217,95,0,0.18)",
          borderRadius: "20px",
          padding: "20px 18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: 26, height: 26, borderRadius: "8px", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} color="#fff" />
            </div>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Glide AI Copilot</span>
            <span style={{ marginLeft: "auto", fontSize: "0.6rem", fontWeight: 800, color: "var(--primary)", background: "rgba(217,95,0,0.1)", border: "1px solid rgba(217,95,0,0.2)", borderRadius: "20px", padding: "2px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Volume2 size={10} /> ASSISTANT
            </span>
          </div>

          {/* Chat Window */}
          <div style={{
            background: "rgba(255,255,255,0.45)",
            border: "1px solid var(--card-border)",
            borderRadius: "14px",
            maxHeight: "160px",
            minHeight: "100px",
            overflowY: "auto",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
            {chatHistory.map((chat, idx) => {
              const isAi = chat.sender === "ai";
              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignSelf: isAi ? "flex-start" : "flex-end", maxWidth: "85%" }}>
                  <div
                    style={{
                      background: isAi ? "rgba(0,0,0,0.035)" : "var(--primary)",
                      color: isAi ? "var(--text-main)" : "#fff",
                      borderRadius: isAi ? "12px 12px 12px 4px" : "12px 12px 4px 12px",
                      padding: "8px 12px",
                      fontSize: "0.78rem",
                      lineHeight: 1.45,
                    }}
                  >
                    {chat.text}
                  </div>
                  {chat.action && (
                    <div style={{ marginTop: "4px", alignSelf: "flex-start" }}>
                      {chat.action}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick AI Tag Prompts */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            {[
              { label: "✈️ Book Airport", query: "Book me a ride to the airport" },
              { label: "🏥 Hospital", query: "Take me to the nearest hospital" },
              { label: "💰 Cheapest Ride", query: "Find the cheapest ride" },
              { label: "📊 Spent money", query: "What is my budgeting status?" },
            ].map(tag => (
              <button
                key={tag.label}
                onClick={() => parseAIIntent(tag.query)}
                className="glass-card-interactive"
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--card-border)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  background: "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Voice/Text Action Bar */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {/* Pulse Mic Button */}
            <button
              onClick={startVoiceBookingSimulation}
              disabled={isListening}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: isListening ? "#dc2626" : "var(--primary)",
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: isListening ? "0 0 14px #dc2626" : "0 3px 8px rgba(217,95,0,0.2)",
                animation: isListening ? "finding-pulse 1.2s infinite" : "none",
                flexShrink: 0,
              }}
              title="Voice Booking"
            >
              <Mic size={16} />
            </button>

            {/* Input */}
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <input
                value={copilotText}
                onChange={e => setCopilotText(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask Copilot or speak..."}
                disabled={isListening}
                onKeyDown={e => e.key === "Enter" && parseAIIntent(copilotText)}
                style={{
                  width: "100%",
                  padding: "11px 40px 11px 14px",
                  border: "1.5px solid var(--card-border-focus)",
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.75)",
                  color: "var(--text-main)",
                  fontSize: "0.82rem",
                  fontFamily: "var(--font-sans)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => parseAIIntent(copilotText)}
                disabled={isListening || !copilotText.trim()}
                style={{
                  position: "absolute",
                  right: 12,
                  border: "none",
                  background: "none",
                  cursor: copilotText.trim() ? "pointer" : "default",
                  color: copilotText.trim() ? "var(--primary)" : "var(--text-muted)",
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
        <div style={{
          padding: "clamp(14px, 3vw, 20px) clamp(14px, 3vw, 20px)",
          background: "linear-gradient(135deg, rgba(217,95,0,0.06) 0%, rgba(26,107,60,0.06) 100%)",
          border: "1.5px solid rgba(217,95,0,0.15)",
          borderRadius: "20px",
          marginBottom: "clamp(72px, 12vw, 96px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={14} fill="#fff" stroke="#fff" />
              </div>
              <div>
                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-main)", display: "block" }}>Glide Loyalty Club</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>Emerald Member</span>
              </div>
            </div>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", background: "rgba(26,107,60,0.1)", padding: "3px 10px", borderRadius: "99px", border: "1px solid rgba(26,107,60,0.2)" }}>Tier 2</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{ width: "78%", height: "100%", background: "linear-gradient(90deg, var(--primary), var(--accent))", borderRadius: "99px", boxShadow: "0 0 8px rgba(217,95,0,0.35)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px", fontWeight: 600 }}>
            <span>780 / 1,000 points</span>
            <span style={{ color: "var(--primary)" }}>220 pts to free ride 🎁</span>
          </div>
        </div>
      </div>
    </div>
  );
}
