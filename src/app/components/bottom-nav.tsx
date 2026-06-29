"use client";

import React from "react";
import { Home, Clock, CreditCard, User, Settings } from "lucide-react";

export type AppView = "home" | "booking" | "ride" | "payment" | "history" | "profile" | "settings";

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_TABS = [
  { id: "home"    as AppView, icon: Home,       label: "Home"    },
  { id: "history" as AppView, icon: Clock,      label: "Rides"   },
  { id: "payment" as AppView, icon: CreditCard, label: "Wallet"  },
  { id: "profile" as AppView, icon: User,       label: "Me"      },
  { id: "settings" as AppView, icon: Settings,  label: "Settings"},
];

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {NAV_TABS.map(({ id, icon: Icon, label }) => {
        const isActive = currentView === id || (id === "home" && (currentView === "booking" || currentView === "ride"));
        return (
          <button
            key={id}
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            onClick={() => onNavigate(id)}
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
    </nav>
  );
}
