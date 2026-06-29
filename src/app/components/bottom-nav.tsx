"use client";

import React, { useState, useEffect } from "react";
import { Home, Clock, CreditCard, Gift, Settings, Zap } from "lucide-react";

export type AppView = "home" | "booking" | "ride" | "payment" | "history" | "profile" | "settings" | "referral";

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_TABS = [
  { id: "home"     as AppView, icon: Home,       label: "Home"    },
  { id: "history"  as AppView, icon: Clock,      label: "Rides"   },
  { id: "payment"  as AppView, icon: CreditCard, label: "Wallet"  },
  { id: "referral" as AppView, icon: Gift,       label: "Refer"   },
  { id: "settings" as AppView, icon: Settings,   label: "More"    },
];

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsExpanded(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .bottom-nav-container {
          position: fixed;
          bottom: max(env(safe-area-inset-bottom, 0px), 16px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6, 6, 12, 0.90);
          backdrop-filter: blur(28px) saturate(220%);
          -webkit-backdrop-filter: blur(28px) saturate(220%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bottom-nav-container.collapsed {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          cursor: pointer;
          border-color: rgba(255, 82, 0, 0.45);
          box-shadow: 0 8px 30px rgba(255, 82, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }
        .bottom-nav-container.collapsed:hover {
          transform: translateX(-50%) scale(1.06);
          border-color: rgba(255, 82, 0, 0.7);
        }
        .bottom-nav-container.expanded {
          width: calc(100% - 32px);
          max-width: 420px;
          height: 68px;
          border-radius: 30px;
          padding: 8px 10px;
          gap: 4px;
        }
        .tap-pulse-ring {
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          border: 2px solid var(--primary);
          animation: nav-pulse-anim 2.2s infinite;
          pointer-events: none;
        }
        @keyframes nav-pulse-anim {
          0% { transform: scale(1); opacity: 0.85; }
          100% { transform: scale(1.42); opacity: 0; }
        }
      `}} />

      <nav
        className={`bottom-nav-container ${isExpanded ? "expanded" : "collapsed"}`}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        {/* Collapsed State (TAP) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: isExpanded ? 0 : 1,
            pointerEvents: isExpanded ? "none" : "auto",
            transition: "opacity 0.22s var(--ease)",
            zIndex: 5,
          }}
        >
          <div className="tap-pulse-ring" />
          <Zap size={14} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 3px var(--primary-glow))" }} />
          <span style={{ fontSize: "0.58rem", fontWeight: 950, color: "#fff", letterSpacing: "0.08em", marginTop: "1px", fontFamily: "var(--font-display)" }}>TAP</span>
        </div>

        {/* Expanded State (Full Menu) */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
            transition: "opacity 0.28s var(--ease)",
            zIndex: 4,
          }}
        >
          {NAV_TABS.map(({ id, icon: Icon, label }) => {
            const isActive = currentView === id || (id === "home" && (currentView === "booking" || currentView === "ride"));
            return (
              <button
                key={id}
                className={`bottom-nav-item${isActive ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(id);
                }}
                aria-label={label}
              >
                <div className="nav-icon-wrap">
                  <Icon
                    size={isActive ? 20 : 18}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{ transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                  />
                </div>
                <span className="nav-label" style={{ color: isActive ? "var(--primary)" : "var(--text-3)" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
