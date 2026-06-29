"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Navigation2, Power, Star, DollarSign, Clock, TrendingUp,
  MapPin, Phone, MessageSquare, X, CheckCircle, ChevronRight,
  Zap, AlertTriangle, Shield,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, update } from "firebase/database";

interface IncomingRide {
  id: string;
  riderName: string;
  riderRating: number;
  pickup: string;
  dropoff: string;
  distanceKm: number;
  estimatedFare: number;
  category: string;
  rawPickup: { lat: number; lng: number };
  rawDropoff: { lat: number; lng: number };
}

const RECENT_TRIPS = [
  { time: "12:34 PM", route: "UNIUYO → City Mall", fare: 1600 },
  { time: "11:12 AM", route: "Stadium → Ibom Plaza", fare: 2200 },
  { time: "09:40 AM", route: "Airport → Ibom Hotel", fare: 5100 },
  { time: "08:05 AM", route: "Gov. House → Hospital", fare: 1800 },
];

interface DriverScreenProps {
  onExitDriverMode: () => void;
}

export default function DriverScreen({ onExitDriverMode }: DriverScreenProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [incomingRide, setIncomingRide] = useState<IncomingRide | null>(null);
  const [countdown, setCountdown] = useState(12);
  const [activeRide, setActiveRide] = useState<IncomingRide | null>(null);
  const [activeRideStatus, setActiveRideStatus] = useState<"pickup" | "dropoff" | "done">("pickup");
  const [todayEarnings, setTodayEarnings] = useState(10700);
  const [tripCount, setTripCount] = useState(4);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Listen for real-time ride requests from Firebase when online
  useEffect(() => {
    if (!isOnline || activeRide) {
      setIncomingRide(null);
      return;
    }

    const ridesRef = ref(db, "rides");
    const listener = onValue(ridesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Find first ride in "searching" status
      const pendingRide = Object.values(data).find(
        (r: any) => r.status === "searching"
      ) as any;

      if (pendingRide) {
        setIncomingRide({
          id: pendingRide.id,
          riderName: pendingRide.riderName || "Uyo Rider",
          riderRating: pendingRide.riderRating || 4.8,
          pickup: pendingRide.pickup?.name || "Pickup",
          dropoff: pendingRide.dropoff?.name || "Dropoff",
          distanceKm: pendingRide.distance || 4.2,
          estimatedFare: pendingRide.price || 1500,
          category: pendingRide.category || "Glide Ride",
          rawPickup: pendingRide.pickup,
          rawDropoff: pendingRide.dropoff,
        });
        setCountdown(15);
      } else {
        setIncomingRide(null);
      }
    });

    return () => off(ridesRef, "value", listener);
  }, [isOnline, activeRide]);

  // Countdown timer for incoming ride
  useEffect(() => {
    if (!incomingRide) return;
    if (countdown <= 0) {
      setIncomingRide(null);
      return;
    }
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [incomingRide, countdown]);

  // Update real-time driver coordinates to Firebase during active trip
  useEffect(() => {
    if (!activeRide) return;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) {
        clearInterval(interval);
        return;
      }
      
      const startLat = activeRideStatus === "pickup" 
        ? activeRide.rawPickup.lat + 0.004 
        : activeRide.rawPickup.lat;
      const startLng = activeRideStatus === "pickup" 
        ? activeRide.rawPickup.lng + 0.004 
        : activeRide.rawPickup.lng;
        
      const targetLat = activeRideStatus === "pickup"
        ? activeRide.rawPickup.lat
        : activeRide.rawDropoff.lat;
      const targetLng = activeRideStatus === "pickup"
        ? activeRide.rawPickup.lng
        : activeRide.rawDropoff.lng;

      const lat = startLat + (targetLat - startLat) * (progress / 100);
      const lng = startLng + (targetLng - startLng) * (progress / 100);

      update(ref(db, `rides/${activeRide.id}`), {
        driverLat: lat,
        driverLng: lng,
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeRide, activeRideStatus]);

  const handleAccept = useCallback(() => {
    if (!incomingRide) return;
    
    // Update state locally
    setActiveRide(incomingRide);
    setActiveRideStatus("pickup");
    setIncomingRide(null);

    // Update ride in Firebase
    update(ref(db, `rides/${incomingRide.id}`), {
      status: "arriving",
      driverName: "Marcus Sterling",
      driverPlate: "GLIDE-001",
      driverPhone: "+234 802 345 6789",
      driverLat: incomingRide.rawPickup.lat + 0.004,
      driverLng: incomingRide.rawPickup.lng + 0.004,
    });
  }, [incomingRide]);

  const handleDecline = useCallback(() => {
    setIncomingRide(null);
  }, []);

  const handleCompletePickup = () => {
    setActiveRideStatus("dropoff");
    if (activeRide) {
      update(ref(db, `rides/${activeRide.id}`), {
        status: "inprogress",
      });
    }
  };

  const handleCompleteRide = () => {
    if (!activeRide) return;
    
    setTodayEarnings(prev => prev + activeRide.estimatedFare);
    setTripCount(prev => prev + 1);

    update(ref(db, `rides/${activeRide.id}`), {
      status: "completed",
    });

    setActiveRide(null);
    setActiveRideStatus("pickup");
  };

  const onlineHours = 3.2;
  const weekEarnings = 68400;

  return (
    <div className="full-screen animate-screen-in" style={{ background: "var(--bg-surface)", overflow: "hidden" }}>

      {/* Header */}
      <div className="page-header" style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg, #00c896, #00a070)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,200,150,0.4)" }}>
              <Navigation2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Driver Mode</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Marcus Sterling · GLIDE-001</div>
            </div>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            style={{ padding: "7px 14px", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", borderRadius: "var(--r-full)", fontSize: "0.72rem", fontWeight: 800, color: "var(--primary)", cursor: "pointer", fontFamily: "var(--font)" }}
          >
            ← Rider Mode
          </button>
        </div>
      </div>

      <div className="full-screen-scroll safe-bottom" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Online/Offline Toggle */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px",
            background: isOnline
              ? "linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,160,112,0.08))"
              : "var(--bg-elevated)",
            borderRadius: "var(--r-xl)",
            border: `1.5px solid ${isOnline ? "rgba(0,200,150,0.35)" : "var(--border)"}`,
            transition: "all 0.35s var(--ease)",
          }}
        >
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 900, color: isOnline ? "#00c896" : "var(--text-2)", fontFamily: "var(--font-display)" }}>
              {isOnline ? "🟢 You're Online" : "⚪ You're Offline"}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 500 }}>
              {isOnline ? "Accepting ride requests in Uyo" : "Go online to start earning"}
            </div>
          </div>
          <button
            onClick={() => {
              setIsOnline(o => !o);
              if (isOnline) setIncomingRide(null);
            }}
            style={{
              width: 58, height: 32, borderRadius: "999px",
              background: isOnline ? "#00c896" : "var(--border)",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s",
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 4, left: isOnline ? 30 : 4,
              transition: "left 0.3s var(--ease-spring)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }} />
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { label: "Today's Earnings", value: `₦${todayEarnings.toLocaleString()}`, icon: <DollarSign size={16} />, color: "#00c896", sub: `${tripCount} trips` },
            { label: "This Week", value: `₦${weekEarnings.toLocaleString()}`, icon: <TrendingUp size={16} />, color: "var(--primary)", sub: "+12% vs last week" },
            { label: "Online Time", value: `${onlineHours}h`, icon: <Clock size={16} />, color: "var(--cyan)", sub: "Today" },
            { label: "My Rating", value: "4.92", icon: <Star size={16} />, color: "var(--amber)", sub: "2,490 trips total" },
          ].map(stat => (
            <div key={stat.label} className="glass-card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                <div style={{ color: stat.color, opacity: 0.85 }}>{stat.icon}</div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{stat.value}</div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 500 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Active Ride */}
        {activeRide && (
          <div style={{ animation: "slide-up 0.4s var(--ease) both" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "#00c896", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c896", boxShadow: "0 0 8px #00c896", animation: "pulse-ring 1.5s infinite" }} />
              Active Ride
            </div>
            <div className="glass-card" style={{ padding: "18px", border: "1.5px solid rgba(0,200,150,0.3)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--cyan), #0099cc)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1rem", color: "#fff" }}>
                  {activeRide.riderName.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.96rem", fontWeight: 800, color: "var(--text-1)" }}>{activeRide.riderName}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <Star size={10} fill="var(--amber)" stroke="var(--amber)" />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--amber)" }}>{activeRide.riderRating}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-3)" }}>· {activeRide.category}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#00c896" }}>₦{activeRide.estimatedFare.toLocaleString()}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-3)", fontWeight: 500 }}>{activeRide.distanceKm} km</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "12px", background: "var(--bg-surface)", borderRadius: "var(--r-md)", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-1)" }}>{activeRide.pickup}</span>
                </div>
                <div style={{ width: 1, height: 12, background: "var(--border-med)", marginLeft: "3.5px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-1)" }}>{activeRide.dropoff}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                {[{ icon: <Phone size={14} />, label: "Call" }, { icon: <MessageSquare size={14} />, label: "Chat" }, { icon: <MapPin size={14} />, label: "Navigate" }].map(a => (
                  <button key={a.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "10px 6px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", cursor: "pointer", fontFamily: "var(--font)", color: "var(--text-2)", fontSize: "0.68rem", fontWeight: 700, transition: "all 0.2s" }}>
                    {a.icon}
                    {a.label}
                  </button>
                ))}
              </div>

              {activeRideStatus === "pickup" ? (
                <button onClick={handleCompletePickup} className="btn btn-primary" style={{ background: "linear-gradient(135deg, #00c896, #00a070)", boxShadow: "0 4px 20px rgba(0,200,150,0.35)" }}>
                  <CheckCircle size={16} />
                  Rider Picked Up
                </button>
              ) : (
                <button onClick={handleCompleteRide} className="btn btn-primary" style={{ background: "linear-gradient(135deg, #00c896, #00a070)", boxShadow: "0 4px 20px rgba(0,200,150,0.35)" }}>
                  <CheckCircle size={16} />
                  Complete Ride · ₦{activeRide.estimatedFare.toLocaleString()}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Idle online state */}
        {isOnline && !incomingRide && !activeRide && (
          <div style={{ textAlign: "center", padding: "28px 20px", animation: "fade-in 0.5s var(--ease) both" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,200,150,0.12)", border: "2px solid #00c896", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", animation: "pulse-ring 2.5s infinite" }}>
              <Zap size={26} color="#00c896" />
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Waiting for rides...</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "6px", fontWeight: 500 }}>A new request will appear any moment</div>
          </div>
        )}

        {/* Offline state */}
        {!isOnline && !activeRide && (
          <div style={{ textAlign: "center", padding: "24px 20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--border-med)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px auto" }}>
              <Power size={24} style={{ color: "var(--text-4)" }} />
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-2)", fontFamily: "var(--font-display)" }}>You're offline</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-4)", marginTop: "5px", fontWeight: 500 }}>Toggle online above to receive rides</div>
          </div>
        )}

        {/* Recent Trips */}
        <div>
          <div className="section-label" style={{ marginBottom: "12px" }}>
            <Clock size={10} style={{ color: "var(--text-3)" }} />
            Today's Trips
          </div>
          <div className="glass-card" style={{ overflow: "hidden", padding: 0 }}>
            {RECENT_TRIPS.map((trip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < RECENT_TRIPS.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--text-1)" }}>{trip.route}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "2px", fontWeight: 500 }}>{trip.time}</div>
                </div>
                <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#00c896" }}>+₦{trip.fare.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "var(--primary-dim)", borderRadius: "var(--r-lg)", border: "1px solid var(--primary-glow)" }}>
          <Shield size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-1)" }}>Safety Features Active</div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 500, marginTop: "2px" }}>Trip recording, SOS, and live tracking enabled</div>
          </div>
        </div>
      </div>

      {/* ═══ INCOMING RIDE MODAL ═══ */}
      {incomingRide && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
          <div style={{ width: "100%", background: "var(--bg-surface)", borderRadius: "24px 24px 0 0", padding: "24px 20px 32px 20px", animation: "slide-up 0.4s var(--ease-spring) both", border: "1px solid var(--border-med)", borderBottom: "none" }}>
            <div style={{ width: 40, height: 4, borderRadius: "99px", background: "var(--border-strong)", margin: "0 auto 20px auto" }} />

            {/* Countdown Ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle
                    cx="36" cy="36" r="30" fill="none"
                    stroke="#00c896" strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - countdown / 12)}`}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 900, color: countdown <= 4 ? "var(--red)" : "var(--text-1)", fontFamily: "var(--font-display)" }}>
                  {countdown}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "18px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#00c896", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>New Ride Request</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>{incomingRide.riderName}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginTop: "4px" }}>
                <Star size={12} fill="var(--amber)" stroke="var(--amber)" />
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--amber)" }}>{incomingRide.riderRating}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>· {incomingRide.category}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px 16px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>{incomingRide.pickup}</span>
              </div>
              <div style={{ width: 1, height: 10, background: "var(--border-med)", marginLeft: 3.5 }} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-1)" }}>{incomingRide.dropoff}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 500 }}>{incomingRide.distanceKm} km · ~{Math.ceil(incomingRide.distanceKm / 2)} min</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 900, color: "#00c896" }}>₦{incomingRide.estimatedFare.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleDecline} style={{ flex: 1, padding: "15px", border: "1.5px solid var(--border-med)", borderRadius: "var(--r-xl)", background: "transparent", fontFamily: "var(--font)", fontWeight: 800, color: "var(--text-2)", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <X size={16} /> Decline
              </button>
              <button onClick={handleAccept} style={{ flex: 2, padding: "15px", border: "none", borderRadius: "var(--r-xl)", background: "linear-gradient(135deg, #00c896, #00a070)", fontFamily: "var(--font)", fontWeight: 900, color: "#fff", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 6px 24px rgba(0,200,150,0.45)" }}>
                <CheckCircle size={16} /> Accept Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EXIT CONFIRM ═══ */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: "8px 0 0 0", textAlign: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <AlertTriangle size={22} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>Exit Driver Mode?</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-3)", lineHeight: 1.6, marginBottom: "20px" }}>You'll switch back to the Glide rider app. Any active ride will be ended.</p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowExitConfirm(false)} className="btn btn-secondary" style={{ flex: 1 }}>Stay</button>
                <button onClick={onExitDriverMode} className="btn btn-primary" style={{ flex: 1 }}>Exit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
