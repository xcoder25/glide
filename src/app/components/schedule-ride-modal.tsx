"use client";

import React, { useState } from "react";
import { Calendar, Clock, X, ChevronRight, AlertCircle } from "lucide-react";
import type { LocationData } from "./booking-form";
import type { RideCategory } from "./ride-selector";

export interface ScheduledRide {
  id: string;
  pickup: LocationData;
  dropoff: LocationData;
  category: RideCategory;
  price: number;
  scheduledAt: Date;
}

interface ScheduleRideModalProps {
  pickup: LocationData;
  dropoff: LocationData;
  category: RideCategory;
  price: number;
  onConfirm: (ride: ScheduledRide) => void;
  onClose: () => void;
}

function getMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function formatScheduleLabel(date: Date) {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hoursAway = Math.floor(diff / 3600000);
  const today = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  if (today) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;
  return date.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" }) + ` at ${timeStr}`;
}

export default function ScheduleRideModal({
  pickup, dropoff, category, price, onConfirm, onClose,
}: ScheduleRideModalProps) {
  const [dateTimeValue, setDateTimeValue] = useState("");
  const [error, setError] = useState("");

  const minDateTime = getMinDateTime();
  const selectedDate = dateTimeValue ? new Date(dateTimeValue) : null;

  const handleConfirm = () => {
    if (!selectedDate) { setError("Please select a date and time."); return; }
    const now = new Date();
    if (selectedDate.getTime() - now.getTime() < 25 * 60 * 1000) {
      setError("Scheduled rides must be at least 30 minutes in the future.");
      return;
    }
    onConfirm({
      id: `sched-${Date.now()}`,
      pickup, dropoff, category, price,
      scheduledAt: selectedDate,
    });
  };

  const QUICK_TIMES = [
    { label: "In 1 hour", mins: 60 },
    { label: "In 2 hours", mins: 120 },
    { label: "Tomorrow 7 AM", custom: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(7, 0, 0, 0); return d; } },
    { label: "Tomorrow 9 AM", custom: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
  ];

  const setQuickTime = (mins?: number, custom?: () => Date) => {
    const d = custom ? custom() : new Date(Date.now() + (mins! * 60 * 1000));
    const pad = (n: number) => String(n).padStart(2, "0");
    setDateTimeValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setError("");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()} style={{ maxHeight: "88vh" }}>
        <div className="sheet-handle" />
        <div style={{ padding: "8px 0 0 0" }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Schedule Ride</h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500, marginTop: "2px" }}>Book your ride for later</p>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-med)", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-2)" }}>
              <X size={15} />
            </button>
          </div>

          {/* Route summary */}
          <div style={{ padding: "12px 14px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", marginBottom: "18px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-1)" }}>{pickup.name}</span>
            </div>
            <div style={{ width: 1, height: 10, background: "var(--border-med)", marginLeft: "3px", marginBottom: "7px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-1)" }}>{dropoff.name}</span>
              </div>
              <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--primary)" }}>₦{price.toLocaleString()}</span>
            </div>
          </div>

          {/* Quick time options */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Quick Select</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {QUICK_TIMES.map(qt => {
                const d = qt.custom ? qt.custom() : new Date(Date.now() + qt.mins! * 60000);
                const pad = (n: number) => String(n).padStart(2, "0");
                const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                const isSelected = dateTimeValue === val;
                return (
                  <button
                    key={qt.label}
                    onClick={() => setQuickTime(qt.mins, qt.custom)}
                    style={{
                      padding: "11px 14px", borderRadius: "var(--r-lg)", textAlign: "left",
                      background: isSelected ? "var(--primary-dim)" : "var(--bg-elevated)",
                      border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                      cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--text-1)" }}>{qt.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "var(--text-3)", marginTop: "2px" }}>
                      {formatScheduleLabel(d)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom date/time picker */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Or Choose Exact Time</p>
            <div style={{ position: "relative" }}>
              <Calendar size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none" }} />
              <input
                type="datetime-local"
                value={dateTimeValue}
                min={minDateTime}
                onChange={e => { setDateTimeValue(e.target.value); setError(""); }}
                style={{
                  width: "100%", padding: "13px 14px 13px 42px",
                  background: "var(--bg-elevated)", border: `1.5px solid ${error ? "var(--red)" : dateTimeValue ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--r-lg)", color: "var(--text-1)", fontFamily: "var(--font)",
                  fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s",
                  colorScheme: "dark",
                }}
              />
            </div>
          </div>

          {/* Selected preview */}
          {selectedDate && !error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "var(--primary-dim)", borderRadius: "var(--r-lg)", border: "1px solid var(--primary-glow)", marginBottom: "14px", animation: "slide-up 0.2s var(--ease) both" }}>
              <Clock size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-1)" }}>{formatScheduleLabel(selectedDate)}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "1px" }}>{category.name} · ₦{price.toLocaleString()}</div>
              </div>
              <ChevronRight size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "11px 14px", background: "var(--red-dim)", borderRadius: "var(--r-md)", border: "1px solid rgba(255,77,106,0.2)", marginBottom: "14px" }}>
              <AlertCircle size={14} style={{ color: "var(--red)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.8rem", color: "var(--red)", fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button
              onClick={handleConfirm}
              disabled={!dateTimeValue}
              className="btn btn-primary"
              style={{ flex: 2, opacity: dateTimeValue ? 1 : 0.5 }}
            >
              <Calendar size={16} />
              Confirm Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
