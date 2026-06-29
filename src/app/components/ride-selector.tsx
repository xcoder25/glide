"use client";

import React, { useState } from "react";
import { User, Zap, Crown, Users, CreditCard, ChevronRight, Check, Calendar, TrendingUp } from "lucide-react";

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
  tagColor?: string;
}

const CATEGORIES: RideCategory[] = [
  {
    id: "standard",
    name: "Glide Lite",
    description: "Affordable everyday rides around Uyo",
    basePrice: 600,
    perMilePrice: 150,
    etaMinutes: 3,
    capacity: 4,
    icon: <Zap size={20} />,
    tag: "Popular",
    tagColor: "var(--primary)",
  },
  {
    id: "comfort",
    name: "Glide Ride",
    description: "Standard town rides with air conditioning",
    basePrice: 1000,
    perMilePrice: 250,
    etaMinutes: 2,
    capacity: 4,
    icon: <User size={20} />,
    tagColor: "var(--sky)",
  },
  {
    id: "executive",
    name: "Glide Premium",
    description: "Premium sedans for maximum comfort",
    basePrice: 2000,
    perMilePrice: 450,
    etaMinutes: 4,
    capacity: 4,
    icon: <Crown size={20} />,
    tag: "Premium",
    tagColor: "#F59E0B",
  },
  {
    id: "max",
    name: "Glide XL",
    description: "Spacious minivans for group travel",
    basePrice: 1800,
    perMilePrice: 380,
    etaMinutes: 5,
    capacity: 6,
    icon: <Users size={20} />,
    tagColor: "var(--success)",
  },
  {
    id: "share",
    name: "Glide Share",
    description: "Pool with others heading the same way",
    basePrice: 400,
    perMilePrice: 90,
    etaMinutes: 6,
    capacity: 3,
    icon: <Users size={20} />,
    tag: "Save 40%",
    tagColor: "#00c896",
  },
];

interface RideSelectorProps {
  distanceMiles: number;
  promoApplied?: string | null;
  surgeMultiplier?: number;
  onBookRide: (category: RideCategory, price: number) => void;
  onSchedule?: (category: RideCategory, price: number) => void;
  onCarpoolSelect?: (category: RideCategory, price: number) => void;
}

