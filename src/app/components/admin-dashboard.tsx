"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2, Users, Car, DollarSign, TrendingUp, Activity,
  X, CheckCircle, XCircle, Clock, Star, Zap, ArrowUpRight,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────
const DAILY_REVENUE = [38000, 52000, 44000, 61000, 57000, 72000, 68400];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_REV = Math.max(...DAILY_REVENUE);

const LIVE_RIDES = [
  { id: "R1029", rider: "Amaka Ibe", driver: "Marcus Sterling", pickup: "UNIUYO", dropoff: "City Mall", status: "inprogress", fare: 1800, started: "12:42 PM" },
  { id: "R1028", rider: "Bello Hassan", driver: "Chidi Obi", pickup: "Airport", dropoff: "Ibom Hotel", status: "arriving", fare: 5200, started: "12:38 PM" },
  { id: "R1027", rider: "Ngozi Eze", driver: "Emeka Nwosu", pickup: "Gov. House", dropoff: "Stadium", status: "searching", fare: 2400, started: "12:45 PM" },
  { id: "R1026", rider: "Chukwudi Okon", driver: "Kingsley Abel", pickup: "Ibom Plaza", dropoff: "Hospital", status: "completed", fare: 1500, started: "12:10 PM" },
  { id: "R1025", rider: "Funke Adeleke", driver: "Biodun Afe", pickup: "UNIUYO", dropoff: "Airport", status: "cancelled", fare: 0, started: "11:55 AM" },
];

