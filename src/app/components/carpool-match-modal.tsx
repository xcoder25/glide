"use client";

import React, { useState, useEffect } from "react";
import { Users, X, Star, ChevronRight, Info } from "lucide-react";
import type { LocationData } from "./booking-form";
import type { RideCategory } from "./ride-selector";

interface CoRider {
  name: string;
  initial: string;
  color: string;
  rating: number;
  pickup: string;
  addedMinutes: number;
}

const CO_RIDERS: CoRider[] = [
  { name: "Amaka Ibe", initial: "AI", color: "#7C3AED", rating: 4.8, pickup: "Uyo City Mall", addedMinutes: 3 },
  { name: "Chidi Nkem", initial: "CN", color: "#0891B2", rating: 4.6, pickup: "Ibom Plaza", addedMinutes: 5 },
];

interface CarpoolMatchModalProps {
  pickup: LocationData;
  dropoff: LocationData;
  category: RideCategory;
  soloPrice: number;
  onAcceptPool: (splitPrice: number) => void;
  onUpgradeSolo: () => void;
  onClose: () => void;
}

export default function CarpoolMatchModal({
  pickup, dropoff, category, soloPrice, onAcceptPool, onUpgradeSolo, onClose,
}: CarpoolMatchModalProps) {
  const [matchingPhase, setMatchingPhase] = useState<"matching" | "matched">("matching");
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => { setMatchedCount(1); }, 1400);
    const t2 = setTimeout(() => { setMatchedCount(2); setMatchingPhase("matched"); }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const splitPrice = Math.round(soloPrice * 0.55);
  const savings = soloPrice - splitPrice;

  const shownRiders = CO_RIDERS.slice(0, matchedCount);
  const addedTime = matchedCount === 2 ? CO_RIDERS[1].addedMinutes : matchedCount === 1 ? CO_RIDERS[0].addedMinutes : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
        <div className="sheet-handle" />
        <div style={{ padding: "8px 0 0 0" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>
                {matchingPhase === "matching" ? "Finding Pool Riders..." : "Riders Matched! 🎉"}
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500, marginTop: "2px" }}>
                {matchingPhase === "matching" ? "Connecting you with nearby riders" : `Save ₦${savings.toLocaleString()} by sharing`}
              </p>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
              <X size={15} />
            </button>
          </div>

          {/* Matching animation */}
          {matchingPhase === "matching" && (
            <div style={{ textAlign: "center", padding: "24px 0", animation: "fade-in 0.3s" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
                {/* You */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "1rem", boxShadow: "var(--shadow-primary)" }}>
                    U
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)" }}>You</span>
                </div>
                {/* Connecting dots */}
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", animation: `pulse-scale 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                {/* Pool riders placeholder */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-elevated)", border: "2px dashed var(--border-med)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={20} style={{ color: "var(--text-4)" }} />
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)" }}>Searching</span>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 500 }}>Looking for riders heading your way...</div>
            </div>
          )}

          {/* Matched riders */}
          {matchedCount > 0 && (
            <div style={{ marginBottom: "16px" }}>
              {shownRiders.map((rider, i) => (
                <div
                  key={rider.name}
                  className="glass-card"
                  style={{ padding: "13px 16px", marginBottom: "8px", animation: "slide-up 0.35s var(--ease-spring) both", animationDelay: `${i * 0.1}s`, display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: rider.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "0.82rem", flexShrink: 0 }}>
                    {rider.initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>{rider.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                      <Star size={9} fill="var(--amber)" stroke="var(--amber)" />
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--amber)" }}>{rider.rating}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>· Boards at {rider.pickup}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-3)" }}>+{rider.addedMinutes} min</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fare breakdown */}
          {matchingPhase === "matched" && (
            <div style={{ animation: "slide-up 0.4s var(--ease) both" }}>
              <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", overflow: "hidden", marginBottom: "16px" }}>
                {[
                  { label: "Solo fare", value: `₦${soloPrice.toLocaleString()}`, muted: true },
                  { label: "Pool discount (45%)", value: `-₦${savings.toLocaleString()}`, accent: "var(--green)" },
                  { label: "Your share", value: `₦${splitPrice.toLocaleString()}`, bold: true },
                ].map(({ label, value, muted, accent, bold }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: label === "Your share" ? "none" : "1px solid var(--border)" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: muted ? 500 : bold ? 800 : 600, color: muted ? "var(--text-3)" : "var(--text-1)", textDecoration: muted ? "line-through" : "none" }}>{label}</span>
                    <span style={{ fontSize: bold ? "1.1rem" : "0.88rem", fontWeight: bold ? 900 : 600, color: accent || (bold ? "var(--primary)" : muted ? "var(--text-3)" : "var(--text-1)"), letterSpacing: bold ? "-0.02em" : 0 }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Added time notice */}
              {addedTime > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "var(--r-md)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "16px" }}>
                  <Info size={13} style={{ color: "#6366f1", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.5 }}>
                    This shared ride adds ~{addedTime} min to your trip. Riders will be dropped off along the route.
                  </span>
                </div>
              )}

              {/* Savings badge */}
              <div style={{ textAlign: "center", padding: "12px", background: "var(--green-dim)", borderRadius: "var(--r-lg)", border: "1px solid rgba(0,217,126,0.2)", marginBottom: "18px" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--green)" }}>🎉 You save ₦{savings.toLocaleString()} with Glide Share!</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={onUpgradeSolo} className="btn btn-secondary" style={{ flex: 1 }}>
                  Solo · ₦{soloPrice.toLocaleString()}
                </button>
                <button onClick={() => onAcceptPool(splitPrice)} className="btn btn-primary" style={{ flex: 2 }}>
                  <Users size={16} />
                  Share · ₦{splitPrice.toLocaleString()}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
