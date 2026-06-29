"use client";

import React, { useState, useMemo } from "react";
import { Clock, Star, ArrowUpRight, ChevronDown, ChevronUp, RotateCcw, XCircle, Receipt, TrendingUp, Search, X, Printer } from "lucide-react";
import type { LocationData } from "./booking-form";

export interface RideRecord {
  id: string;
  date: string;
  pickup: string;
  dropoff: string;
  pickupData?: LocationData;
  dropoffData?: LocationData;
  fare: number;
  distance: number;
  category: string;
  driverName: string;
  rating?: number;
  status: "completed" | "cancelled";
  cancelReason?: string;
}

interface RideHistoryScreenProps {
  history: RideRecord[];
  onRebook: (pickup: LocationData, dropoff: LocationData) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? "var(--amber)" : "transparent"}
          stroke={i <= rating ? "var(--amber)" : "var(--text-4)"}
        />
      ))}
    </div>
  );
}

const MONTHLY_SPEND = [
  { month: "Feb", amount: 8200 },
  { month: "Mar", amount: 14500 },
  { month: "Apr", amount: 11000 },
  { month: "May", amount: 18700 },
  { month: "Jun", amount: 6300 },
];

function SpendChart() {
  const max = Math.max(...MONTHLY_SPEND.map(m => m.amount));
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: 60, padding: "0 4px" }}>
        {MONTHLY_SPEND.map((m, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-3)" }}>
              ₦{(m.amount / 1000).toFixed(0)}k
            </span>
            <div
              style={{
                width: "100%",
                height: `${(m.amount / max) * 44}px`,
                background: i === MONTHLY_SPEND.length - 1
                  ? "var(--primary)"
                  : "var(--border-strong)",
                borderRadius: "4px 4px 0 0",
                minHeight: 4,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px", padding: "6px 4px 0 4px" }}>
        {MONTHLY_SPEND.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", fontWeight: 800, color: i === MONTHLY_SPEND.length - 1 ? "var(--primary)" : "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {m.month}
          </div>
        ))}
      </div>
    </div>
  );
}