const DRIVERS = [
  { name: "Marcus Sterling", plate: "GLIDE-001", rating: 4.92, trips: 2490, status: "online", earnings: 18400 },
  { name: "Chidi Obi", plate: "GLIDE-002", rating: 4.85, trips: 1870, status: "online", earnings: 14200 },
  { name: "Emeka Nwosu", plate: "GLIDE-003", rating: 4.78, trips: 1340, status: "online", earnings: 11800 },
  { name: "Kingsley Abel", plate: "GLIDE-004", rating: 4.70, trips: 980, status: "offline", earnings: 8600 },
  { name: "Biodun Afe", plate: "GLIDE-005", rating: 4.65, trips: 620, status: "offline", earnings: 6200 },
];

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  inprogress: { color: "#00c896", bg: "rgba(0,200,150,0.12)", label: "In Trip" },
  arriving: { color: "var(--primary)", bg: "var(--primary-dim)", label: "Arriving" },
  searching: { color: "var(--cyan)", bg: "rgba(0,200,255,0.1)", label: "Searching" },
  completed: { color: "var(--text-3)", bg: "var(--bg-elevated)", label: "Completed" },
  cancelled: { color: "var(--red)", bg: "var(--red-dim)", label: "Cancelled" },
};

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rides" | "drivers">("overview");

  const todayRides = 142;
  const todayRevenue = 68400;
  const activeDrivers = 3;
  const cancelRate = 4.2;

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "rides" as const, label: "Live Rides" },
    { id: "drivers" as const, label: "Drivers" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "var(--bg-base)", display: "flex", flexDirection: "column", animation: "slide-up 0.35s var(--ease-spring) both" }}>
      {/* Admin Header */}
      <div style={{ background: "linear-gradient(135deg, #1a0533 0%, #0d001f 100%)", padding: "20px 20px 0 20px", borderBottom: "1px solid rgba(139, 92, 246, 0.2)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(139,92,246,0.5)" }}>
              <BarChart2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)" }}>Glide Ops Center</div>
              <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin Dashboard · Demo Data</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "var(--font)", fontSize: "0.82rem", fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.4)",
                borderBottom: `2px solid ${activeTab === tab.id ? "#8B5CF6" : "transparent"}`,
                transition: "all 0.2s", flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "Rides Today", value: todayRides, icon: <Car size={16} />, color: "#8B5CF6", change: "+8%", sub: "vs yesterday" },
                { label: "Revenue", value: `₦${(todayRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={16} />, color: "#00c896", change: "+12%", sub: "vs yesterday" },
                { label: "Active Drivers", value: activeDrivers, icon: <Users size={16} />, color: "var(--primary)", change: "3 online", sub: "now" },
                { label: "Cancel Rate", value: `${cancelRate}%`, icon: <Activity size={16} />, color: "var(--cyan)", change: "-0.3%", sub: "vs yesterday" },
              ].map(kpi => (
                <div key={kpi.label} style={{ padding: "16px", background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: kpi.color, opacity: 0.85 }}>{kpi.icon}</span>
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#00c896", background: "rgba(0,200,150,0.1)", padding: "2px 7px", borderRadius: "99px" }}>{kpi.change}</span>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{kpi.value}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{kpi.label}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-4)", marginTop: "1px" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div style={{ padding: "18px", background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-1)" }}>Weekly Revenue</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "2px" }}>Jun 23 – Jun 29</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <TrendingUp size={14} style={{ color: "#00c896" }} />
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#00c896" }}>+18% this week</span>
                </div>
              </div>
              {/* SVG bar chart */}
              <svg viewBox="0 0 280 100" style={{ width: "100%", height: "auto", overflow: "visible" }}>
                <defs>
                  <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="bar-grad-last" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c896" />
                    <stop offset="100%" stopColor="#00a070" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                {DAILY_REVENUE.map((rev, i) => {
                  const barH = (rev / MAX_REV) * 75;
                  const x = i * 40 + 10;
                  const isToday = i === DAILY_REVENUE.length - 1;
                  return (
                    <g key={i}>
                      <rect x={x} y={85 - barH} width={24} height={barH} rx="5" fill={isToday ? "url(#bar-grad-last)" : "url(#bar-grad)"} opacity={isToday ? 1 : 0.7} />
                      <text x={x + 12} y={98} textAnchor="middle" fill="var(--text-4)" style={{ fontSize: "7px", fontFamily: "var(--font)", fontWeight: 600 }}>{DAYS[i]}</text>
                      {isToday && (
                        <text x={x + 12} y={79 - barH} textAnchor="middle" fill="#00c896" style={{ fontSize: "7px", fontFamily: "var(--font)", fontWeight: 800 }}>
                          ₦{(rev / 1000).toFixed(0)}K
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[
                { label: "Avg Fare", value: "₦2,340" },
                { label: "Avg Trip", value: "12.4 min" },
                { label: "App Rating", value: "4.8 ⭐" },
              ].map(s => (
                <div key={s.label} style={{ padding: "14px", background: "var(--bg-elevated)", borderRadius: "var(--r-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>{s.value}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-3)", marginTop: "4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── RIDES TAB ── */}
        {activeTab === "rides" && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 500 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c896", boxShadow: "0 0 6px #00c896", animation: "pulse-ring 1.5s infinite" }} />
              {LIVE_RIDES.filter(r => r.status === "inprogress" || r.status === "arriving" || r.status === "searching").length} active rides right now
            </div>
            {LIVE_RIDES.map(ride => {
              const s = STATUS_STYLE[ride.status];
              return (
                <div key={ride.id} style={{ padding: "14px 16px", background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-3)", fontFamily: "monospace" }}>#{ride.id}</span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "3px 10px", borderRadius: "99px", background: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-1)" }}>{ride.rider}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px" }}>Driver: {ride.driver}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 900, color: ride.status === "cancelled" ? "var(--text-3)" : "var(--primary)" }}>
                        {ride.status === "cancelled" ? "Cancelled" : `₦${ride.fare.toLocaleString()}`}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-4)", marginTop: "2px" }}>{ride.started}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)", flexShrink: 0 }} />
                    {ride.pickup}
                    <span style={{ color: "var(--text-4)" }}>→</span>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                    {ride.dropoff}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── DRIVERS TAB ── */}
        {activeTab === "drivers" && (
          <>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)", fontWeight: 500 }}>
              {DRIVERS.filter(d => d.status === "online").length} of {DRIVERS.length} drivers currently online
            </div>
            {DRIVERS.map((driver, i) => (
              <div key={driver.name} style={{ padding: "14px 16px", background: "var(--bg-elevated)", borderRadius: "var(--r-xl)", border: `1px solid ${driver.status === "online" ? "rgba(0,200,150,0.2)" : "var(--border)"}`, display: "flex", alignItems: "center", gap: "14px", animation: "slide-up 0.3s var(--ease) both", animationDelay: `${i * 0.05}s` }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: "0.9rem" }}>
                    {driver.name.split(" ").map(p => p[0]).join("")}
                  </div>
                  <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: driver.status === "online" ? "#00c896" : "var(--text-4)", border: "2px solid var(--bg-elevated)", boxShadow: driver.status === "online" ? "0 0 6px #00c896" : "none" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>{driver.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                    <Star size={10} fill="var(--amber)" stroke="var(--amber)" />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--amber)" }}>{driver.rating}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-3)" }}>· {driver.trips.toLocaleString()} trips</span>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-4)", marginTop: "2px", fontFamily: "monospace" }}>{driver.plate}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#00c896" }}>₦{driver.earnings.toLocaleString()}</div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-3)", marginTop: "2px" }}>this week</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
