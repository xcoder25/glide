"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MessageSquare, Phone, Shield, Star, ChevronDown, ChevronUp, Send,
  X, Share2, AlertTriangle, Copy, Check, ArrowRight, Navigation2,
  Sliders, Clock
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, push, set, onValue, off } from "firebase/database";

export type RideStatus = "searching" | "arriving" | "arrived" | "inprogress" | "completed";

interface ActiveRideProps {
  categoryName: string;
  price: number;
  pickupName: string;
  dropoffName: string;
  status: RideStatus;
  onStatusChange: (status: RideStatus) => void;
  onCancel: () => void;
  currentRideId?: string | null;
}

const CANCEL_REASONS = [
  "Changed my mind",
  "Driver is taking too long",
  "Found another ride",
  "Wrong pickup location",
  "Emergency came up",
  "Other reason",
];

const DRIVER_BREAKDOWN = [
  { label: "Friendliness", score: 4.9, icon: "😊" },
  { label: "Punctuality",  score: 4.8, icon: "⏱️" },
  { label: "Safety",       score: 5.0, icon: "🛡️" },
  { label: "Cleanliness",  score: 4.7, icon: "✨" },
];

function RouteProgressWidget({
  status, progress, pickupName, dropoffName, etaDisplay
}: {
  status: RideStatus;
  progress: number;
  pickupName: string;
  dropoffName: string;
  etaDisplay: string | null;
}) {
  const [arrivingProgress, setArrivingProgress] = useState(0);

  useEffect(() => {
    if (status !== "arriving") {
      setArrivingProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setArrivingProgress(p => {
        if (p >= 100) return 0; // loop
        return p + 2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [status]);

  let carX = 40;
  let carY = 60;
  let activeSegment: 1 | 2 | null = null;
  let t = 0;

  if (status === "searching") {
    carX = 40;
    carY = 60;
  } else if (status === "arriving") {
    activeSegment = 1;
    t = arrivingProgress / 100;
    carX = (1 - t) ** 2 * 40 + 2 * (1 - t) * t * 100 + t ** 2 * 160;
    carY = (1 - t) ** 2 * 60 + 2 * (1 - t) * t * 20 + t ** 2 * 60;
  } else if (status === "arrived") {
    carX = 160;
    carY = 60;
  } else if (status === "inprogress") {
    activeSegment = 2;
    t = progress / 100;
    carX = (1 - t) ** 2 * 160 + 2 * (1 - t) * t * 220 + t ** 2 * 280;
    carY = (1 - t) ** 2 * 60 + 2 * (1 - t) * t * 100 + t ** 2 * 60;
  } else if (status === "completed") {
    carX = 280;
    carY = 60;
  }

  return (
    <div className="glass-card" style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "16px", background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)", position: "relative", overflow: "hidden" }}>
      {status === "searching" && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: "40px", top: "60px", width: "100px", height: "100px", transform: "translate(-50%, -50%)", border: "2px solid var(--primary)", borderRadius: "50%", animation: "pulse-ring 2s infinite" }} />
          <div style={{ position: "absolute", left: "40px", top: "60px", width: "200px", height: "200px", transform: "translate(-50%, -50%)", border: "1px solid var(--primary-glow)", borderRadius: "50%", animation: "pulse-ring 2s infinite", animationDelay: "0.6s" }} />
        </div>
      )}

      <svg viewBox="0 0 320 120" style={{ width: "100%", height: "auto" }}>
        <defs>
          <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M 40 60 Q 100 20, 160 60"
          fill="none"
          stroke="var(--cyan)"
          strokeWidth="3.5"
          strokeDasharray={status === "arriving" ? "5,5" : "none"}
          opacity={status === "searching" || status === "arriving" ? 0.8 : 0.3}
          style={{
            animation: status === "arriving" ? "dash 1.5s linear infinite" : "none",
          }}
        />

        <path
          d="M 160 60 Q 220 100, 280 60"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="4.5"
          strokeDasharray={status === "inprogress" ? "6,6" : "none"}
          opacity={status === "inprogress" ? 0.9 : 0.3}
          style={{
            animation: status === "inprogress" ? "dash 1.5s linear infinite" : "none",
          }}
        />

        <circle cx="40" cy="60" r="5" fill="var(--text-3)" />

        <circle cx="160" cy="60" r="12" fill={status === "arrived" || status === "inprogress" ? "var(--cyan-dim)" : "transparent"} stroke="var(--cyan)" strokeWidth="1.5" />
        <circle cx="160" cy="60" r="5" fill="var(--cyan)" filter="url(#glow-cyan)" />

        <circle cx="280" cy="60" r="14" fill={status === "completed" ? "var(--green-dim)" : "transparent"} stroke={status === "completed" ? "var(--green)" : "var(--primary)"} strokeWidth="1.5" />
        <circle cx="280" cy="60" r="5" fill={status === "completed" ? "var(--green)" : "var(--primary)"} filter={status === "completed" ? "none" : "url(#glow-orange)"} />

        <g transform={`translate(${carX}, ${carY})`} style={{ transition: status === "arriving" ? "none" : "transform 0.3s ease-out" }}>
          <circle cx="0" cy="0" r="13" fill="var(--bg-elevated)" stroke={activeSegment === 1 ? "var(--cyan)" : "var(--primary)"} strokeWidth="2.5" filter={activeSegment === 1 ? "url(#glow-cyan)" : "url(#glow-orange)"} style={{ transformOrigin: "center", animation: status === "completed" ? "none" : "pulse-scale 1.8s infinite ease-in-out" }} />
          <text x="0" y="4" textAnchor="middle" style={{ fontSize: "11px", pointerEvents: "none" }}>
            {status === "completed" ? "✅" : "🚗"}
          </text>
        </g>
      </svg>

      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)" }} />
            <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pickup (A)</p>
          </div>
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-1)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pickupName}</p>
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Destination (B)</p>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
          </div>
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-1)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dropoffName}</p>
        </div>
      </div>

      <div style={{
        marginTop: "4px",
        padding: "10px 12px",
        background: "var(--bg-surface)",
        borderRadius: "var(--r-md)",
        border: "1px solid var(--border)",
        textAlign: "center",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: status === "completed" ? "var(--green)" : status === "arrived" ? "var(--cyan)" : "var(--text-2)",
      }}>
        {status === "searching" && "Matching you with the nearest drivers..."}
        {status === "arriving" && `Driver is arriving at pickup location ${etaDisplay ? `(${etaDisplay})` : ""}`}
        {status === "arrived" && "Marcus is waiting for you at the pickup location!"}
        {status === "inprogress" && `En route to your destination ${etaDisplay ? `· ETA: ${etaDisplay}` : ""}`}
        {status === "completed" && "You have safely arrived at your destination!"}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}} />
    </div>
  );
}

