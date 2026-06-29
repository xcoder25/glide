"use client";

import React from "react";
import { Home, Clock, CreditCard, User } from "lucide-react";

export type AppView = "home" | "booking" | "ride" | "payment" | "history" | "profile" | "settings";

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_TABS = [
  { id: "home" as AppView,    icon: Home,       label: "Home"    },
  { id: "history" as AppView, icon: Clock,      label: "Rides"   },
  { id: "payment" as AppView, icon: CreditCard, label: "Payment" },
  { id: "profile" as AppView, icon: User,       label: "Profile" },
];

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {NAV_TABS.map(({ id, icon: Icon, label }) => {
        const isActive = currentView === id;
        return (
          <button
            key={id}
            className={`bottom-nav-item${isActive ? " active" : ""}`}
            onClick={() => onNavigate(id)}
            aria-label={label}
            style={{ gap: isActive ? "5px" : "4px" }}
          >
            <Icon
              size={isActive ? 22 : 20}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
            />
            <span style={{ transition: "all 0.2s", fontWeight: isActive ? 800 : 600 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
