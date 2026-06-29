"use client";

import React, { useState } from "react";
import {
  Moon, Sun, Bell, BellOff, Globe, Shield, HelpCircle, Info,
  ChevronRight, Check, Lock, Volume2, VolumeX, Wifi, MessageSquare, Key, Send, X,
} from "lucide-react";

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
  sound: boolean;
  saveData: boolean;
}

interface SettingsScreenProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  appVersion?: string;
}

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"];

const FAQ = [
  { q: "How do I cancel a ride?", a: "You can cancel any time before the driver arrives by tapping 'Cancel Ride' on the Live Ride screen. A reason picker will appear. A small fee may apply after the driver has been waiting more than 5 minutes." },
  { q: "How is fare calculated?", a: "Fares are based on the vehicle tier, base rate, and distance. During peak hours, dynamic pricing may apply. You can see the full breakdown in your ride receipt." },
  { q: "How do I add a promo code?", a: "Go to Payment → Promos and enter your code. Valid codes will automatically apply to your next ride. You can also one-tap apply from the Available Offers list." },
  { q: "Is my payment info secure?", a: "Yes. All card data is encrypted with AES-256. We never store full card numbers on our servers. Your wallet transactions are also fully encrypted end-to-end." },
  { q: "How do I report an issue?", a: "Use the Feedback button below or contact support@glide.ng. For urgent safety issues, use the SOS button during an active ride to alert our safety team immediately." },
];

