"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, Navigation2, Search, Wallet, LayoutGrid, Bell } from "lucide-react";

interface Step {
  id: number;
  title: string;
  subtitle: string;
  highlight: string; // CSS selector or zone description for the tooltip position
  position: "top" | "bottom" | "center";
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Your Live Map 🗺️",
    subtitle: "The full-screen map shows your location, driver position, and route in real time.",
    highlight: "map",
    position: "bottom",
    icon: <Navigation2 size={22} />,
  },
  {
    id: 2,
    title: "Search Destinations 🔍",
    subtitle: "Type any location in Uyo to instantly find it. You can also tap popular places below.",
    highlight: "search",
    position: "bottom",
    icon: <Search size={22} />,
  },
  {
    id: 3,
    title: "Book a Ride 🚗",
    subtitle: "Tap 'Book a Ride' to choose pickup & dropoff, pick your ride type, and confirm instantly.",
    highlight: "book",
    position: "top",
    icon: <Navigation2 size={22} />,
  },
  {
    id: 4,
    title: "Navigate the App ⚡",
    subtitle: "Use the bottom bar to access Ride History, Wallet, Referrals, and Settings at any time.",
    highlight: "nav",
    position: "top",
    icon: <LayoutGrid size={22} />,
  },
  {
    id: 5,
    title: "Your Wallet 💳",
    subtitle: "Top up your Glide Wallet, add cards, and track all your transactions in the Wallet tab.",
    highlight: "wallet",
    position: "top",
    icon: <Wallet size={22} />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOOLTIP_POSITIONS: Record<string, React.CSSProperties> = {
  map:    { top: "18%", left: "16px", right: "16px", margin: "0 auto" },
  search: { top: "38%", left: "16px", right: "16px", margin: "0 auto" },
  book:   { bottom: "28%", left: "16px", right: "16px", margin: "0 auto" },
  nav:    { bottom: "18%", left: "16px", right: "16px", margin: "0 auto" },
  wallet: { bottom: "22%", left: "16px", right: "16px", margin: "0 auto" },
};

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const advance = useCallback(() => {
    if (animating) return;
    if (isLast) { onComplete(); return; }
    setAnimating(true);
    setTimeout(() => { setStep(s => s + 1); setAnimating(false); }, 250);
  }, [animating, isLast, onComplete]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") advance();
      if (e.key === "Escape") onComplete();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, onComplete]);

  const tooltipStyle = TOOLTIP_POSITIONS[current.highlight] || { top: "30%", left: "16px", right: "16px", margin: "0 auto" };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 9999, pointerEvents: "auto" }}>
      {/* Dark overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(2px)" }} />

      {/* Spotlight circle on the highlighted area */}
      <div style={{
        position: "absolute",
        ...getSpotlightStyle(current.highlight),
        borderRadius: "50%",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
        border: "3px solid var(--primary)",
        animation: "pulse-ring 2.5s infinite",
        pointerEvents: "none",
      }} />

      {/* Tooltip Card */}
      <div
        style={{
          position: "absolute",
          width: "calc(100% - 48px)",
          maxWidth: 380,
          ...tooltipStyle,
          background: "var(--bg-surface)",
          borderRadius: "var(--r-xl)",
          padding: "22px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px var(--border-med)",
          animation: animating ? "fade-in 0.25s var(--ease)" : "slide-up 0.35s var(--ease-spring) both",
          pointerEvents: "auto",
        }}
      >
        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 22 : 7, height: 7, borderRadius: "99px",
                background: i === step ? "var(--primary)" : i < step ? "var(--primary-glow)" : "var(--border)",
                transition: "all 0.3s var(--ease)",
              }} />
            ))}
          </div>
          <button
            onClick={onComplete}
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", fontFamily: "var(--font)", fontSize: "0.75rem", fontWeight: 600, padding: "4px 8px" }}
          >
            Skip tour
          </button>
        </div>

        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: "16px",
          background: "linear-gradient(135deg, var(--primary), var(--amber))",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", marginBottom: "14px",
          boxShadow: "var(--shadow-primary)",
        }}>
          {current.icon}
        </div>

        {/* Content */}
        <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>
          {current.title}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-2)", lineHeight: 1.65, fontWeight: 500, marginBottom: "20px" }}>
          {current.subtitle}
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Back
            </button>
          )}
          <button
            onClick={advance}
            className="btn btn-primary"
            style={{ flex: 2, gap: "8px" }}
          >
            {isLast ? (
              <>🚀 Let's Go!</>
            ) : (
              <>Next <ChevronRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function getSpotlightStyle(highlight: string): React.CSSProperties {
  const base: Record<string, React.CSSProperties> = {
    map:    { top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 120, height: 120 },
    search: { top: "48%", left: "50%", transform: "translate(-50%, -50%)", width: 200, height: 54 },
    book:   { bottom: "22%", left: "50%", transform: "translateX(-50%)", width: 180, height: 52 },
    nav:    { bottom: "6%", left: "50%", transform: "translateX(-50%)", width: 280, height: 60 },
    wallet: { bottom: "6%", left: "50%", transform: "translateX(-50%)", width: 80, height: 60 },
  };
  return base[highlight] || { top: "50%", left: "50%", width: 100, height: 100 };
}