export default function ActiveRide({
  categoryName, price, pickupName, dropoffName, status, onStatusChange, onCancel, currentRideId
}: ActiveRideProps) {
  const [eta, setEta] = useState(3);
  const [seconds, setSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDemoControls, setShowDemoControls] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDriverRating, setShowDriverRating] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { from: "driver", text: "Hello! I'm on my way to your pickup location." },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const shareUrl = useMemo(() => `https://glide.ng/track/${Math.random().toString(36).slice(2, 8).toUpperCase()}`, []);

  // Sync chat messages in real time from Firebase
  useEffect(() => {
    if (!currentRideId) return;

    const messagesRef = ref(db, `rides/${currentRideId}/messages`);
    const listener = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data).sort((a: any, b: any) => a.timestamp - b.timestamp);
        setMessages(list as any);
      }
    });

    return () => off(messagesRef, "value", listener);
  }, [currentRideId]);

  useEffect(() => {
    if (status === "searching" || status === "completed") return;
    const tick = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { setEta(e => Math.max(0, e - 1)); return 59; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (status === "arriving")   { setEta(3); setProgress(0); setSeconds(0); t = setTimeout(() => onStatusChange("arrived"), 10000); }
    if (status === "arrived")    { setEta(0); setProgress(0); setSeconds(0); t = setTimeout(() => onStatusChange("inprogress"), 5000); }
    if (status === "inprogress") {
      setEta(8); setProgress(0); setSeconds(0);
      const i = setInterval(() => setProgress(p => p >= 100 ? 100 : p + 6.66), 1000);
      return () => clearInterval(i);
    }
    if (status === "completed")  { setProgress(100); setEta(0); setSeconds(0); }
    return () => clearTimeout(t);
  }, [status, onStatusChange]);

  useEffect(() => {
    if (status === "inprogress" && progress >= 100) onStatusChange("completed");
  }, [progress, status, onStatusChange]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput("");

    if (currentRideId) {
      const messagesRef = ref(db, `rides/${currentRideId}/messages`);
      const newMsgRef = push(messagesRef);
      set(newMsgRef, {
        from: "user",
        text,
        timestamp: Date.now(),
      });

      // Simulation auto-reply from mock driver in database
      // Only triggered if driverName === Marcus Sterling (simulation driver)
      setTimeout(() => {
        const responses = ["Got it, be there shortly!", "On my way 👍", "I can see you on the map.", "2 minutes away!"];
        const replyRef = push(messagesRef);
        set(replyRef, {
          from: "driver",
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now(),
        });
      }, 1800);
    } else {
      setMessages(prev => [...prev, { from: "user", text }]);
      setTimeout(() => {
        const r = ["Got it, be there shortly!", "On my way 👍", "I can see you on the map.", "2 minutes away!"];
        setMessages(prev => [...prev, { from: "driver", text: r[Math.floor(Math.random() * r.length)] }]);
      }, 1500);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [shareUrl]);

  const etaDisplay = status !== "completed" && status !== "arrived" && eta > 0
    ? `${eta}m ${String(seconds).padStart(2, "0")}s` : null;

  const statusLabel = {
    searching: { label: "Finding Driver", color: "var(--cyan)", emoji: "🔍" },
    arriving:  { label: "Driver Arriving", color: "var(--primary)", emoji: "🚗" },
    arrived:   { label: "Driver Here!", color: "var(--green)", emoji: "📍" },
    inprogress:{ label: "On the Way", color: "var(--cyan)", emoji: "🚀" },
    completed: { label: "Arrived!", color: "var(--green)", emoji: "🎉" },
  }[status];

  return (
    <div className="full-screen animate-screen-in">

      {/* Header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", padding: "18px 20px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <h2 className="page-title">Live Trip</h2>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px",
            background: "var(--bg-elevated)",
            borderRadius: "var(--r-full)",
            border: "1px solid var(--border-med)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <span style={{ fontSize: "1rem" }}>{statusLabel.emoji}</span>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: statusLabel.color, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {statusLabel.label}
            </span>
          </div>
        </div>
      </div>

      <div className="full-screen-scroll safe-bottom">
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Route Progress Widget */}
          <RouteProgressWidget status={status} progress={progress} pickupName={pickupName} dropoffName={dropoffName} etaDisplay={etaDisplay} />

          {/* Driver Row */}
          {status !== "searching" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  {status === "arriving" && (
                    <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "2px solid var(--primary)", animation: "pulse-ring 1.5s infinite", pointerEvents: "none" }} />
                  )}
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", color: "#fff", boxShadow: "var(--shadow-primary)" }}>
                    MS
                  </div>
                  <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg-surface)", boxShadow: "0 0 6px var(--green)" }} />
                </div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)" }}>Marcus Sterling</div>
                  <button
                    onClick={() => setShowDriverRating(true)}
                    style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font)" }}
                  >
                    <Star size={11} fill="var(--amber)" stroke="var(--amber)" />
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--amber)" }}>4.9</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)", fontWeight: 500 }}>· 2,490 trips → details</span>
                  </button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-2)" }}>Toyota Corolla</div>
                <div style={{ marginTop: "3px", background: "var(--primary-dim)", color: "var(--primary)", fontSize: "0.66rem", fontWeight: 800, padding: "3px 10px", borderRadius: "99px", border: "1px solid var(--primary-glow)", letterSpacing: "0.04em" }}>
                  GLIDE-001
                </div>
              </div>
            </div>
          )}

          {/* Searching state */}
          {status === "searching" && (
            <div style={{ textAlign: "center", padding: "20px 0 12px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto", border: "2px solid var(--primary)", animation: "heartbeat 2s infinite" }}>
                <Navigation2 size={24} style={{ color: "var(--primary)" }} />
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)" }}>Searching for your driver</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "5px", fontWeight: 500 }}>Connecting with Glide operators nearby...</div>
            </div>
          )}

          {/* Action buttons */}
          {status !== "completed" && status !== "searching" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              {[
                { label: "Message", icon: <MessageSquare size={16} />, action: () => setShowChat(true) },
                { label: "Call", icon: <Phone size={16} />, action: () => {} },
                { label: "Share", icon: <Share2 size={16} />, action: () => setShowShare(true) },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
                    padding: "12px 8px",
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)", cursor: "pointer", fontFamily: "var(--font)",
                    color: "var(--text-2)", fontSize: "0.72rem", fontWeight: 700,
                    transition: "all 0.2s var(--ease)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-dim)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* SOS Row */}
          {status !== "completed" && status !== "searching" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--red-dim)", borderRadius: "var(--r-lg)", marginBottom: "12px", border: "1px solid rgba(255,77,106,0.15)" }}>
              <span style={{ fontSize: "0.76rem", color: "var(--text-2)", fontWeight: 500 }}>Emergency? Alert contacts instantly</span>
              <button className="sos-btn">SOS</button>
            </div>
          )}

          {/* Demo Controls */}
          <button
            onClick={() => setShowDemoControls(!showDemoControls)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", borderRadius: "var(--r-md)", fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", width: "100%", justifyContent: "center", marginBottom: "12px", transition: "all 0.2s" }}
          >
            <Sliders size={12} /> Demo Controls {showDemoControls ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showDemoControls && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", animation: "slide-up 0.2s var(--ease)" }}>
              {(["arriving","arrived","inprogress","completed"] as RideStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  style={{ padding: "8px 14px", borderRadius: "var(--r-md)", border: `1.5px solid ${status === s ? "var(--primary)" : "var(--border-med)"}`, background: status === s ? "var(--primary-dim)" : "transparent", color: status === s ? "var(--primary)" : "var(--text-2)", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", textTransform: "capitalize", transition: "all 0.2s" }}
                >
                  {s === "inprogress" ? "In Trip" : s}
                </button>
              ))}
            </div>
          )}

          {/* Completed Receipt */}
          {status === "completed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slide-up 0.5s var(--ease) both", paddingBottom: "8px" }}>
              <div style={{ textAlign: "center", padding: "20px", background: "var(--green-dim)", borderRadius: "var(--r-xl)", border: "1px solid rgba(0,217,126,0.2)" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>You've arrived!</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-3)", marginTop: "4px", fontWeight: 500 }}>Safe journey to {dropoffName}</div>
              </div>

              <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", overflow: "hidden" }}>
                {[
                  { label: "Route", value: `${pickupName} → ${dropoffName}` },
                  { label: "Vehicle", value: categoryName },
                  { label: "Payment", value: "Glide Wallet" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-3)", fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-1)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-1)" }}>Total Paid</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em" }}>₦{price.toLocaleString()}</span>
                </div>
              </div>

              <button onClick={onCancel} className="btn btn-primary" style={{ borderRadius: "var(--r-xl)", fontSize: "1rem", gap: "10px" }}>
                <Star size={18} /> Rate Your Ride
              </button>
            </div>
          )}

          {/* Cancel */}
          {status !== "completed" && (
            <button
              onClick={() => setShowCancelModal(true)}
              style={{ width: "100%", padding: "14px", border: "1.5px solid rgba(255,77,106,0.2)", color: "var(--red)", background: "transparent", borderRadius: "var(--r-lg)", fontFamily: "var(--font)", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s", marginBottom: "8px" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--red-dim)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Cancel Ride
            </button>
          )}
        </div>
      </div>

      {/* ═══ CANCEL MODAL ═══ */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: "8px 0 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Why are you cancelling?</h3>
                <button onClick={() => setShowCancelModal(false)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
                {CANCEL_REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    style={{ padding: "13px 16px", border: `1.5px solid ${cancelReason === reason ? "var(--red)" : "var(--border)"}`, borderRadius: "var(--r-lg)", background: cancelReason === reason ? "var(--red-dim)" : "var(--bg-elevated)", color: cancelReason === reason ? "var(--red)" : "var(--text-1)", fontSize: "0.88rem", fontWeight: cancelReason === reason ? 800 : 600, cursor: "pointer", fontFamily: "var(--font)", textAlign: "left", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${cancelReason === reason ? "var(--red)" : "var(--border-strong)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {cancelReason === reason && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />}
                    </div>
                    {reason}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowCancelModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: "13px" }}>Keep Ride</button>
                <button
                  onClick={() => { setShowCancelModal(false); onCancel(); }}
                  disabled={!cancelReason}
                  style={{ flex: 1, padding: "13px", background: cancelReason ? "var(--red)" : "var(--border)", color: cancelReason ? "#fff" : "var(--text-3)", border: "none", borderRadius: "var(--r-md)", fontFamily: "var(--font)", fontWeight: 800, fontSize: "0.9rem", cursor: cancelReason ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: cancelReason ? "0 4px 20px rgba(255,77,106,0.35)" : "none" }}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DRIVER RATING MODAL ═══ */}
      {showDriverRating && (
        <div className="modal-overlay" onClick={() => setShowDriverRating(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: "8px 0 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Driver Rating</h3>
                <button onClick={() => setShowDriverRating(false)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", background: "var(--primary-dim)", borderRadius: "var(--r-xl)", border: "1px solid var(--primary-glow)", marginBottom: "20px" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", color: "#fff", boxShadow: "var(--shadow-primary)" }}>MS</div>
                <div>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)" }}>Marcus Sterling</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px" }}>2,490 trips · 6 years on Glide</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--amber)" stroke="var(--amber)" />)}
                    <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--amber)", marginLeft: 4 }}>4.9</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
                {DRIVER_BREAKDOWN.map(({ label, score, icon }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "1rem", width: 22 }}>{icon}</span>
                    <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-2)", flex: 1 }}>{label}</span>
                    <div style={{ width: 90, height: 5, background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ width: `${(score/5)*100}%`, height: "100%", background: score >= 5 ? "var(--green)" : "var(--primary)", borderRadius: "99px" }} />
                    </div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: score >= 5 ? "var(--green)" : "var(--primary)", width: 28, textAlign: "right" }}>{score}</span>
                  </div>
                ))}
              </div>

              <div style={{ padding: "12px 14px", background: "var(--green-dim)", borderRadius: "var(--r-lg)", border: "1px solid rgba(0,217,126,0.2)", fontSize: "0.8rem", color: "var(--green)", fontWeight: 600 }}>
                🏆 Top 2% of Glide drivers in Uyo this month!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHAT MODAL ═══ */}
      {showChat && (
        <div className="modal-overlay" onClick={() => setShowChat(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ maxHeight: "72vh", display: "flex", flexDirection: "column" }}>
            <div className="sheet-handle" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0 16px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "0.9rem" }}>MS</div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-1)" }}>Marcus Sterling</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--green)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 5px var(--green)" }} />
                    Online · Your driver
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", minHeight: 0, paddingBottom: "12px" }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.from === "user" ? "flex-end" : "flex-start" }}>
                  <div className={`chat-bubble ${msg.from === "user" ? "mine" : "theirs"}`}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Message your driver..."
                style={{ flex: 1, padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--r-xl)", fontSize: "0.88rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <button onClick={sendMessage} className="btn btn-primary" style={{ width: 46, padding: "0", borderRadius: "var(--r-full)", flexShrink: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SHARE MODAL ═══ */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: "8px 0 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Share Live Trip</h3>
                <button onClick={() => setShowShare(false)} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ padding: "12px 16px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--text-3)", wordBreak: "break-all", border: "1px solid var(--border)", marginBottom: "12px" }}>{shareUrl}</div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: "16px", lineHeight: 1.6 }}>
                Share this link so contacts can track your trip in real time.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleCopy} className="btn btn-primary" style={{ flex: 1, padding: "13px", borderRadius: "var(--r-xl)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button onClick={() => setShowShare(false)} className="btn btn-secondary" style={{ flex: 1, padding: "13px", borderRadius: "var(--r-xl)" }}>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