export default function RideSelector({ distanceMiles, promoApplied = null, surgeMultiplier = 1, onBookRide, onSchedule, onCarpoolSelect }: RideSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>("standard");

  const SURGE_CATEGORIES = ["standard", "comfort"];

  const calculatePrice = (cat: RideCategory) => {
    const baseCalc = cat.basePrice + cat.perMilePrice * distanceMiles;
    const surge = SURGE_CATEGORIES.includes(cat.id) && cat.id !== "share" ? surgeMultiplier : 1;
    const originalPrice = baseCalc * surge;
    let finalPrice = originalPrice;

    if (promoApplied === "GLIDE10") finalPrice = originalPrice * 0.9;
    else if (promoApplied === "FRIDAY20") finalPrice = originalPrice * 0.8;
    else if (promoApplied === "WELCOME") finalPrice = Math.max(0, originalPrice - 500);
    else if (promoApplied === "LAGOS50") finalPrice = Math.max(0, originalPrice - 50);
    else if (promoApplied === "WELCOME50") finalPrice = originalPrice * 0.5;
    else if (promoApplied === "GLIDE100") finalPrice = Math.max(0, originalPrice - 100);
    else if (promoApplied === "FESTIVE") finalPrice = originalPrice * 0.75;

    const basePriceNoSurge = baseCalc;

    return {
      original: parseFloat(basePriceNoSurge.toFixed(2)),
      surged: parseFloat(originalPrice.toFixed(2)),
      final: parseFloat(finalPrice.toFixed(2)),
      hasSurge: surge > 1,
    };
  };

  const selectedCategory = CATEGORIES.find((cat) => cat.id === selectedId) || CATEGORIES[0];
  const totalPrice = calculatePrice(selectedCategory).final;

  const getTierColor = (id: string) => {
    switch (id) {
      case "standard": return "var(--primary)";
      case "comfort": return "var(--sky)";
      case "executive": return "#F59E0B";
      case "max": return "var(--success)";
      default: return "var(--primary)";
    }
  };

  const getTierSubtle = (id: string) => {
    switch (id) {
      case "standard": return "var(--primary-subtle)";
      case "comfort": return "var(--sky-subtle)";
      case "executive": return "rgba(245,158,11,0.08)";
      case "max": return "var(--success-subtle)";
      default: return "var(--primary-subtle)";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "310px", overflowY: "auto", paddingRight: "2px" }}>
        {CATEGORIES.map((cat) => {
          const price = calculatePrice(cat);
          const isSelected = cat.id === selectedId;
          const tierColor = getTierColor(cat.id);
          const tierSubtle = getTierSubtle(cat.id);
          const isShare = cat.id === "share";

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedId(cat.id)}
              className={`tier-${cat.id}${isSelected ? " glass-card-active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                border: `1.5px solid ${isSelected ? tierColor : "var(--card-border)"}`,
                background: isSelected ? tierSubtle : "var(--card-bg)",
                cursor: "pointer",
                transition: "all 0.22s var(--ease)",
                position: "relative",
                boxShadow: isSelected ? `0 4px 20px ${tierColor}22` : "var(--shadow-sm)",
              }}
            >
              {/* Tag Badge */}
              {cat.tag && (
                <span style={{
                  position: "absolute",
                  top: "-9px",
                  right: "14px",
                  background: isSelected ? tierColor : "var(--bg-secondary)",
                  color: isSelected ? "#fff" : "var(--text-muted)",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "99px",
                  border: `1px solid ${isSelected ? "transparent" : "var(--card-border-strong)"}`,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  zIndex: 1,
                  boxShadow: isSelected ? `0 2px 8px ${tierColor}30` : "none",
                  transition: "all 0.22s",
                }}>
                  {cat.tag}
                </span>
              )}

              {/* Surge Badge */}
              {price.hasSurge && !isShare && (
                <span style={{
                  position: "absolute",
                  top: "-9px",
                  left: "14px",
                  background: "var(--amber)",
                  color: "#000",
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  padding: "2px 8px",
                  borderRadius: "99px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}>
                  <TrendingUp size={8} /> {surgeMultiplier.toFixed(1)}× Surge
                </span>
              )}

              {/* Left Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "46px",
                  height: "46px",
                  borderRadius: "13px",
                  background: isSelected ? tierColor : "var(--card-border)",
                  color: isSelected ? "#fff" : "var(--text-muted)",
                  transition: "all 0.22s var(--ease)",
                  boxShadow: isSelected ? `0 4px 14px ${tierColor}30` : "none",
                }}>
                  {cat.icon}
                </div>

                <div>
                  <p style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>{cat.name}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px", fontWeight: 500 }}>{cat.description}</p>
                  <div style={{ display: "flex", gap: "8px", fontSize: "0.67rem", fontWeight: 700, marginTop: "4px", color: isSelected ? tierColor : "var(--text-faint)" }}>
                    <span>⏱ {cat.etaMinutes} min ETA</span>
                    <span>·</span>
                    <span>👥 {cat.capacity} seats</span>
                  </div>
                </div>
              </div>

              {/* Right Price */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {price.hasSurge && !isShare && (
                  <div style={{ fontSize: "0.7rem", textDecoration: "line-through", color: "var(--text-faint)", fontWeight: 500 }}>
                    ₦{price.original.toLocaleString()}
                  </div>
                )}
                {!price.hasSurge && price.final !== price.surged && (
                  <div style={{ fontSize: "0.75rem", textDecoration: "line-through", color: "var(--text-faint)", fontWeight: 500 }}>
                    ₦{price.surged.toLocaleString()}
                  </div>
                )}
                <div style={{
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  color: isSelected ? tierColor : "var(--text-heading)",
                  letterSpacing: "-0.02em",
                  transition: "color 0.22s",
                }}>
                  ₦{price.final.toLocaleString()}
                </div>
                {isSelected && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "3px", marginTop: "2px" }}>
                    <Check size={11} style={{ color: tierColor }} />
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: tierColor }}>Selected</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Surge notice */}
      {surgeMultiplier > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", background: "rgba(245,158,11,0.08)", borderRadius: "var(--r-md)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <TrendingUp size={14} style={{ color: "var(--amber)", flexShrink: 0 }} />
          <p style={{ fontSize: "0.75rem", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.5 }}>
            <strong style={{ color: "var(--amber)" }}>{surgeMultiplier.toFixed(1)}× surge pricing</strong> is active in your area due to high demand. Prices will return to normal soon.
          </p>
        </div>
      )}

      {/* Payment Row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-sm)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "9px", background: "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={15} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)" }}>•••• 4829</p>
            <p style={{ fontSize: "0.65rem", color: "var(--text-faint)", fontWeight: 500 }}>Personal Visa</p>
          </div>
        </div>
        <button style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", fontSize: "0.78rem", fontFamily: "var(--font)", gap: "2px" }}>
          Change <ChevronRight size={14} />
        </button>
      </div>

      {/* Action Buttons Row */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Schedule button */}
        {onSchedule && (
          <button
            onClick={() => onSchedule(selectedCategory, totalPrice)}
            style={{
              flex: 1, padding: "14px",
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border-med)",
              borderRadius: "var(--r-md)",
              color: "var(--text-2)",
              fontFamily: "var(--font)",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-med)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >
            <Calendar size={14} />
            Schedule
          </button>
        )}

        {/* Confirm Button */}
        <button
          onClick={() => {
            if (selectedCategory.id === "share" && onCarpoolSelect) {
              onCarpoolSelect(selectedCategory, totalPrice);
            } else {
              onBookRide(selectedCategory, totalPrice);
            }
          }}
          style={{
            flex: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            padding: "16px 20px",
            background: `linear-gradient(135deg, ${getTierColor(selectedId)} 0%, ${getTierColor(selectedId)}cc 100%)`,
            border: "none",
            borderRadius: "var(--r-md)",
            color: "#fff",
            fontFamily: "var(--font)",
            fontWeight: 800,
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: `0 8px 30px ${getTierColor(selectedId)}35`,
            transition: "all 0.25s var(--ease)",
            minHeight: "54px",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.filter = "brightness(1.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.filter = ""; }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={16} />
            {selectedCategory.id === "share" ? "Find Pool" : `Confirm ${selectedCategory.name}`}
          </span>
          <span style={{
            background: "rgba(255,255,255,0.22)",
            padding: "5px 12px",
            borderRadius: "8px",
            fontSize: "0.88rem",
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}>
            ₦{totalPrice.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
}
