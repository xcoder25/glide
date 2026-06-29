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
}

interface ProfileScreenProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const AVATAR_COLORS = [
  "#F97316", "#EF4444", "#8B5CF6", "#0EA5E9",
  "#10B981", "#F59E0B", "#EC4899", "#6366F1",
];

const TIER_CONFIG = {
  Bronze:   { min: 0,   max: 10,  next: "Silver",  color: "#CD7F32", gradient: "linear-gradient(135deg, #CD7F32, #a0522d)" },
  Silver:   { min: 10,  max: 25,  next: "Gold",    color: "#C0C0C0", gradient: "linear-gradient(135deg, #C0C0C0, #808080)" },
  Gold:     { min: 25,  max: 50,  next: "Emerald", color: "#F59E0B", gradient: "linear-gradient(135deg, #F59E0B, #d97706)" },
  Emerald:  { min: 50,  max: 100, next: "Diamond", color: "#10B981", gradient: "linear-gradient(135deg, #10B981, #059669)" },
  Diamond:  { min: 100, max: 100, next: "Diamond", color: "#0EA5E9", gradient: "linear-gradient(135deg, #0EA5E9, #0284c7)" },
};

// Simulated: user has 62 completed rides (Emerald tier)
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
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "0.67rem", fontWeight: 800, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "5px" }}>
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
            border: "1.5px solid var(--card-border-strong)",
            borderRadius: "var(--r-md)",
            fontSize: "0.9rem",
            fontFamily: "var(--font)",
            background: "var(--bg-secondary)",
            color: "var(--text-heading)",
            outline: "none",
            width: "100%",
            fontWeight: 500,
            transition: "border-color 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-glow)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; e.currentTarget.style.boxShadow = "none"; }}
        />
      ) : (
        <div style={{
          padding: "12px 14px",
          border: "1px solid var(--card-border)",
          borderRadius: "var(--r-md)",
          fontSize: "0.9rem",
          color: draft[fieldKey] ? "var(--text-body)" : "var(--text-faint)",
          background: "var(--card-bg)",
          fontWeight: draft[fieldKey] ? 600 : 400,
          fontFamily: "var(--font)",
        }}>
          {(draft[fieldKey] as string) || <span style={{ fontStyle: "italic", opacity: 0.5 }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );

  const SectionCard = ({ title, titleColor = "var(--text-faint)", borderColor = "var(--card-border)", bg = "var(--card-bg)", children }: {
    title: React.ReactNode;
    titleColor?: string;
    borderColor?: string;
    bg?: string;
    children: React.ReactNode;
  }) => (
    <div style={{ padding: "18px", background: bg, borderRadius: "var(--r-lg)", border: `1px solid ${borderColor}`, display: "flex", flexDirection: "column", gap: "14px", boxShadow: "var(--shadow-sm)" }}>
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
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Profile Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)",
        padding: "28px 24px 60px 24px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        {/* Top Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ fontSize: "0.62rem", fontWeight: 800, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase" }}>My Profile</p>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 900, marginTop: "4px", letterSpacing: "-0.02em", lineHeight: 1 }}>Account</h2>
          </div>
          {editing ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleCancel} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: "5px" }}>
                <X size={13} /> Cancel
              </button>
              <button onClick={handleSave} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: "5px" }}>
                <Save size={13} /> Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, fontFamily: "var(--font)", display: "flex", alignItems: "center", gap: "5px", transition: "all 0.2s" }}>
              <Edit3 size={13} /> Edit Profile
            </button>
          )}
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 72, height: 72,
                borderRadius: "50%",
                background: avatarBg,
                border: "3px solid rgba(255,255,255,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.8rem", fontWeight: 900, color: "#fff",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Tap to change avatar color"
            >
              {draft.fullName?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 26, height: 26,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <Camera size={12} style={{ color: "var(--primary)" }} />
            </button>

            {/* Color Picker Popover */}
            {showColorPicker && (
              <div
                className="animate-slide-up"
                style={{
                  position: "absolute", top: 80, left: 0,
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "var(--r-md)",
                  padding: "12px",
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "8px",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 10,
                  width: 160,
                }}
                onClick={e => e.stopPropagation()}
              >
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: color,
                      border: draft.avatarColor === color ? "2.5px solid var(--text-heading)" : "2.5px solid transparent",
                      cursor: "pointer",
                      transition: "transform 0.15s",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <p style={{ fontSize: "1.15rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em" }}>{draft.fullName || "Your Name"}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 900, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "99px", letterSpacing: "0.04em" }}>
                {tier}
              </span>
              <span style={{ fontSize: "0.65rem", opacity: 0.75, fontWeight: 600 }}>Glide Member</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
              {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "0.6rem" }}>⭐</span>)}
              <span style={{ fontSize: "0.65rem", opacity: 0.8, marginLeft: "4px", fontWeight: 600 }}>4.9 passenger rating</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "20px", position: "relative", zIndex: 1 }}>
          {[
            { icon: <TrendingUp size={13} />, label: "Total Rides", value: USER_RIDES },
            { icon: null, label: "Total Spent", value: `₦${(USER_SPENT / 1000).toFixed(1)}k` },
            { icon: <Clock size={13} />, label: "Member Since", value: MEMBER_SINCE },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "10px", textAlign: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: "1rem", fontWeight: 900, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.58rem", opacity: 0.75, marginTop: "3px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content — overlaps banner */}
      <div style={{ padding: "0 20px 100px 20px", display: "flex", flexDirection: "column", gap: "14px", marginTop: "-24px", position: "relative", zIndex: 2 }}>

        {/* Loyalty Progress Card */}
        <div style={{ padding: "18px", background: "var(--card-bg)", borderRadius: "var(--r-xl)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: tierConf.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={18} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)" }}>{tier} Tier</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {tier === "Diamond" ? "Maximum tier reached!" : `${tierConf.max - USER_RIDES} rides to ${tierConf.next}`}
              </p>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 900, color: "var(--text-heading)" }}>{USER_RIDES}/{tierConf.max}</span>
          </div>
          <div style={{ width: "100%", height: 8, background: "var(--card-border)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              width: `${tierProgress}%`,
              height: "100%",
              background: tierConf.gradient,
              borderRadius: "99px",
              transition: "width 1s var(--ease)",
              boxShadow: `0 0 8px ${tierConf.color}60`,
            }} />
          </div>
          {tier !== "Diamond" && (
            <p style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginTop: "8px", fontWeight: 500 }}>
              {tierConf.next} benefits: Priority matching, 5% fare discount, dedicated support
            </p>
          )}
        </div>

        {saved && (
          <div className="animate-slide-up" style={{ padding: "12px 16px", background: "var(--success-subtle)", border: "1px solid var(--success-glow)", borderRadius: "var(--r-md)", color: "var(--success)", fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={15} /> Profile saved successfully!
          </div>
        )}

        <SectionCard title="Personal Info">
          <FieldInput label="Full Name" fieldKey="fullName" icon={<Edit3 size={10} />} placeholder="Enter your full name" />
          <FieldInput label="Phone Number" fieldKey="phone" icon={<Phone size={10} />} placeholder="+234 800 000 0000" type="tel" />
          <FieldInput label="Email Address" fieldKey="email" icon={<Mail size={10} />} placeholder="your@email.com" type="email" />
        </SectionCard>

        <SectionCard title="Saved Addresses">
          <FieldInput label="Home Address" fieldKey="homeAddress" icon={<MapPin size={10} />} placeholder="Add your home address" />
          <FieldInput label="Work Address" fieldKey="workAddress" icon={<Briefcase size={10} />} placeholder="Add your work address" />
        </SectionCard>

        <SectionCard
          title={<><AlertTriangle size={10} style={{ color: "var(--danger)" }} /> Emergency Contact</>}
          titleColor="var(--danger)"
          borderColor="rgba(239,68,68,0.18)"
          bg="rgba(239,68,68,0.03)"
        >
          <FieldInput label="Contact Name" fieldKey="emergencyName" icon={<Edit3 size={10} />} placeholder="Emergency contact name" />
          <FieldInput label="Contact Phone" fieldKey="emergencyPhone" icon={<Phone size={10} />} placeholder="+234 800 000 0000" type="tel" />
        </SectionCard>

        {/* Quick Actions */}
        <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--card-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
          {quickActions.map(({ label, icon: Icon, danger }, i) => (
            <button
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 18px",
                border: "none",
                borderBottom: i < quickActions.length - 1 ? "1px solid var(--card-border)" : "none",
                background: "var(--bg-secondary)",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontFamily: "var(--font)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = danger ? "rgba(239,68,68,0.04)" : "var(--primary-subtle)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: danger ? "rgba(239,68,68,0.08)" : "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={15} style={{ color: danger ? "var(--danger)" : "var(--primary)" }} />
                </div>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: danger ? "var(--danger)" : "var(--text-heading)" }}>{label}</span>
              </div>
              <ChevronRight size={16} style={{ color: "var(--text-faint)" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
