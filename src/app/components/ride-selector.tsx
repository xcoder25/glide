"use client";

import React, { useState } from "react";
import { User, Zap, Crown, Users, CreditCard, ChevronRight } from "lucide-react";

export interface RideCategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  perMilePrice: number;
  etaMinutes: number;
  capacity: number;
  icon: React.ReactNode;
  tag?: string;
}

const CATEGORIES: RideCategory[] = [
  {
    id: "standard",
    name: "Glide Standard",
    description: "Comfortable sedans for everyday Lagos rides",
    basePrice: 1200,
    perMilePrice: 350,
    etaMinutes: 3,
    capacity: 4,
    icon: <Zap size={20} />,
    tag: "Popular",
  },
  {
    id: "comfort",
    name: "Glide Comfort",
    description: "Premium SUVs with extra legroom & A/C",
    basePrice: 2000,
    perMilePrice: 500,
    etaMinutes: 2,
    capacity: 4,
    icon: <User size={20} />,
  },
  {
    id: "executive",
    name: "Glide Executive",
    description: "Luxury vehicles for top-tier journeys",
    basePrice: 4500,
    perMilePrice: 900,
    etaMinutes: 4,
    capacity: 4,
    icon: <Crown size={20} />,
    tag: "Luxury",
  },
  {
    id: "max",
    name: "Glide Max",
    description: "Spacious 7-seat vans for group travel",
    basePrice: 3000,
    perMilePrice: 650,
    etaMinutes: 5,
    capacity: 6,
    icon: <Users size={20} />,
  },
];

interface RideSelectorProps {
  distanceMiles: number;
  onBookRide: (category: RideCategory, price: number) => void;
}

export default function RideSelector({ distanceMiles, onBookRide }: RideSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("standard");

  const calculatePrice = (cat: RideCategory) => {
    const price = cat.basePrice + cat.perMilePrice * distanceMiles;
    return parseFloat(price.toFixed(2));
  };

  const selectedCategory = CATEGORIES.find((cat) => cat.id === selectedId) || CATEGORIES[0];
  const totalPrice = calculatePrice(selectedCategory);

  const getTierColor = (id: string) => {
    switch (id) {
      case "standard": return "var(--primary)"; // Orange
      case "comfort": return "var(--accent)"; // Green
      case "executive": return "#d97706"; // Amber
      case "max": return "#0f766e"; // Teal
      default: return "var(--primary)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Categories Grid/List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "310px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {CATEGORIES.map((cat) => {
          const price = calculatePrice(cat);
          const isSelected = cat.id === selectedId;
          const tierColor = getTierColor(cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`glass-card-interactive ${isSelected ? "glass-card-active" : ""} tier-${cat.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                position: "relative",
              }}
            >
              {/* Optional Category Tag */}
              {cat.tag && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "16px",
                    background: isSelected ? tierColor : "rgba(0, 0, 0, 0.05)",
                    color: isSelected ? "#ffffff" : "var(--text-muted)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "20px",
                    border: isSelected ? "none" : "1px solid rgba(0, 0, 0, 0.04)",
                    boxShadow: isSelected ? `0 2px 8px ${tierColor}20` : "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    zIndex: 1,
                  }}
                >
                  {cat.tag}
                </span>
              )}

              {/* Left Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                {/* Visual Icon Frame */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: isSelected
                      ? `linear-gradient(135deg, ${tierColor} 0%, rgba(255, 255, 255, 0.2) 100%)`
                      : "rgba(0, 0, 0, 0.02)",
                    border: "1px solid " + (isSelected ? tierColor : "rgba(0, 0, 0, 0.04)"),
                    color: isSelected ? "#ffffff" : "var(--text-muted)",
                    boxShadow: isSelected ? `0 4px 12px ${tierColor}20` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  {cat.icon}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    {cat.description}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: isSelected ? tierColor : "var(--text-dark)",
                      fontWeight: 600,
                      marginTop: "4px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <span>ETA: {cat.etaMinutes} mins</span>
                    <span>•</span>
                    <span>Cap: {cat.capacity} guests</span>
                  </span>
                </div>
              </div>

              {/* Right Price */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: isSelected ? tierColor : "var(--text-main)",
                    textShadow: isSelected ? `0 2px 8px ${tierColor}15` : "none",
                    transition: "all 0.25s ease",
                  }}
                >
                  ₦{price.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Promos Block */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "rgba(0, 0, 0, 0.015)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-main)" }}>
          <CreditCard size={18} style={{ color: "var(--primary)" }} />
          <span style={{ fontWeight: 600 }}>•••• 4829</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(Personal)</span>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: "0.8rem",
            letterSpacing: "0.02em",
          }}
        >
          Add Promo <ChevronRight size={14} />
        </button>
      </div>

      {/* Book Button */}
      <button
        onClick={() => onBookRide(selectedCategory, totalPrice)}
        className="btn btn-primary"
        style={{
          fontSize: "1.05rem",
          padding: "16px",
          background: `linear-gradient(135deg, var(--primary) 0%, ${getTierColor(selectedId)} 100%)`,
          boxShadow: `0 8px 30px ${getTierColor(selectedId)}25`,
        }}
      >
        Confirm Book {selectedCategory.name} • ₦{totalPrice.toLocaleString()}
      </button>
    </div>
  );
}
