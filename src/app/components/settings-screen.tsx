"use client";

import React, { useState } from "react";
import {
  Moon, Sun, Bell, BellOff, Globe, Shield, HelpCircle, Info,
  ChevronRight, Check, Lock, Volume2, VolumeX, Wifi, MessageSquare, Key, Send, X,
  Car, BarChart2,
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
  onEnterDriverMode?: () => void;
  onOpenAdmin?: () => void;
  driverStatus: "not_enrolled" | "pending" | "approved";
  onEnrollDriver?: () => void;
}

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"];

const FAQ = [
  { q: "How do I cancel a ride?", a: "You can cancel any time before the driver arrives by tapping 'Cancel Ride' on the Live Ride screen. A reason picker will appear. A small fee may apply after the driver has been waiting more than 5 minutes." },
  { q: "How is fare calculated?", a: "Fares are based on the vehicle tier, base rate, and distance. During peak hours, dynamic pricing may apply. You can see the full breakdown in your ride receipt." },
  { q: "How do I add a promo code?", a: "Go to Payment → Promos and enter your code. Valid codes will automatically apply to your next ride. You can also one-tap apply from the Available Offers list." },
  { q: "Is my payment info secure?", a: "Yes. All card data is encrypted with AES-256. We never store full card numbers on our servers. Your wallet transactions are also fully encrypted end-to-end." },
  { q: "How do I report an issue?", a: "Use the Feedback button below or contact support@glide.ng. For urgent safety issues, use the SOS button during an active ride to alert our safety team immediately." },
];

