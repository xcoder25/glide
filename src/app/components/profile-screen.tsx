"use client";

import React, { useState } from "react";
import { Camera, Edit3, Save, X, Phone, Mail, MapPin, Briefcase, AlertTriangle, ChevronRight, Check, Shield, Bell, Lock, Trash2, Award, TrendingUp, Clock } from "lucide-react";

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  homeAddress: string;
  workAddress: string;
  emergencyName: string;
  emergencyPhone: string;
  avatarColor: string;
  avatarUrl?: string;
}

interface ProfileScreenProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const AVATAR_COLORS = [
  "#FF6B1A", "#FF4D6A", "#8B5CF6", "#00C2FF",
  "#00D97E", "#FFB020", "#EC4899", "#6366F1",
];

const TIER_CONFIG = {
  Bronze:   { min: 0,   max: 10,  next: "Silver",  color: "#CD7F32", gradient: "linear-gradient(135deg, #CD7F32, #a0522d)" },
  Silver:   { min: 10,  max: 25,  next: "Gold",    color: "#C0C0C0", gradient: "linear-gradient(135deg, #C0C0C0, #808080)" },
  Gold:     { min: 25,  max: 50,  next: "Emerald", color: "#FFB020", gradient: "linear-gradient(135deg, #FFB020, #d97706)" },
  Emerald:  { min: 50,  max: 100, next: "Diamond", color: "#00D97E", gradient: "linear-gradient(135deg, #00D97E, #059669)" },
  Diamond:  { min: 100, max: 100, next: "Diamond", color: "#00C2FF", gradient: "linear-gradient(135deg, #00C2FF, #0284c7)" },
};

const USER_RIDES = 62;
const USER_SPENT = 43500;
const MEMBER_SINCE = "Jan 2024";

function getTier(rides: number) {
  if (rides >= 100) return "Diamond";
  if (rides >= 50)  return "Emerald";
  if (rides >= 25)  return "Gold";
  if (rides >= 10)  return "Silver";
  return "Bronze";
}

