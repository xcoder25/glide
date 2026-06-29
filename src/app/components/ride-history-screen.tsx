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
          fill={i <= rating ? "#F59E0B" : "transparent"}
          stroke={i <= rating ? "#F59E0B" : "var(--text-faint)"}
        />
      ))}
    </div>
  );
}

// Monthly spend data (simulated based on history + extra data for chart)
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
      <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: 70, padding: "0 4px" }}>
        {MONTHLY_SPEND.map((m, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              ₦{m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}k` : m.amount}
            </span>
            <div
              style={{
                width: "100%",
                height: `${(m.amount / max) * 52}px`,
                background: i === MONTHLY_SPEND.length - 1
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.35)",
                borderRadius: "5px 5px 0 0",
                transition: "height 0.8s var(--ease)",
                minHeight: 4,
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px", padding: "6px 4px 0 4px" }}>
        {MONTHLY_SPEND.map((m, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: "0.6rem", fontWeight: 800, color: i === MONTHLY_SPEND.length - 1 ? "#fff" : "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
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
      <style>body{font-family:system-ui,sans-serif;padding:32px;max-width:500px;margin:0 auto;}
      h1{font-size:1.4rem;font-weight:900;}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;}
      .label{color:#6b7280;font-size:0.88rem;}
      .value{font-weight:700;font-size:0.88rem;}
      .total{font-size:1.2rem;font-weight:900;color:#f97316;}
      .badge{background:#f97316;color:#fff;padding:3px 10px;border-radius:99px;font-size:0.72rem;font-weight:800;}
      </style></head><body>
      <h1>🚖 Glide Receipt</h1>
      <p style="color:#6b7280;font-size:0.85rem;margin-bottom:16px;">${ride.date}</p>
      <div class="row"><span class="label">Pickup</span><span class="value">${ride.pickup}</span></div>
      <div class="row"><span class="label">Drop-off</span><span class="value">${ride.dropoff}</span></div>
      <div class="row"><span class="label">Driver</span><span class="value">${ride.driverName}</span></div>
      <div class="row"><span class="label">Vehicle</span><span class="value">${ride.category}</span></div>
      <div class="row"><span class="label">Distance</span><span class="value">${ride.distance} km</span></div>
      <div class="row"><span class="label">Base fare</span><span class="value">₦${(ride.fare * 0.4).toFixed(0)}</span></div>
      <div class="row"><span class="label">Distance charge</span><span class="value">₦${(ride.fare * 0.55).toFixed(0)}</span></div>
      <div class="row"><span class="label">Service fee</span><span class="value">₦${(ride.fare * 0.05).toFixed(0)}</span></div>
      <div class="row" style="border:none;padding-top:14px;"><span style="font-size:1rem;font-weight:800;">Total Paid</span><span class="total">₦${ride.fare.toLocaleString()}</span></div>
      <p style="color:#9ca3af;font-size:0.75rem;margin-top:24px;">Powered by Glide · Uyo, Akwa Ibom State · glide.ng</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div
      style={{
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--card-border)",
        overflow: "hidden",
        background: "var(--card-bg)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px 18px",
          width: "100%",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "var(--font)",
          textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-subtle)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44,
          borderRadius: "13px",
          background: isCompleted ? "var(--success-subtle)" : "rgba(239,68,68,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${isCompleted ? "var(--success-glow)" : "rgba(239,68,68,0.15)"}`,
        }}>
          {isCompleted
            ? <Receipt size={18} style={{ color: "var(--success)" }} />
            : <XCircle size={18} style={{ color: "var(--danger)" }} />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
          {/* Route */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.83rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>{ride.pickup}</span>
            <span style={{ fontSize: "0.72rem", color: "var(--text-faint)", fontWeight: 500 }}>→</span>
            <span style={{ fontSize: "0.83rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>{ride.dropoff}</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "3px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <span>{ride.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-faint)", flexShrink: 0, display: "inline-block" }} />
            <span style={{ background: isCompleted ? "var(--success-subtle)" : "rgba(239,68,68,0.07)", color: isCompleted ? "var(--success)" : "var(--danger)", padding: "1px 7px", borderRadius: "99px", fontWeight: 700, fontSize: "0.62rem", border: `1px solid ${isCompleted ? "var(--success-glow)" : "rgba(239,68,68,0.2)"}` }}>
              {ride.category}
            </span>
          </div>
          {isCompleted && ride.rating && (
            <div style={{ marginTop: "5px" }}>
              <StarRating rating={ride.rating} />
            </div>
          )}
        </div>

        {/* Fare + expand */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1.0rem", fontWeight: 900, color: isCompleted ? "var(--text-heading)" : "var(--danger)", letterSpacing: "-0.02em" }}>
            {isCompleted ? `₦${ride.fare.toLocaleString()}` : "Cancelled"}
          </div>
          <div style={{ marginTop: "4px", color: "var(--text-faint)" }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Receipt */}
      {expanded && (
        <div className="animate-slide-up" style={{ borderTop: "1px solid var(--card-border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", background: "rgba(0,0,0,0.01)" }}>
          {isCompleted ? (
            <>
              <p className="section-header" style={{ marginBottom: "6px" }}>Receipt Breakdown</p>
              {[
                { label: "Base fare",              value: `₦${(ride.fare * 0.4).toFixed(0)}` },
                { label: `Distance (${ride.distance} km)`, value: `₦${(ride.fare * 0.55).toFixed(0)}` },
                { label: "Service fee",            value: `₦${(ride.fare * 0.05).toFixed(0)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "4px 0" }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: "var(--text-body)", fontWeight: 700 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)" }}>Total Paid</span>
                <span style={{ fontSize: "1rem", fontWeight: 900, color: "var(--primary)" }}>₦{ride.fare.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Driver: <strong style={{ color: "var(--text-body)", fontWeight: 700 }}>{ride.driverName}</strong></p>
            </>
          ) : (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
              <strong style={{ color: "var(--text-body)" }}>Reason:</strong> {ride.cancelReason || "User cancelled"}
            </p>
          )}

          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {ride.pickupData && ride.dropoffData && (
              <button
                onClick={onRebook}
                className="btn btn-primary"
                style={{ flex: 1, padding: "10px", fontSize: "0.82rem", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <RotateCcw size={13} /> Rebook
              </button>
            )}
            {isCompleted && (
              <button
                onClick={handlePrint}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "10px", fontSize: "0.82rem", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Printer size={13} /> Receipt
              </button>
            )}
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: "10px", fontSize: "0.82rem", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <ArrowUpRight size={13} /> Share
            </button>
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
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Hero Stats Banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
        padding: "28px 24px 24px 24px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 800, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>Ride History</p>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 900, marginTop: "4px", letterSpacing: "-0.03em", lineHeight: 1 }}>Your Journeys</h2>
            <p style={{ fontSize: "0.73rem", opacity: 0.8, marginTop: "6px", fontWeight: 500 }}>All past trips across Uyo</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "12px", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={20} color="#fff" />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "20px", position: "relative", zIndex: 1 }}>
          {[
            { label: "Total Rides",  value: completed.length.toString() },
            { label: "Total Spent",  value: `₦${(totalSpent / 1000).toFixed(1)}k` },
            { label: "Avg Rating",   value: avgRating > 0 ? `${avgRating.toFixed(1)} ⭐` : "—" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", textAlign: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: "0.62rem", opacity: 0.8, marginTop: "4px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Monthly Spend Chart */}
        <div style={{ marginTop: "20px", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, opacity: 0.7, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Monthly Spend (₦)</p>
          <SpendChart />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "16px 24px 0 24px" }}>
        <div className="tab-bar">
          <button className={`tab-item${tab === "completed" ? " active" : ""}`} onClick={() => setTab("completed")} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Clock size={12} />
            Completed ({history.filter(r => r.status === "completed").length})
          </button>
          <button className={`tab-item${tab === "cancelled" ? " active" : ""}`} onClick={() => setTab("cancelled")} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <XCircle size={12} />
            Cancelled ({history.filter(r => r.status === "cancelled").length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: "12px 24px 0 24px" }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by destination, driver, or vehicle..."
            style={{
              width: "100%",
              padding: "11px 36px 11px 36px",
              border: "1.5px solid var(--card-border-strong)",
              borderRadius: "var(--r-md)",
              fontSize: "0.84rem",
              fontFamily: "var(--font)",
              color: "var(--text-heading)",
              background: "var(--card-bg)",
              outline: "none",
              fontWeight: 500,
              transition: "border-color 0.2s",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-faint)", padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Ride List */}
      <div style={{ padding: "12px 24px 100px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-faint)" }}>
            <Clock size={36} style={{ opacity: 0.25, marginBottom: "14px", display: "block", margin: "0 auto 14px auto" }} />
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)" }}>
              {searchQuery ? `No results for "${searchQuery}"` : `No ${tab} rides yet`}
            </p>
            <p style={{ fontSize: "0.78rem", marginTop: "6px", fontWeight: 500 }}>
              {searchQuery ? "Try a different search term" : "Book your first ride from the Home screen"}
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
  );
}