export default function SettingsScreen({ settings, onSettingsChange, appVersion = "2.4.1" }: SettingsScreenProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinStep, setPinStep] = useState<"current" | "new" | "confirm">("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const toggle = (key: keyof AppSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const handleFeedbackSend = () => {
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedbackText(""); }, 2000);
  };

  const handlePinChange = () => {
    if (pinStep === "current") {
      if (currentPin.length < 4) { setPinMsg({ type: "error", text: "PIN must be at least 4 digits" }); return; }
      setPinMsg(null); setPinStep("new");
    } else if (pinStep === "new") {
      if (newPin.length < 4) { setPinMsg({ type: "error", text: "New PIN must be at least 4 digits" }); return; }
      setPinMsg(null); setPinStep("confirm");
    } else {
      if (newPin !== confirmPin) { setPinMsg({ type: "error", text: "PINs don't match" }); return; }
      setPinMsg({ type: "success", text: "PIN changed successfully!" });
      setTimeout(() => { setShowPinForm(false); setPinStep("current"); setCurrentPin(""); setNewPin(""); setConfirmPin(""); setPinMsg(null); }, 1500);
    }
  };

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      style={{
        width: 48, height: 26,
        borderRadius: 99,
        border: "none",
        background: on ? "var(--primary)" : "var(--card-border-strong)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.25s var(--ease)",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: on ? "calc(100% - 23px)" : 3,
        width: 20, height: 20,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.25s var(--ease)",
        boxShadow: "0 1px 6px rgba(0,0,0,0.2)",
      }} />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <p className="section-header" style={{ marginBottom: "8px", paddingLeft: "4px" }}>{title}</p>
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--card-border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ icon, label, right, onClick, danger, subtitle }: {
    icon: React.ReactNode;
    label: string;
    right: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    subtitle?: string;
  }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "14px 18px",
        background: "var(--bg-secondary)",
        border: "none",
        borderBottom: "1px solid var(--card-border)",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font)",
        transition: "background 0.15s var(--ease)",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = danger ? "rgba(239,68,68,0.04)" : "var(--primary-subtle)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
    >
      <div style={{ width: 34, height: 34, borderRadius: "9px", background: danger ? "rgba(239,68,68,0.08)" : "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: danger ? "var(--danger)" : "var(--primary)" }}>{icon}</span>
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: danger ? "var(--danger)" : "var(--text-heading)", display: "block" }}>{label}</span>
        {subtitle && <span style={{ fontSize: "0.7rem", color: "var(--text-faint)", fontWeight: 500 }}>{subtitle}</span>}
      </div>
      {right}
    </button>
  );

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "28px 24px 100px 24px", gap: "22px" }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Settings</h2>
        <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: 500 }}>Customize your Glide experience</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
          label="Dark Mode"
          subtitle="Switch to a darker theme"
          onClick={() => toggle("darkMode")}
          right={<ToggleSwitch on={settings.darkMode} onToggle={() => toggle("darkMode")} />}
        />
        <Row
          icon={<Globe size={16} />}
          label="Language"
          subtitle={settings.language}
          onClick={() => setLangOpen(!langOpen)}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{settings.language}</span>
              <ChevronRight size={15} style={{ color: "var(--text-faint)", transform: langOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </div>
          }
        />
        {langOpen && (
          <div style={{ borderTop: "1px solid var(--card-border)" }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => { onSettingsChange({ ...settings, language: lang }); setLangOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "12px 18px 12px 66px",
                  border: "none",
                  borderBottom: "1px solid var(--card-border)",
                  background: lang === settings.language ? "var(--primary-subtle)" : "var(--bg-secondary)",
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  fontSize: "0.86rem",
                  color: lang === settings.language ? "var(--primary)" : "var(--text-body)",
                  fontWeight: lang === settings.language ? 800 : 500,
                  transition: "background 0.15s",
                }}
              >
                {lang}
                {lang === settings.language && <Check size={15} style={{ color: "var(--primary)" }} />}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Notifications & Sound */}
      <Section title="Notifications &amp; Sound">
        <Row icon={settings.notifications ? <Bell size={16} /> : <BellOff size={16} />} label="Push Notifications" subtitle="Alerts for ride updates & offers" onClick={() => toggle("notifications")} right={<ToggleSwitch on={settings.notifications} onToggle={() => toggle("notifications")} />} />
        <Row icon={<Bell size={16} />} label="Ride Updates" subtitle="Status changes, driver arrival" right={<ToggleSwitch on={settings.notifications} onToggle={() => {}} />} />
        <Row icon={<Bell size={16} />} label="Promo Alerts" subtitle="New deals and limited offers" right={<ToggleSwitch on={false} onToggle={() => {}} />} />
        <Row
          icon={settings.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          label="Sound &amp; Vibration"
          subtitle="In-app sounds and haptics"
          onClick={() => toggle("sound")}
          right={<ToggleSwitch on={!!settings.sound} onToggle={() => toggle("sound")} />}
        />
      </Section>

      {/* Data & Performance */}
      <Section title="Data &amp; Performance">
        <Row
          icon={<Wifi size={16} />}
          label="Save Data Mode"
          subtitle="Reduces map tile quality on mobile data"
          onClick={() => toggle("saveData")}
          right={<ToggleSwitch on={!!settings.saveData} onToggle={() => toggle("saveData")} />}
        />
      </Section>

      {/* Privacy & Security */}
      <Section title="Privacy &amp; Security">
        <Row icon={<Shield size={16} />} label="Privacy Policy" right={<ChevronRight size={15} style={{ color: "var(--text-faint)" }} />} onClick={() => {}} />
        <Row icon={<Shield size={16} />} label="Terms of Service" right={<ChevronRight size={15} style={{ color: "var(--text-faint)" }} />} onClick={() => {}} />
        <Row
          icon={<Key size={16} />}
          label="Change PIN / Password"
          subtitle="Update your account security"
          right={<ChevronRight size={15} style={{ color: "var(--text-faint)", transform: showPinForm ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
          onClick={() => { setShowPinForm(!showPinForm); setPinStep("current"); setCurrentPin(""); setNewPin(""); setConfirmPin(""); setPinMsg(null); }}
        />
        {showPinForm && (
          <div className="animate-slide-up" style={{ borderTop: "1px solid var(--card-border)", padding: "16px 18px", background: "var(--primary-subtle)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Step {pinStep === "current" ? "1" : pinStep === "new" ? "2" : "3"} of 3 — {pinStep === "current" ? "Enter current PIN" : pinStep === "new" ? "Enter new PIN" : "Confirm new PIN"}
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pinStep === "current" ? currentPin : pinStep === "new" ? newPin : confirmPin}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, "");
                if (pinStep === "current") setCurrentPin(val);
                else if (pinStep === "new") setNewPin(val);
                else setConfirmPin(val);
              }}
              placeholder="••••"
              style={{ padding: "12px 14px", border: "1.5px solid var(--primary-glow)", borderRadius: "var(--r-md)", fontSize: "1.1rem", fontFamily: "var(--font)", background: "var(--bg-secondary)", color: "var(--text-heading)", outline: "none", letterSpacing: "0.3em", fontWeight: 800 }}
            />
            {pinMsg && (
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: pinMsg.type === "success" ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
                {pinMsg.type === "success" ? <Check size={13} /> : <X size={13} />} {pinMsg.text}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowPinForm(false)} className="btn btn-secondary" style={{ flex: 1, padding: "11px", fontSize: "0.84rem" }}>Cancel</button>
              <button onClick={handlePinChange} className="btn btn-primary" style={{ flex: 1, padding: "11px", fontSize: "0.84rem" }}>
                {pinStep === "confirm" ? "Save PIN" : "Next →"}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Help & Support */}
      <Section title="Help &amp; Support">
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid var(--card-border)" }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 18px", width: "100%",
                border: "none",
                background: openFaq === i ? "var(--primary-subtle)" : "var(--bg-secondary)",
                cursor: "pointer", fontFamily: "var(--font)",
                textAlign: "left", transition: "background 0.15s",
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={14} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 700, color: "var(--text-heading)", textAlign: "left" }}>{item.q}</span>
              <ChevronRight size={15} style={{ color: "var(--text-faint)", transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s var(--ease)", flexShrink: 0 }} />
            </button>
            {openFaq === i && (
              <div className="animate-slide-up" style={{ padding: "0 18px 16px 60px", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.65, fontWeight: 500 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}

        {/* Feedback Button */}
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          style={{
            display: "flex", alignItems: "center", gap: "14px",
            padding: "14px 18px", width: "100%",
            border: "none",
            background: "var(--bg-secondary)",
            cursor: "pointer", fontFamily: "var(--font)",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-subtle)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; }}
        >
          <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare size={14} style={{ color: "var(--primary)" }} />
          </div>
          <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 700, color: "var(--text-heading)", textAlign: "left" }}>Share Feedback</span>
          <ChevronRight size={15} style={{ color: "var(--text-faint)", transform: showFeedback ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showFeedback && (
          <div className="animate-slide-up" style={{ borderTop: "1px solid var(--card-border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {feedbackSent ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--success)", fontSize: "0.84rem", fontWeight: 700 }}>
                <Check size={16} /> Thank you for your feedback! 🙏
              </div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="What can we improve? Share your thoughts about Glide..."
                  rows={3}
                  style={{ padding: "12px 14px", border: "1.5px solid var(--card-border-strong)", borderRadius: "var(--r-md)", fontSize: "0.86rem", fontFamily: "var(--font)", color: "var(--text-heading)", background: "var(--bg-secondary)", outline: "none", resize: "none", lineHeight: 1.55, fontWeight: 500, transition: "border-color 0.2s" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
                />
                <button
                  onClick={handleFeedbackSend}
                  disabled={!feedbackText.trim()}
                  className="btn btn-primary"
                  style={{ padding: "11px", fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", opacity: feedbackText.trim() ? 1 : 0.4 }}
                >
                  <Send size={14} /> Send Feedback
                </button>
              </>
            )}
          </div>
        )}
      </Section>

      {/* About */}
      <Section title="About">
        <Row icon={<Info size={16} />} label="About Glide" right={<span style={{ fontSize: "0.78rem", color: "var(--text-faint)", fontWeight: 700, background: "var(--card-border)", padding: "3px 10px", borderRadius: "99px" }}>v{appVersion}</span>} />
        <Row icon={<Info size={16} />} label="Rate the App" subtitle="Love Glide? Give us 5 stars ⭐" right={<ChevronRight size={15} style={{ color: "var(--text-faint)" }} />} onClick={() => {}} />
      </Section>
    </div>
  );
}