function RideCard({ ride, onRebook }: { ride: RideRecord; onRebook?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = ride.status === "completed";

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Glide Receipt — ${ride.date}</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;max-width:500px;margin:0 auto;background:#070b14;color:#f0f4ff;}
      h1{font-size:1.4rem;font-weight:900;color:#ff6b1a;}
      .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
      .label{color:#8899b4;font-size:0.88rem;}
      .value{font-weight:700;font-size:0.88rem;}
      .total{font-size:1.25rem;font-weight:950;color:#ff6b1a;}
      </style></head><body>
      <h1>🚖 Glide Ride Receipt</h1>
      <p style="color:#8899b4;font-size:0.85rem;margin-bottom:16px;">${ride.date}</p>
      <div class="row"><span class="label">Pickup</span><span class="value">${ride.pickup}</span></div>
      <div class="row"><span class="label">Drop-off</span><span class="value">${ride.dropoff}</span></div>
      <div class="row"><span class="label">Driver</span><span class="value">${ride.driverName}</span></div>
      <div class="row"><span class="label">Vehicle</span><span class="value">${ride.category}</span></div>
      <div class="row"><span class="label">Distance</span><span class="value">${ride.distance} km</span></div>
      <div class="row" style="border:none;padding-top:14px;"><span style="font-size:1rem;font-weight:800;">Total Paid</span><span class="total">₦${ride.fare.toLocaleString()}</span></div>
      <p style="color:#4a5f7a;font-size:0.75rem;margin-top:24px;">Thank you for riding with Glide Uyo.</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="glass-card">
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px 14px",
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "var(--font)",
          textAlign: "left",
        }}
      >
        <div style={{
          width: 40, height: 40,
          borderRadius: "10px",
          background: isCompleted ? "var(--green-dim)" : "var(--red-dim)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${isCompleted ? "var(--green-glow)" : "rgba(255,77,106,0.15)"}`,
        }}>
          {isCompleted
            ? <Receipt size={16} style={{ color: "var(--green)" }} />
            : <XCircle size={16} style={{ color: "var(--red)" }} />
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "45%" }}>{ride.pickup}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>→</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "45%" }}>{ride.dropoff}</span>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px", display: "flex", gap: "6px", alignItems: "center" }}>
            <span>{ride.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-4)" }} />
            <span style={{ color: isCompleted ? "var(--green)" : "var(--red)", fontWeight: 800 }}>
              {ride.category}
            </span>
          </div>
          {isCompleted && ride.rating && (
            <div style={{ marginTop: "4px" }}>
              <StarRating rating={ride.rating} />
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 900, color: isCompleted ? "var(--text-1)" : "var(--red)" }}>
            {isCompleted ? `₦${ride.fare.toLocaleString()}` : "Cancelled"}
          </div>
          <div style={{ marginTop: "4px", color: "var(--text-3)", display: "flex", justifyContent: "flex-end" }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="animate-slide-up" style={{ borderTop: "1px solid var(--border)", padding: "14px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--bg-elevated)" }}>
          {isCompleted ? (
            <>
              <p className="section-header" style={{ marginBottom: "2px" }}>Fare Details</p>
              {[
                { label: "Base fare",              value: `₦${(ride.fare * 0.4).toFixed(0)}` },
                { label: `Distance (${ride.distance} km)`, value: `₦${(ride.fare * 0.55).toFixed(0)}` },
                { label: "Service fee",            value: `₦${(ride.fare * 0.05).toFixed(0)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "var(--text-3)", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: "var(--text-2)", fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-1)" }}>Total Paid</span>
                <span style={{ fontSize: "0.92rem", fontWeight: 900, color: "var(--primary)" }}>₦{ride.fare.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 500 }}>Driver: <strong style={{ color: "var(--text-1)", fontWeight: 700 }}>{ride.driverName}</strong></p>
            </>
          ) : (
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 500 }}>
              <strong style={{ color: "var(--text-1)" }}>Reason:</strong> {ride.cancelReason || "User cancelled"}
            </p>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {ride.pickupData && ride.dropoffData && (
              <button
                onClick={onRebook}
                className="btn btn-primary"
                style={{ flex: 1, padding: "10px", fontSize: "0.78rem", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <RotateCcw size={13} /> Rebook
              </button>
            )}
            {isCompleted && (
              <button
                onClick={handlePrint}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "10px", fontSize: "0.78rem", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Printer size={13} /> Receipt
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RideHistoryScreen({ history, onRebook }: RideHistoryScreenProps) {
  const [tab, setTab] = useState<"completed" | "cancelled">("completed");
  const [searchQuery, setSearchQuery] = useState("");

  const completed = history.filter(r => r.status === "completed");
  const totalSpent = completed.reduce((s, r) => s + r.fare, 0);
  const avgRating = completed.filter(r => r.rating).reduce((s, r, _, arr) => s + (r.rating || 0) / arr.length, 0);

  const filtered = useMemo(() => {
    const base = history.filter(r => r.status === tab);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(r =>
      r.pickup.toLowerCase().includes(q) ||
      r.dropoff.toLowerCase().includes(q) ||
      r.driverName.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }, [history, tab, searchQuery]);

  return (
    <div className="full-screen animate-screen-in">

      {/* Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0d1421 0%, var(--bg-deep) 100%)",
        padding: "24px 20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Ride History</p>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 900, marginTop: "4px", color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Your Journeys</h2>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} style={{ color: "var(--primary)" }} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "20px" }}>
          {[
            { label: "Rides",  value: completed.length.toString() },
            { label: "Spent",  value: `₦${(totalSpent / 1000).toFixed(1)}k` },
            { label: "Avg Rating",   value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—" },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>{s.value}</div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-3)", marginTop: "4px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Spend Chart */}
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Monthly Spend Overview</p>
          <SpendChart />
        </div>
      </div>

      <div className="full-screen-scroll safe-bottom">
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Tab Bar */}
          <div className="tab-bar">
            <button className={`tab-item${tab === "completed" ? " active" : ""}`} onClick={() => setTab("completed")}>
              Completed ({history.filter(r => r.status === "completed").length})
            </button>
            <button className={`tab-item${tab === "cancelled" ? " active" : ""}`} onClick={() => setTab("cancelled")}>
              Cancelled ({history.filter(r => r.status === "cancelled").length})
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search past rides..."
              style={{
                width: "100%",
                padding: "11px 36px 11px 40px",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--r-xl)",
                fontSize: "0.88rem",
                fontFamily: "var(--font)",
                color: "var(--text-1)",
                background: "var(--bg-elevated)",
                outline: "none",
                fontWeight: 500,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: 2 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-4)" }}>
                <Clock size={32} style={{ opacity: 0.25, marginBottom: "12px", display: "block", margin: "0 auto" }} />
                <p style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                  {searchQuery ? `No results for "${searchQuery}"` : `No rides found`}
                </p>
              </div>
            ) : (
              filtered.map(ride => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onRebook={
                    ride.pickupData && ride.dropoffData
                      ? () => onRebook(ride.pickupData!, ride.dropoffData!)
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
