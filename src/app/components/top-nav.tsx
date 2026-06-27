"use client";

import React from "react";
import { Home, Clock, CreditCard, User, Settings, Zap, LogOut } from "lucide-react";
import type { AppView } from "./bottom-nav";

interface TopNavProps {
  currentView: AppView;
  userName: string;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: "home" as AppView,     icon: Home,       label: "Home"     },
  { id: "history" as AppView,  icon: Clock,      label: "My Rides" },
  { id: "payment" as AppView,  icon: CreditCard, label: "Payment"  },
  { id: "profile" as AppView,  icon: User,       label: "Profile"  },
  { id: "settings" as AppView, icon: Settings,   label: "Settings" },
];

export default function TopNav({ currentView, userName, onNavigate, onLogout }: TopNavProps) {
  return (
    <aside
      style={{
        width: "72px",
        height: "100%",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: "6px",
        zIndex: 200,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => onNavigate("home")}
        style={{
          width: 42,
          height: 42,
          borderRadius: "13px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(217,95,0,0.25)",
        }}
      >
        <Zap size={22} color="#fff" strokeWidth={2.5} />
      </div>

      {/* Nav Items */}
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
        const isActive = currentView === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            title={label}
            style={{
              width: 48,
              height: 48,
              border: "none",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: isActive ? "rgba(217,95,0,0.12)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-muted)",
              boxShadow: isActive ? "0 2px 8px rgba(217,95,0,0.15)" : "none",
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User Avatar */}
      <div
        onClick={() => onNavigate("profile")}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "0.85rem",
          color: "#fff",
          cursor: "pointer",
          marginBottom: "4px",
        }}
        title={userName}
      >
        {userName.charAt(0).toUpperCase()}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="Sign Out"
        style={{
          width: 38,
          height: 38,
          border: "none",
          borderRadius: "12px",
          background: "transparent",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#dc2626"; e.currentTarget.style.background = "rgba(220,38,38,0.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
      >
        <LogOut size={17} />
      </button>
    </aside>
  );
}
