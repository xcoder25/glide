"use client";

import React, { useState } from "react";
import { Moon, Sun, Bell, BellOff, Globe, Shield, HelpCircle, Info, ChevronRight, Check } from "lucide-react";

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

interface SettingsScreenProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  appVersion?: string;
}

const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"];

const FAQ = [
  { q: "How do I cancel a ride?", a: "You can cancel a ride any time before the driver arrives by tapping 'Cancel Ride' on the Live Ride screen. A small fee may apply after the driver has been waiting." },
  { q: "How is fare calculated?", a: "Fares are based on the vehicle tier, base rate, and distance. During peak hours, dynamic pricing may apply." },
  { q: "How do I add a promo code?", a: "Go to Payment → Promos and enter your code. Valid codes will automatically apply to your next ride." },
  { q: "Is my payment info secure?", a: "Yes. All card data is encrypted with AES-256. We never store full card numbers on our servers." },
];

export default function SettingsScreen({ settings, onSettingsChange, appVersion = "2.4.1" }: SettingsScreenProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  const toggle = (key: keyof AppSettings) => {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  };

  const ToggleSwitch = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      style={{
        width: 48,
        height: 26,
        borderRadius: 99,
        border: "none",
        background: on ? "var(--primary)" : "rgba(0,0,0,0.12)",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 3,
        left: on ? "calc(100% - 23px)" : 3,
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.25s ease",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>{title}</p>
      <div style={{ borderRadius: "16px", border: "1px solid var(--card-border)", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ icon, label, right, onClick, danger }: { icon: React.ReactNode; label: string; right: React.ReactNode; onClick?: () => void; danger?: boolean }) => (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 18px",
        background: "rgba(0,0,0,0.015)",
        border: "none",
        borderBottom: "1px solid var(--card-border)",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font-sans)",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.015)"; }}
    >
      <span style={{ color: danger ? "#dc2626" : "var(--primary)", flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, color: danger ? "#dc2626" : "var(--text-main)", textAlign: "left" }}>{label}</span>
      {right}
    </button>
  );

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", padding: "28px 24px 100px 24px", gap: "24px" }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Settings</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>Customize your Glide experience</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row
          icon={settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
          label="Dark Mode"
          onClick={() => toggle("darkMode")}
          right={<ToggleSwitch on={settings.darkMode} onToggle={() => toggle("darkMode")} />}
        />
        <Row
          icon={<Globe size={18} />}
          label="Language"
          onClick={() => setLangOpen(!langOpen)}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>{settings.language}</span>
              <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
            </div>
          }
        />
        {langOpen && (
          <div style={{ borderBottom: "1px solid var(--card-border)" }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => { onSettingsChange({ ...settings, language: lang }); setLangOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "12px 18px 12px 52px",
                  border: "none",
                  borderBottom: "1px solid var(--card-border)",
                  background: lang === settings.language ? "rgba(217,95,0,0.05)" : "rgba(0,0,0,0.01)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  color: lang === settings.language ? "var(--primary)" : "var(--text-main)",
                  fontWeight: lang === settings.language ? 700 : 500,
                  transition: "background 0.15s",
                }}
              >
                {lang}
                {lang === settings.language && <Check size={15} color="var(--primary)" />}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row
          icon={settings.notifications ? <Bell size={18} /> : <BellOff size={18} />}
          label="Push Notifications"
          onClick={() => toggle("notifications")}
          right={<ToggleSwitch on={settings.notifications} onToggle={() => toggle("notifications")} />}
        />
        <Row
          icon={<Bell size={18} />}
          label="Ride Updates"
          right={<ToggleSwitch on={settings.notifications} onToggle={() => {}} />}
        />
        <Row
          icon={<Bell size={18} />}
          label="Promo Alerts"
          right={<ToggleSwitch on={false} onToggle={() => {}} />}
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security">
        <Row icon={<Shield size={18} />} label="Privacy Policy" right={<ChevronRight size={16} style={{ color: "var(--text-muted)" }} />} onClick={() => {}} />
        <Row icon={<Shield size={18} />} label="Terms of Service" right={<ChevronRight size={16} style={{ color: "var(--text-muted)" }} />} onClick={() => {}} />
        <Row icon={<Shield size={18} />} label="Data & Location" right={<ChevronRight size={16} style={{ color: "var(--text-muted)" }} />} onClick={() => {}} />
      </Section>

      {/* Help & Support */}
      <Section title="Help & Support">
        <div>
          {FAQ.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid var(--card-border)" }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 18px",
                  width: "100%",
                  border: "none",
                  background: openFaq === i ? "rgba(217,95,0,0.04)" : "rgba(0,0,0,0.015)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <HelpCircle size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: "var(--text-main)" }}>{item.q}</span>
                <ChevronRight
                  size={16}
                  style={{
                    color: "var(--text-muted)",
                    transform: openFaq === i ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                />
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 18px 16px 46px", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          icon={<Info size={18} />}
          label="About Glide"
          right={
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>v{appVersion}</span>
          }
        />
        <Row
          icon={<Info size={18} />}
          label="Rate the App"
          right={<ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
          onClick={() => {}}
        />
      </Section>
    </div>
  );
}