export default function SettingsScreen({ settings, onSettingsChange, appVersion = "2.4.1", onEnterDriverMode, onOpenAdmin, driverStatus, onEnrollDriver }: SettingsScreenProps) {
  const [showPendingModal, setShowPendingModal] = useState(false);
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
  const [versionTaps, setVersionTaps] = useState(0);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

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
      className="toggle-track"
      data-on={on}
    >
      <div className="toggle-thumb" />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <p className="section-header" style={{ marginBottom: "8px", paddingLeft: "4px" }}>{title}</p>
      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border)", overflow: "hidden" }}>
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
        background: "var(--bg-surface)",
        border: "none",
        borderBottom: "1px solid var(--border)",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font)",
        transition: "background 0.15s var(--ease)",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = danger ? "var(--red-dim)" : "var(--bg-elevated)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-surface)"; }}
    >
      <div style={{ width: 34, height: 34, borderRadius: "9px", background: danger ? "var(--red-dim)" : "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: danger ? "var(--red)" : "var(--primary)" }}>{icon}</span>
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: danger ? "var(--red)" : "var(--text-1)", display: "block" }}>{label}</span>
        {subtitle && <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>{subtitle}</span>}
      </div>
      {right}
    </button>
  );

  return (
    <div className="full-screen animate-screen-in">

      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Settings</h2>
      </div>

      <div className="full-screen-scroll safe-bottom">
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>

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
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-3)", fontWeight: 600 }}>{settings.language}</span>
                  <ChevronRight size={15} style={{ color: "var(--text-4)", transform: langOpen ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                </div>
              }
            />
            {langOpen && (
              <div style={{ borderTop: "1px solid var(--border)" }}>
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
                      borderBottom: "1px solid var(--border)",
                      background: lang === settings.language ? "var(--primary-dim)" : "var(--bg-surface)",
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      fontSize: "0.86rem",
                      color: lang === settings.language ? "var(--primary)" : "var(--text-2)",
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
            <Row icon={<Shield size={16} />} label="Privacy Policy" right={<ChevronRight size={15} style={{ color: "var(--text-4)" }} />} onClick={() => {}} />
            <Row icon={<Shield size={16} />} label="Terms of Service" right={<ChevronRight size={15} style={{ color: "var(--text-4)" }} />} onClick={() => {}} />
            <Row
              icon={<Key size={16} />}
              label="Change PIN / Password"
              subtitle="Update your account security"
              right={<ChevronRight size={15} style={{ color: "var(--text-4)", transform: showPinForm ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
              onClick={() => { setShowPinForm(!showPinForm); setPinStep("current"); setCurrentPin(""); setNewPin(""); setConfirmPin(""); setPinMsg(null); }}
            />
            {showPinForm && (
              <div className="animate-slide-up" style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", background: "var(--bg-elevated)", display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  style={{ padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "1.1rem", fontFamily: "var(--font-display)", background: "var(--bg-surface)", color: "var(--text-1)", outline: "none", letterSpacing: "0.3em", fontWeight: 800 }}
                />
                {pinMsg && (
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: pinMsg.type === "success" ? "var(--green)" : "var(--red)", display: "flex", alignItems: "center", gap: "6px" }}>
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
              <div key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 18px", width: "100%",
                    border: "none",
                    background: openFaq === i ? "var(--bg-elevated)" : "var(--bg-surface)",
                    cursor: "pointer", fontFamily: "var(--font)",
                    textAlign: "left", transition: "background 0.15s",
                  }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <HelpCircle size={14} style={{ color: "var(--primary)" }} />
                  </div>
                  <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 700, color: "var(--text-1)", textAlign: "left" }}>{item.q}</span>
                  <ChevronRight size={15} style={{ color: "var(--text-4)", transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s var(--ease)", flexShrink: 0 }} />
                </button>
                {openFaq === i && (
                  <div className="animate-slide-up" style={{ padding: "12px 18px 16px 56px", fontSize: "0.8rem", color: "var(--text-2)", lineHeight: 1.6, fontWeight: 500, background: "var(--bg-elevated)" }}>
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
                background: "var(--bg-surface)",
                cursor: "pointer", fontFamily: "var(--font)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-surface)"; }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MessageSquare size={14} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ flex: 1, fontSize: "0.86rem", fontWeight: 700, color: "var(--text-1)", textAlign: "left" }}>Share Feedback</span>
              <ChevronRight size={15} style={{ color: "var(--text-4)", transform: showFeedback ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {showFeedback && (
              <div className="animate-slide-up" style={{ borderTop: "1px solid var(--border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px", background: "var(--bg-elevated)" }}>
                {feedbackSent ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--green)", fontSize: "0.84rem", fontWeight: 700 }}>
                    <Check size={16} /> Thank you for your feedback! 🙏
                  </div>
                ) : (
                  <>
                    <textarea
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="What can we improve? Share your thoughts..."
                      rows={3}
                      style={{ padding: "12px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.86rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-surface)", outline: "none", resize: "none", lineHeight: 1.5, fontWeight: 500 }}
                      onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
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

          <Section title="About">
            <Row
              icon={<Info size={16} />}
              label="About Glide"
              right={
                <button
                  onClick={() => {
                    const next = versionTaps + 1;
                    setVersionTaps(next);
                    if (next >= 5) {
                      setAdminUnlocked(true);
                      setVersionTaps(0);
                      onOpenAdmin?.();
                    }
                  }}
                  style={{ fontSize: "0.78rem", fontWeight: 700, background: adminUnlocked ? "var(--primary-dim)" : "var(--border-strong)", padding: "3px 10px", borderRadius: "99px", border: adminUnlocked ? "1px solid var(--primary-glow)" : "none", cursor: "pointer", fontFamily: "var(--font)", color: adminUnlocked ? "var(--primary)" : "var(--text-3)" }}
                >
                  {adminUnlocked ? "🔓 Admin" : `v${appVersion}`}
                </button>
              }
            />
            <Row icon={<Info size={16} />} label="Rate the App" subtitle="Give us 5 stars on store ⭐" right={<ChevronRight size={15} style={{ color: "var(--text-4)" }} />} onClick={() => {}} />
          </Section>

          {/* Developer / Demo Mode */}
          <Section title="Driver Controls">
            <Row
              icon={<Car size={16} />}
              label="Switch to Driver Mode"
              subtitle={
                driverStatus === "not_enrolled" ? "Tap to enroll & apply to drive" :
                driverStatus === "pending" ? "Application under operator review" :
                "Simulate the driver experience"
              }
              right={
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "99px",
                    background: 
                      driverStatus === "approved" ? "rgba(0,200,150,0.15)" : 
                      driverStatus === "pending" ? "var(--primary-dim)" : 
                      "var(--border-strong)",
                    color: 
                      driverStatus === "approved" ? "#00c896" : 
                      driverStatus === "pending" ? "var(--primary)" : 
                      "var(--text-3)",
                    border: `1px solid ${
                      driverStatus === "approved" ? "rgba(0,200,150,0.25)" : 
                      driverStatus === "pending" ? "var(--primary-glow)" : 
                      "transparent"
                    }`
                  }}>
                    {driverStatus === "approved" ? "🟢 Approved" : driverStatus === "pending" ? "⏳ Pending" : "Apply"}
                  </span>
                  <ChevronRight size={15} style={{ color: "var(--text-4)" }} />
                </div>
              }
              onClick={() => {
                if (driverStatus === "not_enrolled") {
                  onEnrollDriver?.();
                } else if (driverStatus === "pending") {
                  setShowPendingModal(true);
                } else {
                  onEnterDriverMode?.();
                }
              }}
            />
            {adminUnlocked && (
              <Row
                icon={<BarChart2 size={16} />}
                label="Open Admin Dashboard"
                subtitle="Operator view · Demo data"
                right={<ChevronRight size={15} style={{ color: "var(--text-4)" }} />}
                onClick={onOpenAdmin}
              />
            )}
          </Section>
        </div>
      </div>

      {/* ═══ APPLICATION PENDING MODAL ═══ */}
      {showPendingModal && (
        <div className="modal-overlay" onClick={() => setShowPendingModal(false)}>
          <div className="modal-sheet animate-modal-pop" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ padding: "8px 0 0 0", textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", animation: "heartbeat 2s infinite" }}>
                <Car size={24} style={{ color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>Application Under Review</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-3)", lineHeight: 1.6, marginBottom: "20px" }}>
                Your driver profile is currently pending verification. Uyo operators verify license details, plate numbers, and payout accounts to maintain premium safety. Your status will update automatically upon approval.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setShowPendingModal(false)} className="btn btn-primary" style={{ flex: 1 }}>Got it</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
