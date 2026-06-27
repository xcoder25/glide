"use client";

import React, { useState } from "react";
import { Camera, Edit3, Save, X, Phone, Mail, MapPin, Briefcase, AlertTriangle, ChevronRight } from "lucide-react";

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  homeAddress: string;
  workAddress: string;
  emergencyName: string;
  emergencyPhone: string;
  avatarColor: string;
}

interface ProfileScreenProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileScreen({ profile, onSave }: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  const field = (
    label: string,
    key: keyof UserProfile,
    icon: React.ReactNode,
    placeholder: string,
    type = "text"
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
        {icon} {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={draft[key] as string}
          onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{
            padding: "12px 14px",
            border: "1.5px solid var(--card-border-focus)",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontFamily: "var(--font-sans)",
            background: "rgba(217,95,0,0.03)",
            color: "var(--text-main)",
            outline: "none",
            width: "100%",
          }}
        />
      ) : (
        <div style={{
          padding: "12px 14px",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          fontSize: "0.9rem",
          color: draft[key] ? "var(--text-main)" : "var(--text-muted)",
          background: "rgba(0,0,0,0.015)",
        }}>
          {(draft[key] as string) || <span style={{ fontStyle: "italic", opacity: 0.6 }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "28px 24px 0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>My Profile</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>Manage your personal information</p>
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCancel} className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: "0.8rem", borderRadius: "10px" }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem", borderRadius: "10px" }}>
                <Save size={14} /> Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.82rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Edit3 size={14} /> Edit
            </button>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: `linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: 800,
              color: "#fff",
              boxShadow: "0 8px 28px rgba(217,95,0,0.28)",
            }}>
              {draft.fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <button
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--primary)",
                border: "3px solid var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <Camera size={13} />
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-main)" }}>{draft.fullName || "Your Name"}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Glide Member • Tier Level 2</p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {saved && (
          <div className="animate-slide-up" style={{ padding: "12px 16px", background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)", borderRadius: "12px", color: "var(--accent)", fontSize: "0.82rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            ✅ Profile saved successfully!
          </div>
        )}

        <div style={{ padding: "20px", background: "rgba(0,0,0,0.015)", borderRadius: "16px", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Personal Info</p>
          {field("Full Name", "fullName", <Edit3 size={11} />, "Enter your full name")}
          {field("Phone Number", "phone", <Phone size={11} />, "+234 800 000 0000", "tel")}
          {field("Email Address", "email", <Mail size={11} />, "your@email.com", "email")}
        </div>

        <div style={{ padding: "20px", background: "rgba(0,0,0,0.015)", borderRadius: "16px", border: "1px solid var(--card-border)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Saved Addresses</p>
          {field("Home Address", "homeAddress", <MapPin size={11} />, "Add your home address")}
          {field("Work Address", "workAddress", <Briefcase size={11} />, "Add your work address")}
        </div>

        <div style={{ padding: "20px", background: "rgba(220,38,38,0.03)", borderRadius: "16px", border: "1px solid rgba(220,38,38,0.1)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={11} /> Emergency Contact
          </p>
          {field("Contact Name", "emergencyName", <Edit3 size={11} />, "Emergency contact name")}
          {field("Contact Phone", "emergencyPhone", <Phone size={11} />, "+234 800 000 0000", "tel")}
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {[
            "Privacy Settings",
            "Notification Preferences",
            "Change Password",
            "Delete Account",
          ].map((item, i) => (
            <button
              key={i}
              className="glass-card-interactive"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 16px",
                border: "none",
                borderRadius: i === 0 ? "12px 12px 4px 4px" : i === 3 ? "4px 4px 12px 12px" : "4px",
                background: i === 3 ? "rgba(220,38,38,0.03)" : "rgba(0,0,0,0.015)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span style={{ fontSize: "0.88rem", fontWeight: 600, color: i === 3 ? "#dc2626" : "var(--text-main)" }}>{item}</span>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
