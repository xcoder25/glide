"use client";

import React, { useState } from "react";
import { Bell, X, CheckCheck, Zap, Tag, AlertTriangle, Star, ChevronRight, Inbox } from "lucide-react";

interface Notification {
  id: string;
  type: "ride" | "promo" | "safety" | "rating" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  action?: string;
}

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "promo", title: "Flash Deal — 30% off today!", body: "Use code FLASH30 for 30% off any ride booked before 11:59 PM. Don't miss out!", time: "Just now", read: false, action: "Apply Code" },
  { id: "n2", type: "ride", title: "Your ride receipt is ready", body: "Your Glide Comfort ride from Ikeja to Lekki — ₦6,800. Tap to view full receipt.", time: "2 hours ago", read: false, action: "View Receipt" },
  { id: "n3", type: "rating", title: "Marcus left you a compliment!", body: "Your driver Marcus Sterling gave you 5 stars and said: 'Great passenger, always ready on time!'", time: "Yesterday", read: true },
  { id: "n4", type: "safety", title: "Safety check-in", body: "We noticed your last trip took longer than expected. Are you okay? Tap to confirm arrival.", time: "Yesterday", read: true, action: "I'm Safe" },
  { id: "n5", type: "system", title: "Glide v2.4.1 is here", body: "We've improved trip accuracy, added AI Safety Companion, and upgraded payment security.", time: "3 days ago", read: true },
  { id: "n6", type: "promo", title: "You've earned 220 loyalty points!", body: "You're just 220 points away from a free ride. Keep riding to unlock your Glide Emerald reward.", time: "4 days ago", read: true },
];

const TYPE_CONFIG: Record<Notification["type"], { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  ride:   { color: "var(--primary)", bg: "var(--primary-dim)", border: "var(--primary-glow)", icon: <Zap size={15} />, label: "Ride" },
  promo:  { color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(255,176,32,0.2)", icon: <Tag size={15} />, label: "Promo" },
  safety: { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(255,77,106,0.2)", icon: <AlertTriangle size={15} />, label: "Safety" },
  rating: { color: "var(--green)", bg: "var(--green-dim)", border: "var(--green-glow)", icon: <Star size={15} />, label: "Rating" },
  system: { color: "var(--text-3)", bg: "var(--bg-elevated)", border: "var(--border)", icon: <Bell size={15} />, label: "System" },
};

export default function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ alignItems: "flex-start", justifyContent: "flex-end" }}
    >
      <div
        className="animate-slide-right"
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-surface)",
          width: "100%",
          maxWidth: 400,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 20px 16px 20px",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          background: "var(--bg-surface)",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "10px", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={16} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", lineHeight: 1, letterSpacing: "-0.02em" }}>Notifications</h3>
                {unreadCount > 0 && (
                  <p style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 700, marginTop: "2px" }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ display: "flex", alignItems: "center", gap: "4px", border: "1.5px solid var(--border)", background: "var(--bg-elevated)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "0.7rem", fontWeight: 800, color: "var(--text-2)", fontFamily: "var(--font)" }}
                >
                  <CheckCheck size={12} /> Mark all
                </button>
              )}
              <button onClick={onClose} className="back-btn" style={{ width: 34, height: 34 }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "99px",
                  border: `1px solid ${filter === f ? "var(--primary)" : "var(--border)"}`,
                  background: filter === f ? "var(--primary)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text-2)",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  textTransform: "capitalize",
                  transition: "all 0.2s var(--ease)",
                }}
              >
                {f === "unread" ? `Unread (${unreadCount})` : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Inbox size={28} style={{ opacity: 0.5 }} />
              </div>
              <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>All clear!</p>
              <p style={{ fontSize: "0.78rem", fontWeight: 500 }}>No notifications to show.</p>
            </div>
          ) : (
            filtered.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border)",
                    background: notif.read ? "transparent" : "rgba(255,107,26,0.02)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                >
                  {/* Unread indicator */}
                  {!notif.read && (
                    <div style={{ position: "absolute", top: 20, left: 7, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: "12px",
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: cfg.color,
                    marginTop: "2px",
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <p style={{ fontSize: "0.86rem", fontWeight: notif.read ? 600 : 800, color: "var(--text-1)", lineHeight: 1.3 }}>
                        {notif.title}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-4)", flexShrink: 0, padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-2)", marginTop: "4px", lineHeight: 1.5, fontWeight: 500 }}>
                      {notif.body}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-3)", fontWeight: 600 }}>{notif.time}</span>
                      {notif.action && (
                        <button style={{
                          display: "flex", alignItems: "center", gap: "3px",
                          border: "none", background: "none",
                          color: cfg.color, fontSize: "0.7rem", fontWeight: 800,
                          cursor: "pointer", fontFamily: "var(--font)",
                        }}>
                          {notif.action} <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
