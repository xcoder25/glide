"use client";

import React from "react";
import { Home, Clock, CreditCard, User, Settings, LogOut } from "lucide-react";
import type { AppView } from "./bottom-nav";

interface TopNavProps {
  currentView: AppView;
  userName: string;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  avatarUrl?: string;
  avatarColor?: string;
}

const NAV_ITEMS = [
  { id: "home" as AppView,     icon: Home,       label: "Home"     },
  { id: "history" as AppView,  icon: Clock,      label: "My Rides" },
  { id: "payment" as AppView,  icon: CreditCard, label: "Payment"  },
  { id: "profile" as AppView,  icon: User,       label: "Profile"  },
  { id: "settings" as AppView, icon: Settings,   label: "Settings" },
];

export default function TopNav({ currentView, userName, onNavigate, onLogout, avatarUrl, avatarColor }: TopNavProps) {
  const avatarBg = avatarColor || "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)";

  return (
    <aside
      style={{
        width: "76px",
        height: "100%",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--card-border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0 24px 0",
        gap: "4px",
        zIndex: 200,
        flexShrink: 0,
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => onNavigate("home")}
        title="Glide Home"
        style={{
          width: 44,
          height: 44,
          borderRadius: "14px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
          cursor: "pointer",
          boxShadow: "var(--shadow-primary)",
          transition: "transform 0.2s var(--ease), box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1.06)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(249,115,22,0.45)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-primary)";
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
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
              transition: "all 0.2s var(--ease)",
              background: isActive ? "var(--primary-subtle)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--text-faint)",
              position: "relative",
            }}
          >
            {isActive && (
              <div style={{
                position: "absolute",
                left: -1,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: 20,
                borderRadius: "0 4px 4px 0",
                background: "var(--primary)",
              }} />
            )}
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User Avatar */}
      <div
        onClick={() => onNavigate("profile")}
        title={userName}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: avatarBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "0.9rem",
          color: "#fff",
          cursor: "pointer",
          marginBottom: "8px",
          boxShadow: "var(--shadow-primary)",
          border: "2px solid var(--bg-secondary)",
          transition: "transform 0.2s var(--ease)",
          overflow: "hidden",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          userName.charAt(0).toUpperCase()
        )}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="Sign Out"
        style={{
          width: 40,
          height: 40,
          border: "none",
          borderRadius: "12px",
          background: "transparent",
          color: "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s var(--ease)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "var(--danger)";
          e.currentTarget.style.background = "rgba(239,68,68,0.08)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "var(--text-faint)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <LogOut size={17} />
      </button>
    </aside>
  );
}
