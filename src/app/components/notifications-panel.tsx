"use client";

import React, { useState } from "react";
import { Bell, X, CheckCheck, Zap, Tag, AlertTriangle, Star, ChevronRight } from "lucide-react";

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
  {
    id: "n1",
    type: "promo",
    title: "Flash Deal — 30% off today!",
    body: "Use code FLASH30 for 30% off any ride booked before 11:59 PM. Don't miss out!",
    time: "Just now",
    read: false,
    action: "Apply Code",
  },
  {
    id: "n2",
    type: "ride",
    title: "Your ride receipt is ready",
    body: "Your Glide Comfort ride from Ikeja to Lekki — ₦6,800. Tap to view full receipt.",
    time: "2 hours ago",
    read: false,
    action: "View Receipt",
  },
  {
    id: "n3",
    type: "rating",
    title: "Marcus left you a compliment!",
    body: "Your driver Marcus Sterling gave you 5 stars and said: 'Great passenger, always ready on time!'",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n4",
    type: "safety",
    title: "Safety check-in",
    body: "We noticed your last trip took longer than expected. Are you okay? Tap to confirm arrival.",
    time: "Yesterday",
    read: true,
    action: "I'm Safe",
  },
  {
    id: "n5",
    type: "system",
    title: "Glide v2.4.1 is here",
    body: "We've improved trip accuracy, added AI Safety Companion, and upgraded payment security. Update now.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n6",
    type: "promo",
    title: "You've earned 220 loyalty points!",
    body: "You're just 220 points away from a free ride. Keep riding to unlock your Glide Emerald reward.",
    time: "4 days ago",
    read: true,
  },
];

const TYPE_CONFIG: Record<Notification["type"], { color: string; bg: string; icon: React.ReactNode }> = {
  ride:   { color: "var(--primary)", bg: "rgba(217,95,0,0.08)",    icon: <Zap size={16} /> },
  promo:  { color: "#d97706",        bg: "rgba(217,119,6,0.08)",    icon: <Tag size={16} /> },
  safety: { color: "#dc2626",        bg: "rgba(220,38,38,0.08)",    icon: <AlertTriangle size={16} /> },
  rating: { color: "var(--accent)",  bg: "rgba(26,107,60,0.08)",    icon: <Star size={16} /> },
  system: { color: "var(--text-muted)", bg: "rgba(0,0,0,0.04)",     icon: <Bell size={16} /> },
};

interface NotificationsPanelProps {
  onClose: () => void;
}

export default function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ alignItems: "flex-start", justifyContent: "flex-end" }}
    >
      <div
        className="animate-slide-right"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--background)",
          width: "100%",
          maxWidth: 400,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid var(--card-border)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 20px 16px 20px", borderBottom: "1px solid var(--card-border)", position: "sticky", top: 0, background: "var(--background)", zIndex: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>Notifications</h3>
              {unreadCount > 0 && (
                <p style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{ display: "flex", alignItems: "center", gap: "4px", border: "none", background: "rgba(0,0,0,0.04)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                style={{ border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px" }}>
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "20px",
                  border: "none",
                  background: filter === f ? "var(--primary)" : "rgba(0,0,0,0.04)",
                  color: filter === f ? "#fff" : "var(--text-muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {f === "unread" ? `Unread (${unreadCount})` : "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
              <Bell size={40} style={{ opacity: 0.2, marginBottom: "12px" }} />
              <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No notifications</p>
              <p style={{ fontSize: "0.78rem", marginTop: "4px" }}>You're all caught up!</p>
            </div>
          ) : (
            filtered.map((notif, i) => {
              const cfg = TYPE_CONFIG[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    display: "flex",
                    gap: "14px",
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--card-border)",
                    background: notif.read ? "transparent" : "rgba(217,95,0,0.025)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div style={{ position: "absolute", top: 18, left: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                  )}

                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: "12px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: cfg.color, marginTop: "2px" }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: notif.read ? 600 : 700, color: "var(--text-main)", lineHeight: 1.3 }}>
                        {notif.title}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                        style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, padding: 2 }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "4px", lineHeight: 1.5 }}>
                      {notif.body}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-dark)", fontWeight: 500 }}>{notif.time}</span>
                      {notif.action && (
                        <button
                          style={{ display: "flex", alignItems: "center", gap: "3px", border: "none", background: "none", color: cfg.color, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                        >
                          {notif.action} <ChevronRight size={12} />
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