export default function ProfileScreen({ profile, onSave }: ProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  const tier = getTier(USER_RIDES);
  const tierConf = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
  const ridesInTier = USER_RIDES - tierConf.min;
  const ridesNeeded = tierConf.max - tierConf.min;
  const tierProgress = tier === "Diamond" ? 100 : Math.min(100, (ridesInTier / ridesNeeded) * 100);

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

  const handleColorSelect = (color: string) => {
    setDraft(d => ({ ...d, avatarColor: color }));
    setShowColorPicker(false);
    onSave({ ...profile, avatarColor: color });
  };

  const FieldInput = ({
    label, fieldKey, icon, placeholder, type = "text",
  }: {
    label: string;
    fieldKey: keyof UserProfile;
    icon: React.ReactNode;
    placeholder: string;
    type?: string;
  }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label className="section-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {icon} {label}
      </label>
      {editing ? (
        <input
          type={type}
          value={draft[fieldKey] as string}
          onChange={e => setDraft(d => ({ ...d, [fieldKey]: e.target.value }))}
          placeholder={placeholder}
          style={{
            padding: "12px 14px",
            border: "1.5px solid var(--border-med)",
            borderRadius: "var(--r-md)",
            fontSize: "0.92rem",
            fontFamily: "var(--font)",
            background: "var(--bg-surface)",
            color: "var(--text-1)",
            outline: "none",
            width: "100%",
            fontWeight: 500,
            transition: "border-color 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border-med)"; }}
        />
      ) : (
        <div style={{
          padding: "12px 14px",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          fontSize: "0.92rem",
          color: draft[fieldKey] ? "var(--text-1)" : "var(--text-3)",
          background: "var(--bg-elevated)",
          fontWeight: draft[fieldKey] ? 600 : 400,
          fontFamily: "var(--font)",
        }}>
          {(draft[fieldKey] as string) || <span style={{ fontStyle: "italic", opacity: 0.4 }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );

  const SectionCard = ({ title, titleColor = "var(--text-3)", borderColor = "var(--border)", bg = "var(--bg-surface)", children }: {
    title: React.ReactNode;
    titleColor?: string;
    borderColor?: string;
    bg?: string;
    children: React.ReactNode;
  }) => (
    <div className="glass-card" style={{ padding: "18px", background: bg, borderColor, display: "flex", flexDirection: "column", gap: "14px" }}>
      <p style={{ fontSize: "0.68rem", fontWeight: 800, color: titleColor, textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "6px" }}>{title}</p>
      {children}
    </div>
  );

  const quickActions = [
    { label: "Privacy Settings",    icon: Shield, danger: false },
    { label: "Notification Prefs",  icon: Bell,   danger: false },
    { label: "Change Password",      icon: Lock,   danger: false },
    { label: "Delete Account",       icon: Trash2, danger: true  },
  ];

  const avatarBg = draft.avatarColor || "var(--primary)";

  return (
    <div className="full-screen animate-screen-in">

      {/* Profile Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #0d1421 0%, var(--bg-deep) 100%)",
        padding: "24px 20px 48px 20px",
        borderBottom: "1px solid var(--border)",
        position: "relative",
      }}>
        {/* Top Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>My Account</p>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "4px", color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Profile</h2>
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCancel} className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: "0.78rem", borderRadius: "10px", width: "auto" }}>
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.78rem", borderRadius: "10px", width: "auto" }}>
                Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.78rem", borderRadius: "10px", width: "auto" }}>
              Edit Profile
            </button>
          )}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "24px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              style={{
                width: 72, height: 72,
                borderRadius: "50%",
                background: avatarBg,
                border: "3px solid var(--bg-surface)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem", fontWeight: 950, color: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                overflow: "hidden",
                padding: 0,
              }}
              title="Change avatar"
            >
              {draft.avatarUrl ? (
                <img src={draft.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                draft.fullName?.charAt(0)?.toUpperCase() || "?"
              )}
            </button>
            <button
              onClick={() => setShowAvatarMenu(!showAvatarMenu)}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 24, height: 24,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
              title="Avatar options"
            >
              <Camera size={11} style={{ color: "var(--primary)" }} />
            </button>

            {/* Hidden File Input */}
            <input
              id="avatar-upload-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    setDraft(d => ({ ...d, avatarUrl: base64 }));
                    onSave({ ...profile, avatarUrl: base64 });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            {/* Avatar Dropdown Menu */}
            {showAvatarMenu && (
              <div
                className="animate-slide-up"
                style={{
                  position: "absolute", top: 80, left: 0,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-md)",
                  padding: "6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  boxShadow: "var(--shadow-xl)",
                  zIndex: 30,
                  width: 150,
                }}
              >
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    const fileInput = document.getElementById("avatar-upload-input");
                    fileInput?.click();
                  }}
                  style={{ padding: "8px 10px", background: "none", border: "none", borderRadius: "var(--r-xs)", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-1)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                  📷 Upload Photo
                </button>
                <button
                  onClick={() => {
                    setShowAvatarMenu(false);
                    setShowColorPicker(true);
                  }}
                  style={{ padding: "8px 10px", background: "none", border: "none", borderRadius: "var(--r-xs)", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-1)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                  🎨 Change Color
                </button>
                {draft.avatarUrl && (
                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      setDraft(d => {
                        const updated = { ...d };
                        delete updated.avatarUrl;
                        return updated;
                      });
                      const updatedProfile = { ...profile };
                      delete updatedProfile.avatarUrl;
                      onSave(updatedProfile);
                    }}
                    style={{ padding: "8px 10px", background: "none", border: "none", borderRadius: "var(--r-xs)", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--red)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--red-dim)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                  >
                    🗑️ Remove Photo
                  </button>
                )}
              </div>
            )}

            {/* Color Picker Popover */}
            {showColorPicker && (
              <div
                className="animate-slide-up"
                style={{
                  position: "absolute", top: 80, left: 0,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-med)",
                  borderRadius: "var(--r-md)",
                  padding: "10px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  boxShadow: "var(--shadow-xl)",
                  zIndex: 20,
                  width: 150,
                }}
              >
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      width: 26, height: 26,
                      borderRadius: "50%",
                      background: color,
                      border: draft.avatarColor === color ? "2px solid var(--text-1)" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <p style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>{draft.fullName || "Your Name"}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 900, background: "var(--primary-dim)", color: "var(--primary)", padding: "2px 8px", borderRadius: "99px", letterSpacing: "0.04em", border: "1px solid var(--primary-glow)" }}>
                {tier}
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 600 }}>Glide VIP Member</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "24px" }}>
          {[
            { icon: <TrendingUp size={13} />, label: "Total Rides", value: USER_RIDES },
            { icon: null, label: "Spent", value: `₦${(USER_SPENT / 1000).toFixed(1)}k` },
            { icon: <Clock size={13} />, label: "Since", value: MEMBER_SINCE },
          ].map((s, i) => (
            <div key={i} className="glass-card" style={{ padding: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-1)" }}>{s.value}</p>
              <p style={{ fontSize: "0.6rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content scroll area */}
      <div className="full-screen-scroll safe-bottom">
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Loyalty Progress Card */}
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "10px", background: tierConf.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Award size={18} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>{tier} Club Rewards</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>
                  {tier === "Diamond" ? "Max tier" : `${tierConf.max - USER_RIDES} rides to ${tierConf.next}`}
                </p>
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-1)" }}>{USER_RIDES}/{tierConf.max}</span>
            </div>
            <div style={{ width: "100%", height: 6, background: "var(--border-strong)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{
                width: `${tierProgress}%`,
                height: "100%",
                background: tierConf.gradient,
                borderRadius: "99px",
                boxShadow: `0 0 8px ${tierConf.color}`,
              }} />
            </div>
          </div>

          {saved && (
            <div className="animate-slide-up" style={{ padding: "12px 16px", background: "var(--green-dim)", border: "1px solid var(--green)", borderRadius: "var(--r-md)", color: "var(--green)", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={15} /> Profile saved successfully!
            </div>
          )}

          <SectionCard title="Personal Details">
            <FieldInput label="Full Name" fieldKey="fullName" icon={<Edit3 size={10} />} placeholder="Enter your full name" />
            <FieldInput label="Phone Number" fieldKey="phone" icon={<Phone size={10} />} placeholder="+234..." type="tel" />
            <FieldInput label="Email Address" fieldKey="email" icon={<Mail size={10} />} placeholder="name@domain.com" type="email" />
          </SectionCard>

          <SectionCard title="Locations">
            <FieldInput label="Home Address" fieldKey="homeAddress" icon={<MapPin size={10} />} placeholder="Saved home address" />
            <FieldInput label="Work Address" fieldKey="workAddress" icon={<Briefcase size={10} />} placeholder="Saved work address" />
          </SectionCard>

          <SectionCard
            title={<><AlertTriangle size={10} style={{ color: "var(--red)" }} /> Emergency contact</>}
            titleColor="var(--red)"
            borderColor="rgba(255,77,106,0.15)"
            bg="rgba(255,77,106,0.03)"
          >
            <FieldInput label="Contact Name" fieldKey="emergencyName" icon={<Edit3 size={10} />} placeholder="Name" />
            <FieldInput label="Contact Phone" fieldKey="emergencyPhone" icon={<Phone size={10} />} placeholder="Phone number" type="tel" />
          </SectionCard>

          {/* Quick Actions */}
          <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border)", overflow: "hidden" }}>
            {quickActions.map(({ label, icon: Icon, danger }, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  border: "none",
                  borderBottom: i < quickActions.length - 1 ? "1px solid var(--border)" : "none",
                  background: "var(--bg-surface)",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  fontFamily: "var(--font)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = danger ? "var(--red-dim)" : "var(--bg-elevated)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-surface)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Icon size={14} style={{ color: danger ? "var(--red)" : "var(--text-3)" }} />
                  <span style={{ fontSize: "0.86rem", fontWeight: 700, color: danger ? "var(--red)" : "var(--text-1)" }}>{label}</span>
                </div>
                <ChevronRight size={14} style={{ color: "var(--text-4)" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
