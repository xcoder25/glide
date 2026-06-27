"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Phone, Shield, Star, AlertCircle, ArrowUpRight, Sliders, ChevronDown, ChevronUp, Send, X, Share2, AlertTriangle } from "lucide-react";

export type RideStatus = "searching" | "arriving" | "arrived" | "inprogress" | "completed";

interface ActiveRideProps {
  categoryName: string;
  price: number;
  pickupName: string;
  dropoffName: string;
  status: RideStatus;
  onStatusChange: (status: RideStatus) => void;
  onCancel: () => void;
}

export default function ActiveRide({
  categoryName,
  price,
  pickupName,
  dropoffName,
  status,
  onStatusChange,
  onCancel,
}: ActiveRideProps) {
  const [eta, setEta] = useState(3);
  const [progress, setProgress] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "driver", text: "Hello! I'm on my way to your pickup location.", time: "Now" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-advance simulation in demo mode
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "arriving") {
      setEta(3);
      setProgress(0);
      // Auto-arrive after 10s
      timer = setTimeout(() => {
        onStatusChange("arrived");
      }, 10000);
    } else if (status === "arrived") {
      setEta(0);
      setProgress(0);
      // Auto start trip after 5s
      timer = setTimeout(() => {
        onStatusChange("inprogress");
      }, 5000);
    } else if (status === "inprogress") {
      setEta(8);
      setProgress(0);
      
      // Simulate progress bar over 15 seconds
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 6.66; // reaches 100 in 15s
          return next >= 100 ? 100 : next;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else if (status === "completed") {
      setProgress(100);
      setEta(0);
    }

    return () => clearTimeout(timer);
  }, [status, onStatusChange]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput.trim(), time: "Now" };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    // Simulated driver reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Got it, be there shortly!",
        "On my way, traffic is light 👍",
        "No problem, I can see you on the map.",
        "I'm just 2 minutes away!",
      ];
      setMessages(prev => [...prev, { from: "driver", text: replies[Math.floor(Math.random() * replies.length)], time: "Now" }]);
    }, 1500);
  };

  // Handle ETA update and ride completion when progress changes
  useEffect(() => {
    if (status === "inprogress") {
      if (progress >= 100) {
        onStatusChange("completed");
      } else {
        const newEta = Math.max(1, Math.round(8 * (1 - progress / 100)));
        setEta((prevEta) => (prevEta !== newEta ? newEta : prevEta));
      }
    }
  }, [progress, status, onStatusChange]);

  const getStatusHeader = () => {
    switch (status) {
      case "searching":
        return { title: "Connecting with driver...", desc: "Contacting nearby Glide operators" };
      case "arriving":
        return { title: "Driver is arriving", desc: "Marcus is on his way to your pickup location" };
      case "arrived":
        return { title: "Driver has arrived", desc: "Your Toyota Corolla is outside" };
      case "inprogress":
        return { title: "Heading to destination", desc: "Enjoy your comfortable premium ride" };
      case "completed":
        return { title: "Trip completed", desc: "Thank you for riding with Glide!" };
    }
  };

  const header = getStatusHeader();

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Simulation Info Pill */}
      <div
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          background: "rgba(217, 95, 0, 0.03)",
          border: "1px solid rgba(217, 95, 0, 0.15)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.8rem",
          color: "var(--primary)",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(217, 95, 0, 0.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(217, 95, 0, 0.03)")}
      >
        <AlertCircle size={15} />
        <span style={{ flex: 1, fontWeight: 600 }}>
          Simulation active. Tap to toggle diagnostics controls.
        </span>
        {showDiagnostics ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>

      {/* Manual Driver Simulation Panel */}
      {showDiagnostics && (
        <div
          className="animate-slide-up"
          style={{
            padding: "14px",
            background: "rgba(0, 0, 0, 0.015)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "10px",
            }}
          >
            <Sliders size={12} /> Live Simulation Override
          </span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["arriving", "arrived", "inprogress", "completed"] as RideStatus[]).map((state) => (
              <button
                key={state}
                onClick={() => onStatusChange(state)}
                style={{
                  fontSize: "0.7rem",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: status === state ? "var(--primary)" : "rgba(0,0,0,0.05)",
                  background: status === state ? "rgba(217, 95, 0, 0.06)" : "rgba(0,0,0,0.01)",
                  color: status === state ? "var(--primary)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {state === "inprogress" ? "In Trip" : state}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ride Header Card */}
      <div style={{ textAlign: "left", marginTop: "4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>
            {header.title}
          </h2>
          {status !== "completed" && (
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "var(--primary)",
                textShadow: "0 2px 8px rgba(217, 95, 0, 0.12)",
              }}
            >
              {eta > 0 ? `${eta} min` : "Now"}
            </span>
          )}
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
          {header.desc}
        </p>
      </div>

      {/* Progress Bar */}
      {(status === "inprogress" || status === "arriving") && (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              width: "100%",
              height: "6px",
              background: "rgba(0, 0, 0, 0.04)",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${progress || (status === "arriving" ? 30 : 0)}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)",
                borderRadius: "10px",
                transition: "width 0.4s cubic-bezier(0.1, 0.8, 0.25, 1)",
                boxShadow: "0 0 8px rgba(26, 107, 60, 0.3)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            <span style={{ color: status === "arriving" ? "var(--primary)" : "inherit", fontWeight: status === "arriving" ? 600 : 500 }}>
              {pickupName}
            </span>
            <span style={{ color: status === "inprogress" ? "var(--primary)" : "inherit", fontWeight: status === "inprogress" ? 600 : 500 }}>
              {dropoffName}
            </span>
          </div>
        </div>
      )}

      {/* ── AI Safety Companion: Route Deviation Alert ── */}
      {status === "inprogress" && (
        <div
          className="animate-slide-up"
          style={{
            padding: "14px 16px",
            background: "rgba(217,95,0,0.04)",
            border: "1.5px solid rgba(217,95,0,0.2)",
            borderRadius: "14px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(217,95,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Shield size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Safety Companion</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--accent)" }}>Active</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-main)", lineHeight: 1.5, fontWeight: 500 }}>
              ⚠️ Minor deviation detected: Driver bypassed Ikot Ekpene Road to avoid temporary construction traffic near Ibom Plaza. Security monitoring is active.
            </p>
            <button
              onClick={() => alert("📍 Live trip link copied! Share with your emergency contact.")}
              style={{ marginTop: "8px", padding: "6px 12px", background: "rgba(217,95,0,0.1)", border: "1px solid rgba(217,95,0,0.2)", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700, color: "var(--primary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
            >
              Share Live Link
            </button>
          </div>
        </div>
      )}

      {/* ── Smart ETA: Weather-Aware Card ── */}
      {(status === "arriving" || status === "inprogress") && (
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(26,107,60,0.04)",
            border: "1px solid rgba(26,107,60,0.15)",
            borderRadius: "14px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(26,107,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "1rem" }}>
            🌧️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Smart ETA</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-main)", lineHeight: 1.5, fontWeight: 500 }}>
              Heavy rain is slowing traffic along Oron Road. Arrival updated to <strong>{eta + 3} min</strong> (+3 min delay). Driver is taking Nwaniba Road as alternate route.
            </p>
          </div>
        </div>
      )}

      {/* Driver Information Card */}
      {status !== "searching" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "18px",
            background: "rgba(0, 0, 0, 0.015)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {/* Driver details */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              {/* Driver Image Mock */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#ffffff",
                  boxShadow: "0 4px 12px rgba(217, 95, 0, 0.25)",
                  position: "relative",
                }}
              >
                {/* Active driver status */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: "#10b981",
                    border: "2px solid #ffffff",
                  }}
                />
                MS
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                  Marcus Sterling
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                  <Star size={12} fill="var(--accent)" stroke="var(--accent)" />
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>4.9</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>(2,490 rides)</span>
                </div>
              </div>
            </div>

            {/* Car specifications */}
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)" }}>
                Toyota Corolla
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--primary)",
                  marginTop: "2px",
                  fontWeight: 700,
                  background: "rgba(217, 95, 0, 0.08)",
                  border: "1px solid rgba(217, 95, 0, 0.15)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  display: "inline-block",
                  letterSpacing: "0.05em",
                }}
              >
                GLIDE-001
              </div>
            </div>
          </div>

          {/* Action buttons (Call / Msg / Safe / SOS / Share) */}
          {status !== "completed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "10px 12px", fontSize: "0.8rem", borderRadius: "10px" }}
                  onClick={() => setShowChat(true)}
                >
                  <MessageSquare size={14} style={{ color: "var(--text-muted)" }} /> Message
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "10px 12px", fontSize: "0.8rem", borderRadius: "10px" }}
                >
                  <Phone size={14} style={{ color: "var(--text-muted)" }} /> Call
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "10px 12px", fontSize: "0.8rem", borderRadius: "10px", borderColor: "rgba(26, 107, 60, 0.15)", color: "var(--accent)", background: "rgba(26, 107, 60, 0.02)" }}
                  onClick={() => setShowShare(true)}
                >
                  <Share2 size={14} /> Share
                </button>
              </div>
              {/* SOS Row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.12)", borderRadius: "12px" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>Emergency? Press SOS to alert contacts</span>
                <button className="sos-btn" onClick={() => setShowSOS(true)} aria-label="SOS Emergency">
                  SOS
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Trip Complete Receipt Card ── */}
      {status === "completed" ? (
        <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
          {/* Success banner */}
          <div style={{ textAlign: "center", padding: "20px 16px", background: "linear-gradient(135deg, rgba(26,107,60,0.08) 0%, rgba(217,95,0,0.05) 100%)", border: "1.5px solid rgba(26,107,60,0.18)", borderRadius: "16px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent) 0%, #0d5c2e 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto", boxShadow: "0 8px 24px rgba(26,107,60,0.3)" }}>
              <ArrowUpRight size={24} color="#fff" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-main)" }}>You've arrived! 🎉</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>Ride to {dropoffName} completed</p>
          </div>

          {/* Fare breakdown */}
          <div style={{ padding: "16px 18px", background: "rgba(0,0,0,0.015)", border: "1px solid var(--card-border)", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Trip Receipt</p>
            {[
              { label: "Route", value: `${pickupName} → ${dropoffName}` },
              { label: "Vehicle", value: categoryName },
              { label: "Payment", value: "Glide Wallet" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main)", textAlign: "right" }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed var(--card-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>Total Charged</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)" }}>₦{price.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="btn btn-primary"
            style={{ padding: "15px", fontSize: "1rem", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
          >
            <Star size={18} /> Done & Rate Your Ride
          </button>
        </div>
      ) : (
        <button
          onClick={onCancel}
          className="btn btn-secondary"
          style={{
            padding: "14px",
            borderColor: "rgba(239, 68, 68, 0.15)",
            color: "#dc2626",
            background: "rgba(239, 68, 68, 0.02)",
            marginTop: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.06)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.02)";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.15)";
          }}
        >
          Cancel Ride
        </button>
      )}

    </div>

      {/* ── CHAT PANEL ── */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ maxHeight: "70vh", display: "flex", flexDirection: "column" }}>
            {/* Chat header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>MS</div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Marcus Sterling</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 600 }}>● Online</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px", minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  <div className={`chat-bubble ${msg.from === "user" ? "mine" : "theirs"}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "11px 14px", border: "1.5px solid var(--card-border-focus)", borderRadius: "12px", fontSize: "0.88rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none" }}
              />
              <button onClick={sendMessage} className="btn btn-primary" style={{ padding: "10px 16px", borderRadius: "12px" }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SOS MODAL ── */}
      {showSOS && (
        <div className="modal-overlay" onClick={() => setShowSOS(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
              <AlertTriangle size={32} style={{ color: "#dc2626" }} />
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-main)" }}>Emergency Alert</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.6, marginBottom: "24px" }}>
              Your emergency contacts and Glide safety team will be notified with your current location immediately.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => { alert("🚨 SOS Alert sent! Emergency contacts have been notified."); setShowSOS(false); }}
                style={{ padding: "15px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "14px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                🚨 Send SOS Alert
              </button>
              <button onClick={() => setShowSOS(false)} className="btn btn-secondary" style={{ padding: "13px" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE TRIP MODAL ── */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>Share Trip</h3>
              <button onClick={() => setShowShare(false)} style={{ border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: "14px 16px", background: "rgba(0,0,0,0.03)", borderRadius: "12px", marginBottom: "16px", fontFamily: "monospace", fontSize: "0.82rem", color: "var(--text-muted)", wordBreak: "break-all" }}>
              https://glide.ng/track/ride-{Math.random().toString(36).slice(2, 8).toUpperCase()}
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.5 }}>
              Share this link so your contacts can follow your trip in real-time.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setShowShare(false); }} className="btn btn-primary" style={{ flex: 1, padding: "13px" }}>
                📋 Copy Link
              </button>
              <button onClick={() => setShowShare(false)} className="btn btn-secondary" style={{ flex: 1, padding: "13px" }}>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
