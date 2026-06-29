"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MessageSquare, Phone, Shield, Star, AlertCircle, ArrowUpRight, Sliders, ChevronDown, ChevronUp, Send, X, Share2, AlertTriangle, Copy, Check } from "lucide-react";

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

const CANCEL_REASONS = [
  "Changed my mind",
  "Driver is taking too long",
  "Found another ride",
  "Wrong pickup location",
  "Emergency came up",
  "Other reason",
];

const DRIVER_RATING_BREAKDOWN = [
  { label: "Friendliness", score: 4.9, icon: "😊" },
  { label: "Punctuality", score: 4.8, icon: "⏱️" },
  { label: "Safety",      score: 5.0, icon: "🛡️" },
  { label: "Cleanliness", score: 4.7, icon: "✨" },
  { label: "Route",       score: 4.9, icon: "🗺️" },
];

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
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDriverRating, setShowDriverRating] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([
    { from: "driver", text: "Hello! I'm on my way to your pickup location.", time: "Now" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stable share URL (doesn't regenerate on every render)
  const shareUrl = useMemo(
    () => `https://glide.ng/track/${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    []
  );

  // ETA seconds countdown
  useEffect(() => {
    if (status === "searching" || status === "completed") return;
    const tick = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setSeconds(59);
          setEta((e) => Math.max(0, e - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === "arriving") {
      setEta(3); setProgress(0); setSeconds(0);
      timer = setTimeout(() => onStatusChange("arrived"), 10000);
    } else if (status === "arrived") {
      setEta(0); setProgress(0); setSeconds(0);
      timer = setTimeout(() => onStatusChange("inprogress"), 5000);
    } else if (status === "inprogress") {
      setEta(8); setProgress(0); setSeconds(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 6.66;
          return next >= 100 ? 100 : next;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (status === "completed") {
      setProgress(100); setEta(0); setSeconds(0);
    }
    return () => clearTimeout(timer);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (status === "inprogress") {
      if (progress >= 100) {
        onStatusChange("completed");
      } else {
        const newEta = Math.max(1, Math.round(8 * (1 - progress / 100)));
        setEta(prev => prev !== newEta ? newEta : prev);
      }
    }
  }, [progress, status, onStatusChange]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput.trim(), time: "Now" };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
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

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    onCancel();
  };

  const STATUS_CONFIG = {
    searching:  { color: "var(--sky)",     bg: "var(--sky-subtle)",     label: "Searching" },
    arriving:   { color: "var(--primary)", bg: "var(--primary-subtle)", label: "Arriving"  },
    arrived:    { color: "var(--success)", bg: "var(--success-subtle)", label: "Arrived"   },
    inprogress: { color: "var(--sky)",     bg: "var(--sky-subtle)",     label: "In Trip"   },
    completed:  { color: "var(--success)", bg: "var(--success-subtle)", label: "Complete"  },
  };

  const getStatusText = () => {
    switch (status) {
      case "searching":  return { title: "Finding your driver...", desc: "Connecting with nearby Glide operators" };
      case "arriving":   return { title: "Driver is on the way", desc: "Marcus is heading to your pickup point" };
      case "arrived":    return { title: "Driver has arrived!", desc: "Your Toyota Corolla is waiting outside" };
      case "inprogress": return { title: "Heading to destination", desc: `En route to ${dropoffName}` };
      case "completed":  return { title: "You've arrived! 🎉", desc: "Thank you for riding with Glide" };
    }
  };

  const statusInfo = STATUS_CONFIG[status];
  const header = getStatusText();

  const etaDisplay = status !== "completed" && status !== "arrived" && eta > 0
    ? `${eta}m ${String(seconds).padStart(2, "0")}s`
    : null;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Status Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: statusInfo.color,
                boxShadow: `0 0 8px ${statusInfo.color}`,
                animation: status !== "completed" ? "finding-pulse 1.5s infinite" : "none",
              }} />
              <span style={{ fontSize: "0.65rem", fontWeight: 800, color: statusInfo.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {statusInfo.label}
              </span>
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {header.title}
            </h2>
            <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: 500 }}>{header.desc}</p>
          </div>
          {etaDisplay && (
            <div style={{ textAlign: "center", background: statusInfo.bg, border: `1px solid ${statusInfo.color}30`, borderRadius: "var(--r-lg)", padding: "10px 14px", flexShrink: 0, minWidth: 72 }}>
              <p style={{ fontSize: "1.1rem", fontWeight: 900, color: statusInfo.color, letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{etaDisplay}</p>
              <p style={{ fontSize: "0.55rem", fontWeight: 800, color: statusInfo.color, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>ETA</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {(status === "inprogress" || status === "arriving") && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ width: "100%", height: "6px", background: "var(--card-border)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                width: `${progress || (status === "arriving" ? 20 : 0)}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--primary), var(--sky))",
                borderRadius: "99px",
                transition: "width 0.5s var(--ease)",
                boxShadow: "0 0 8px rgba(249,115,22,0.4)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", fontWeight: 700 }}>
              <span style={{ color: status === "arriving" ? "var(--primary)" : "var(--text-faint)" }}>📍 {pickupName}</span>
              <span style={{ color: status === "inprogress" ? "var(--primary)" : "var(--text-faint)" }}>🏁 {dropoffName}</span>
            </div>
          </div>
        )}

        {/* Simulation Control */}
        <div
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px",
            background: "var(--primary-subtle)",
            border: "1px solid var(--primary-glow)",
            borderRadius: "var(--r-md)",
            fontSize: "0.77rem",
            color: "var(--primary)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(249,115,22,0.12)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--primary-subtle)"; }}
        >
          <AlertCircle size={14} />
          <span style={{ flex: 1, fontWeight: 700 }}>Demo simulation active — tap to control</span>
          {showDiagnostics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>

        {showDiagnostics && (
          <div className="animate-slide-up" style={{ padding: "14px", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <Sliders size={12} style={{ color: "var(--text-faint)" }} />
              <span className="section-header">Manual Override</span>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(["arriving", "arrived", "inprogress", "completed"] as RideStatus[]).map(state => (
                <button
                  key={state}
                  onClick={() => onStatusChange(state)}
                  style={{
                    fontSize: "0.72rem", padding: "7px 12px", borderRadius: "8px",
                    border: "1.5px solid",
                    borderColor: status === state ? "var(--primary)" : "var(--card-border-strong)",
                    background: status === state ? "var(--primary-subtle)" : "transparent",
                    color: status === state ? "var(--primary)" : "var(--text-muted)",
                    cursor: "pointer", fontWeight: 700, textTransform: "capitalize",
                    transition: "all 0.2s", fontFamily: "var(--font)",
                  }}
                >
                  {state === "inprogress" ? "In Trip" : state}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Safety Card */}
        {status === "inprogress" && (
          <div className="animate-slide-up" style={{
            padding: "14px 16px",
            background: "var(--primary-subtle)",
            border: "1px solid var(--primary-glow)",
            borderRadius: "var(--r-md)",
            display: "flex", gap: "12px", alignItems: "flex-start",
          }}>
            <div style={{ width: 34, height: 34, borderRadius: "10px", background: "var(--primary-subtle)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={16} style={{ color: "var(--primary)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Safety Companion</span>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", display: "inline-block", boxShadow: "0 0 6px var(--success)" }} />
                <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--success)" }}>Active</span>
              </div>
              <p style={{ fontSize: "0.76rem", color: "var(--text-body)", lineHeight: 1.55, fontWeight: 500 }}>
                ⚠️ Minor route deviation detected. Driver took Nwaniba Rd to avoid construction near Ibom Plaza. Monitoring active.
              </p>
              <button onClick={() => setShowShare(true)}
                style={{ marginTop: "8px", padding: "5px 12px", background: "var(--primary)", border: "none", borderRadius: "7px", fontSize: "0.7rem", fontWeight: 800, color: "#fff", cursor: "pointer", fontFamily: "var(--font)" }}>
                Share Live Link
              </button>
            </div>
          </div>
        )}

        {/* Smart ETA card */}
        {(status === "arriving" || status === "inprogress") && (
          <div style={{
            padding: "12px 14px",
            background: "var(--sky-subtle)",
            border: "1px solid var(--sky-glow)",
            borderRadius: "var(--r-md)",
            display: "flex", gap: "12px", alignItems: "center",
          }}>
            <span style={{ fontSize: "1.2rem" }}>🌧️</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--sky)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Smart ETA</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-body)", lineHeight: 1.5, fontWeight: 500 }}>
                Rain slowing Oron Rd. ETA updated to <strong>{eta + 3} min</strong>. Driver rerouting via Nwaniba Rd.
              </p>
            </div>
          </div>
        )}

        {/* Driver Card */}
        {status !== "searching" && (
          <div style={{
            padding: "16px",
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--r-lg)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "var(--shadow-sm)",
          }}>
            {/* Driver Top */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  {/* Pulsing ring during "arriving" */}
                  {status === "arriving" && (
                    <div style={{
                      position: "absolute", inset: -5,
                      borderRadius: "50%",
                      border: "2.5px solid var(--primary)",
                      animation: "finding-pulse 1.6s infinite",
                      pointerEvents: "none",
                    }} />
                  )}
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900, fontSize: "1.1rem", color: "#fff",
                    boxShadow: "var(--shadow-primary)",
                  }}>
                    MS
                  </div>
                  <div style={{
                    position: "absolute", bottom: 0, right: 0,
                    width: 12, height: 12, borderRadius: "50%",
                    background: "var(--success)", border: "2px solid var(--card-bg)",
                    boxShadow: "0 0 6px var(--success)",
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>Marcus Sterling</p>
                  <button
                    onClick={() => setShowDriverRating(true)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font)" }}
                    title="View rating breakdown"
                  >
                    <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
                    <span style={{ fontSize: "0.73rem", fontWeight: 800, color: "#F59E0B" }}>4.9</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontWeight: 500 }}>(2,490 rides)</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--sky)", fontWeight: 700, marginLeft: 2 }}>→ details</span>
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>Toyota Corolla</p>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--primary)", background: "var(--primary-subtle)", border: "1px solid var(--primary-glow)", padding: "2px 8px", borderRadius: "6px", display: "inline-block", marginTop: "3px", letterSpacing: "0.04em" }}>
                  GLIDE-001
                </span>
              </div>
            </div>

            {/* Action Toolbar */}
            {status !== "completed" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Message", icon: <MessageSquare size={15} />, action: () => setShowChat(true), color: "var(--text-muted)" },
                    { label: "Call", icon: <Phone size={15} />, action: () => {}, color: "var(--text-muted)" },
                    { label: "Share", icon: <Share2 size={15} />, action: () => setShowShare(true), color: "var(--success)" },
                  ].map(item => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      style={{
                        padding: "10px 8px",
                        border: "1.5px solid var(--card-border-strong)",
                        borderRadius: "var(--r-md)",
                        background: "var(--bg-secondary)",
                        color: item.color,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                        transition: "all 0.2s var(--ease)",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* SOS */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "var(--r-md)" }}>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600 }}>Emergency? Alert your contacts instantly</span>
                  <button className="sos-btn" onClick={() => setShowSOS(true)} aria-label="SOS Emergency">SOS</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Receipt */}
        {status === "completed" ? (
          <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ textAlign: "center", padding: "24px 20px", background: "linear-gradient(135deg, var(--success-subtle) 0%, var(--primary-subtle) 100%)", border: "1px solid var(--success-glow)", borderRadius: "var(--r-xl)" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--success), #059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", boxShadow: "0 8px 28px rgba(16,185,129,0.35)" }}>
                <ArrowUpRight size={26} color="#fff" strokeWidth={2.5} />
              </div>
              <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>You've arrived! 🎉</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "5px", fontWeight: 500 }}>Ride to {dropoffName} completed</p>
            </div>

            <div style={{ padding: "18px", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "var(--r-lg)", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "var(--shadow-sm)" }}>
              <p className="section-header">Trip Receipt</p>
              {[
                { label: "Route", value: `${pickupName} → ${dropoffName}` },
                { label: "Vehicle", value: categoryName },
                { label: "Payment", value: "Glide Wallet" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", paddingBottom: "8px", borderBottom: "1px solid var(--card-border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-body)", textAlign: "right" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-heading)" }}>Total Charged</span>
                <span style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em" }}>₦{price.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={onCancel} className="btn btn-primary" style={{ padding: "15px", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <Star size={18} /> Done &amp; Rate Your Ride
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCancelModal(true)}
            style={{
              padding: "14px",
              border: "1.5px solid rgba(239,68,68,0.2)",
              color: "var(--danger)",
              background: "rgba(239,68,68,0.03)",
              borderRadius: "var(--r-md)",
              fontFamily: "var(--font)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              width: "100%",
              transition: "all 0.2s var(--ease)",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.03)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"; }}
          >
            Cancel Ride
          </button>
        )}
      </div>

      {/* ═══ CANCEL REASON MODAL ═══ */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Cancel Ride</h3>
              <button onClick={() => setShowCancelModal(false)} style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-faint)" }}>
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "14px", fontWeight: 500, lineHeight: 1.5 }}>
              Please let us know why you're cancelling. This helps us serve you better.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
              {CANCEL_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  style={{
                    padding: "12px 16px",
                    border: `1.5px solid ${cancelReason === reason ? "var(--danger)" : "var(--card-border-strong)"}`,
                    borderRadius: "var(--r-md)",
                    background: cancelReason === reason ? "rgba(239,68,68,0.06)" : "var(--card-bg)",
                    color: cancelReason === reason ? "var(--danger)" : "var(--text-body)",
                    fontSize: "0.86rem",
                    fontWeight: cancelReason === reason ? 800 : 600,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.2s var(--ease)",
                  }}
                >
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${cancelReason === reason ? "var(--danger)" : "var(--card-border-strong)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {cancelReason === reason && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)" }} />}
                  </div>
                  {reason}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: "13px" }}>
                Keep Ride
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason}
                style={{
                  flex: 1, padding: "13px",
                  background: cancelReason ? "var(--danger)" : "var(--card-border)",
                  color: cancelReason ? "#fff" : "var(--text-faint)",
                  border: "none", borderRadius: "var(--r-md)",
                  fontFamily: "var(--font)", fontWeight: 800, fontSize: "0.9rem",
                  cursor: cancelReason ? "pointer" : "not-allowed",
                  transition: "all 0.2s var(--ease)",
                  boxShadow: cancelReason ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DRIVER RATING BREAKDOWN MODAL ═══ */}
      {showDriverRating && (
        <div className="modal-overlay" onClick={() => setShowDriverRating(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Driver Rating</h3>
              <button onClick={() => setShowDriverRating(false)} style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-faint)" }}>
                <X size={15} />
              </button>
            </div>

            {/* Driver summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "var(--primary-subtle)", borderRadius: "var(--r-lg)", border: "1px solid var(--primary-glow)", marginBottom: "18px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.2rem", color: "#fff", boxShadow: "var(--shadow-primary)" }}>MS</div>
              <div>
                <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-heading)" }}>Marcus Sterling</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px" }}>2,490 completed rides · 6 years on Glide</p>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="#F59E0B" stroke="#F59E0B" />)}
                  <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "#F59E0B", marginLeft: 4 }}>4.9</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>overall</span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <p className="section-header" style={{ marginBottom: "12px" }}>Rating Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {DRIVER_RATING_BREAKDOWN.map(({ label, score, icon }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "1.1rem", width: 22 }}>{icon}</span>
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-body)", flex: 1 }}>{label}</span>
                  <div style={{ width: 100, height: 6, background: "var(--card-border)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      width: `${(score / 5) * 100}%`,
                      height: "100%",
                      background: score === 5 ? "var(--success)" : "var(--primary)",
                      borderRadius: "99px",
                    }} />
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 900, color: score === 5 ? "var(--success)" : "var(--primary)", width: 28, textAlign: "right" }}>{score}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "18px", padding: "12px 14px", background: "var(--success-subtle)", border: "1px solid var(--success-glow)", borderRadius: "var(--r-md)", fontSize: "0.78rem", color: "var(--success)", fontWeight: 600, lineHeight: 1.55 }}>
              🏆 Marcus is in the <strong>Top 2%</strong> of Glide drivers in Uyo this month!
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHAT MODAL ═══ */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ maxHeight: "70vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "0.9rem", boxShadow: "var(--shadow-primary)" }}>MS</div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-heading)" }}>Marcus Sterling</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)", boxShadow: "0 0 5px var(--success)" }} />
                    <p style={{ fontSize: "0.68rem", color: "var(--success)", fontWeight: 700 }}>Online · Your driver</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-faint)" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px", minHeight: 0 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  <div className={`chat-bubble ${msg.from === "user" ? "mine" : "theirs"}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: "11px 14px", border: "1.5px solid var(--card-border-strong)", borderRadius: "var(--r-md)", fontSize: "0.86rem", fontFamily: "var(--font)", color: "var(--text-heading)", background: "var(--card-bg)", outline: "none", fontWeight: 500, transition: "border-color 0.2s" }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
              />
              <button onClick={sendMessage} className="btn btn-primary" style={{ padding: "11px 16px", width: "auto", borderRadius: "var(--r-md)" }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SOS MODAL ═══ */}
      {showSOS && (
        <div className="modal-overlay" onClick={() => setShowSOS(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", border: "2px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={36} style={{ color: "var(--danger)" }} />
            </div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Emergency Alert</h3>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", marginTop: "10px", lineHeight: 1.6, marginBottom: "24px", fontWeight: 500 }}>
              Your emergency contacts and the Glide Safety Team will be notified immediately with your GPS location.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => { alert("🚨 SOS Alert sent! Emergency contacts have been notified."); setShowSOS(false); }}
                style={{ padding: "16px", background: "var(--danger)", color: "#fff", border: "none", borderRadius: "var(--r-md)", fontSize: "1rem", fontWeight: 900, cursor: "pointer", fontFamily: "var(--font)", boxShadow: "0 6px 24px rgba(239,68,68,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}
              >
                🚨 Send SOS Alert Now
              </button>
              <button onClick={() => setShowSOS(false)} className="btn btn-secondary" style={{ padding: "13px" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Share Trip</h3>
              <button onClick={() => setShowShare(false)} style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-faint)" }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ padding: "12px 16px", background: "var(--card-bg)", borderRadius: "var(--r-md)", marginBottom: "14px", fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-muted)", wordBreak: "break-all", border: "1px solid var(--card-border)" }}>
              {shareUrl}
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.55, fontWeight: 500 }}>
              Share this link so your contacts can follow your trip in real-time.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleCopy}
                className="btn btn-primary"
                style={{ flex: 1, padding: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button onClick={() => setShowShare(false)} className="btn btn-secondary" style={{ flex: 1, padding: "13px" }}>WhatsApp</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
