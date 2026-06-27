"use client";

import React, { useState } from "react";
import { Clock, Star, ArrowUpRight, ChevronDown, ChevronUp, RotateCcw, XCircle, Receipt } from "lucide-react";
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
          size={13}
          fill={i <= rating ? "var(--accent)" : "transparent"}
          stroke={i <= rating ? "var(--accent)" : "var(--text-muted)"}
        />
      ))}
    </div>
  );
}

function RideCard({ ride, onRebook }: { ride: RideRecord; onRebook?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = ride.status === "completed";

  return (
    <div
      style={{
        borderRadius: "16px",
        border: "1px solid var(--card-border)",
        overflow: "hidden",
        background: "rgba(0,0,0,0.01)",
        transition: "box-shadow 0.2s",
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
          fontFamily: "var(--font-sans)",
          textAlign: "left",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          background: isCompleted ? "rgba(26,107,60,0.08)" : "rgba(220,38,38,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          {isCompleted
            ? <Receipt size={18} style={{ color: "var(--accent)" }} />
            : <XCircle size={18} style={{ color: "#dc2626" }} />
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>
            {ride.pickup} → {ride.dropoff}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "8px" }}>
            <span>{ride.date}</span>
            <span>•</span>
            <span>{ride.category}</span>
          </div>
          {isCompleted && ride.rating && (
            <div style={{ marginTop: "4px" }}>
              <StarRating rating={ride.rating} />
            </div>
          )}
        </div>

        {/* Fare + expand */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: isCompleted ? "var(--text-main)" : "#dc2626" }}>
            {isCompleted ? `₦${ride.fare.toLocaleString()}` : "Cancelled"}
          </div>
          <div style={{ marginTop: "4px", color: "var(--text-muted)" }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expanded Receipt */}
      {expanded && (
        <div className="animate-slide-up" style={{ borderTop: "1px solid var(--card-border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {isCompleted ? (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                Receipt Breakdown
              </div>
              {[
                { label: "Base fare", value: `₦${(ride.fare * 0.4).toFixed(0)}` },
                { label: `Distance (${ride.distance} km)`, value: `₦${(ride.fare * 0.55).toFixed(0)}` },
                { label: "Service fee", value: `₦${(ride.fare * 0.05).toFixed(0)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>Total Paid</span>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)" }}>₦{ride.fare.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", fontSize: "0.8rem", color: "var(--text-muted)", gap: "6px", marginTop: "2px" }}>
                <span>Driver: <strong style={{ color: "var(--text-main)" }}>{ride.driverName}</strong></span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-main)" }}>Reason:</strong> {ride.cancelReason || "User cancelled"}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
            {ride.pickupData && ride.dropoffData && (
              <button
                onClick={onRebook}
                className="btn btn-primary"
                style={{ flex: 1, padding: "10px", fontSize: "0.82rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <RotateCcw size={14} /> Rebook
              </button>
            )}
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: "10px", fontSize: "0.82rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <ArrowUpRight size={14} /> Share Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RideHistoryScreen({ history, onRebook }: RideHistoryScreenProps) {
  const [tab, setTab] = useState<"completed" | "cancelled">("completed");

  const filtered = history.filter(r => r.status === tab);
  const completed = history.filter(r => r.status === "completed");
  const totalSpent = completed.reduce((s, r) => s + r.fare, 0);

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 20px 24px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Ride History</h2>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>All your past journeys across Lagos</p>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          {[
            { label: "Total Rides", value: completed.length.toString() },
            { label: "Total Spent", value: `₦${(totalSpent / 1000).toFixed(1)}k` },
            { label: "Avg Rating", value: "4.9 ⭐" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 12px", background: "rgba(0,0,0,0.02)", border: "1px solid var(--card-border)", borderRadius: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>{s.value}</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-item${tab === "completed" ? " active" : ""}`} onClick={() => setTab("completed")}>
            <Clock size={13} style={{ display: "inline", marginRight: "5px" }} />
            Completed ({history.filter(r => r.status === "completed").length})
          </button>
          <button className={`tab-item${tab === "cancelled" ? " active" : ""}`} onClick={() => setTab("cancelled")}>
            <XCircle size={13} style={{ display: "inline", marginRight: "5px" }} />
            Cancelled ({history.filter(r => r.status === "cancelled").length})
          </button>
        </div>
      </div>

      {/* Ride List */}
      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
            <Clock size={36} style={{ opacity: 0.3, marginBottom: "12px" }} />
            <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No {tab} rides yet</p>
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
