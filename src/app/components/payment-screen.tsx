"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, Banknote, Clock, Tag, Plus, Check, X, ChevronRight, ArrowDownLeft, ArrowUpRight } from "lucide-react";

export interface WalletTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
}

export interface PaymentState {
  walletBalance: number;
  preferCash: boolean;
  activeCard: string;
  transactions: WalletTransaction[];
  promoApplied: string | null;
}

interface PaymentScreenProps {
  payment: PaymentState;
  onPaymentChange: (p: PaymentState) => void;
}

const PROMO_CODES: Record<string, { discount: number; desc: string; expiry: string }> = {
  "GLIDE10":  { discount: 10,  desc: "10% off your next ride",   expiry: "Jul 15, 2026" },
  "LAGOS50":  { discount: 50,  desc: "₦50 off first ride",        expiry: "Jul 31, 2026" },
  "WELCOME":  { discount: 500, desc: "₦500 new user bonus",       expiry: "Aug 1, 2026"  },
  "FRIDAY20": { discount: 20,  desc: "20% off Friday rides",      expiry: "Every Friday" },
};

const SAVED_CARDS = [
  { id: "visa-4829",   brand: "Visa",       last4: "4829", expiry: "08/26", from: "#1a1a6b", to: "#2d2db3" },
  { id: "mc-7721",    brand: "Mastercard", last4: "7721", expiry: "03/27", from: "#7f1d1d", to: "#991b1b" },
];

export default function PaymentScreen({ payment, onPaymentChange }: PaymentScreenProps) {
  const [tab, setTab] = useState<"wallet" | "cards" | "cash" | "history" | "promos">("wallet");
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePromo = () => {
    const code = promoInput.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (promo) {
      onPaymentChange({ ...payment, promoApplied: code });
      setPromoMsg({ type: "success", text: `Code applied! ${promo.desc}` });
    } else {
      setPromoMsg({ type: "error", text: "Invalid or expired promo code." });
    }
    setTimeout(() => setPromoMsg(null), 3000);
  };

  const handleTopUp = (amount: number) => {
    onPaymentChange({
      ...payment,
      walletBalance: payment.walletBalance + amount,
      transactions: [{
        id: `tx-${Date.now()}`,
        date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
        description: "Wallet Top-up",
        amount,
        type: "credit",
      }, ...payment.transactions],
    });
  };

  const TABS = [
    { id: "wallet",  icon: Wallet,     label: "Wallet"  },
    { id: "cards",   icon: CreditCard, label: "Cards"   },
    { id: "cash",    icon: Banknote,   label: "Cash"    },
    { id: "history", icon: Clock,      label: "History" },
    { id: "promos",  icon: Tag,        label: "Promos"  },
  ] as const;

  return (
    <div className="animate-slide-right" style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Header */}
      <div style={{ padding: "28px 24px 20px 24px" }}>
        <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Payment</h2>
        <p style={{ fontSize: "0.77rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: 500 }}>Manage your payment methods &amp; wallet</p>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ marginTop: "20px", overflowX: "auto" }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`tab-item${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
              style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

        {/* ── WALLET ── */}
        {tab === "wallet" && (
          <>
            {/* Balance Card */}
            <div className="hero-card">
              <p style={{ fontSize: "0.65rem", fontWeight: 800, opacity: 0.75, letterSpacing: "0.1em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>Glide Wallet Balance</p>
              <p style={{ fontSize: "2.6rem", fontWeight: 900, marginTop: "8px", letterSpacing: "-0.03em", lineHeight: 1, position: "relative", zIndex: 1 }}>
                ₦{payment.walletBalance.toLocaleString()}
              </p>
              <p style={{ fontSize: "0.77rem", opacity: 0.75, marginTop: "6px", position: "relative", zIndex: 1, fontWeight: 500 }}>Available for instant rides</p>

              {/* Shimmer line */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: "3px",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s ease-in-out infinite",
                zIndex: 1,
              }} />
            </div>

            {/* Quick Top-up */}
            <div>
              <p className="section-header" style={{ marginBottom: "10px" }}>Quick Top-up</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleTopUp(amt)}
                    style={{
                      padding: "14px 8px",
                      border: "1.5px solid var(--card-border)",
                      borderRadius: "var(--r-md)",
                      fontFamily: "var(--font)",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      color: "var(--primary)",
                      cursor: "pointer",
                      background: "var(--primary-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s var(--ease)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--shadow-primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                  >
                    <Plus size={14} />
                    {amt >= 1000 ? `₦${amt / 1000}k` : `₦${amt}`}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── CARDS ── */}
        {tab === "cards" && (
          <>
            <p className="section-header">Saved Cards</p>
            {SAVED_CARDS.map(card => (
              <div
                key={card.id}
                onClick={() => onPaymentChange({ ...payment, activeCard: card.id })}
                style={{
                  padding: "22px 24px",
                  borderRadius: "var(--r-xl)",
                  background: `linear-gradient(135deg, ${card.from} 0%, ${card.to} 100%)`,
                  color: "#fff",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  border: `2px solid ${payment.activeCard === card.id ? "rgba(255,255,255,0.5)" : "transparent"}`,
                  boxShadow: payment.activeCard === card.id ? "0 8px 32px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.2)",
                  transition: "all 0.2s var(--ease)",
                }}
              >
                <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: -40, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", opacity: 0.8, textTransform: "uppercase" }}>{card.brand}</p>
                    {payment.activeCard === card.id && (
                      <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 800 }}>Default</span>
                    )}
                  </div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.22em", marginTop: "18px" }}>•••• •••• •••• {card.last4}</p>
                  <p style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: "14px", fontWeight: 500 }}>Expires {card.expiry}</p>
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", borderRadius: "var(--r-md)" }}>
              <Plus size={16} /> Add New Card
            </button>
          </>
        )}

        {/* ── CASH ── */}
        {tab === "cash" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                padding: "28px 24px",
                borderRadius: "var(--r-xl)",
                border: `2px solid ${payment.preferCash ? "var(--success)" : "var(--card-border)"}`,
                background: payment.preferCash ? "var(--success-subtle)" : "var(--card-bg)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.25s var(--ease)",
                boxShadow: payment.preferCash ? "var(--success-glow)" : "var(--shadow-sm)",
              }}
              onClick={() => onPaymentChange({ ...payment, preferCash: !payment.preferCash })}
            >
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: payment.preferCash ? "var(--success)" : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", transition: "all 0.25s" }}>
                <Banknote size={28} style={{ color: payment.preferCash ? "#fff" : "var(--text-muted)" }} />
              </div>
              <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)" }}>Cash Payment</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.55, fontWeight: 500 }}>
                Pay your driver directly with cash at the end of your trip.
              </p>
              <div style={{
                marginTop: "20px",
                padding: "10px 24px",
                borderRadius: "99px",
                background: payment.preferCash ? "var(--success)" : "var(--card-border)",
                color: payment.preferCash ? "#fff" : "var(--text-muted)",
                fontSize: "0.82rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.25s var(--ease)",
              }}>
                {payment.preferCash ? <><Check size={14} /> Cash Preferred</> : "Tap to Enable Cash"}
              </div>
            </div>
            <div style={{ padding: "16px", background: "var(--primary-subtle)", borderRadius: "var(--r-md)", border: "1px solid var(--primary-glow)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.65, fontWeight: 500 }}>
              💡 Cash rides are available with all vehicle categories. Ensure you have exact change ready.
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <>
            <p className="section-header">Transaction History</p>
            {payment.transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-faint)" }}>
                <Clock size={36} style={{ opacity: 0.3, marginBottom: "12px" }} />
                <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No transactions yet</p>
              </div>
            ) : (
              payment.transactions.map(tx => (
                <div key={tx.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  <div style={{
                    width: 40, height: 40,
                    borderRadius: "11px",
                    background: tx.type === "credit" ? "var(--success-subtle)" : "var(--primary-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {tx.type === "credit"
                      ? <ArrowDownLeft size={18} style={{ color: "var(--success)" }} />
                      : <ArrowUpRight size={18} style={{ color: "var(--primary)" }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>{tx.date}</p>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 900, color: tx.type === "credit" ? "var(--success)" : "var(--text-heading)", flexShrink: 0 }}>
                    {tx.type === "credit" ? "+" : "−"}₦{tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </>
        )}

        {/* ── PROMOS ── */}
        {tab === "promos" && (
          <>
            {/* Input Row */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder="Enter promo code"
                onKeyDown={e => e.key === "Enter" && handlePromo()}
                style={{
                  flex: 1,
                  padding: "13px 16px",
                  border: "1.5px solid var(--card-border-strong)",
                  borderRadius: "var(--r-md)",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font)",
                  color: "var(--text-heading)",
                  background: "var(--card-bg)",
                  outline: "none",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
              />
              <button onClick={handlePromo} className="btn btn-primary" style={{ padding: "13px 20px", borderRadius: "var(--r-md)", fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                Apply
              </button>
            </div>

            {promoMsg && (
              <div className="animate-slide-up" style={{
                padding: "12px 16px",
                borderRadius: "var(--r-md)",
                background: promoMsg.type === "success" ? "var(--success-subtle)" : "rgba(239,68,68,0.06)",
                border: `1px solid ${promoMsg.type === "success" ? "var(--success-glow)" : "rgba(239,68,68,0.2)"}`,
                color: promoMsg.type === "success" ? "var(--success)" : "var(--danger)",
                fontSize: "0.82rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}>
                {promoMsg.type === "success" ? <Check size={15} /> : <X size={15} />}
                {promoMsg.text}
              </div>
            )}

            {payment.promoApplied && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--success-subtle)", borderRadius: "var(--r-md)", border: "1px solid var(--success-glow)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} style={{ color: "var(--success)" }} />
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-heading)" }}>Active: {payment.promoApplied}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--success)", marginTop: "2px", fontWeight: 600 }}>{PROMO_CODES[payment.promoApplied]?.desc}</p>
                  </div>
                </div>
                <button onClick={() => onPaymentChange({ ...payment, promoApplied: null })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-faint)", padding: 4 }}>
                  <X size={16} />
                </button>
              </div>
            )}

            <p className="section-header" style={{ marginTop: "4px" }}>Available Offers</p>
            {Object.entries(PROMO_CODES).map(([code, info]) => (
              <div
                key={code}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  borderRadius: "var(--r-md)",
                  border: `1.5px dashed ${payment.promoApplied === code ? "var(--success)" : "var(--card-border-strong)"}`,
                  background: payment.promoApplied === code ? "var(--success-subtle)" : "var(--card-bg)",
                  transition: "all 0.2s var(--ease)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "11px", background: payment.promoApplied === code ? "var(--success-subtle)" : "var(--primary-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Tag size={18} style={{ color: payment.promoApplied === code ? "var(--success)" : "var(--primary)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 900, color: payment.promoApplied === code ? "var(--success)" : "var(--primary)", letterSpacing: "0.04em" }}>{code}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>{info.desc}</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--text-faint)", marginTop: "2px", fontWeight: 600 }}>⏱ Expires: {info.expiry}</p>
                </div>
                {payment.promoApplied === code ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--success)", flexShrink: 0 }}>
                    <Check size={16} />
                    <span style={{ fontSize: "0.72rem", fontWeight: 800 }}>Applied</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onPaymentChange({ ...payment, promoApplied: code });
                      setPromoMsg({ type: "success", text: `Code applied! ${info.desc}` });
                      setTimeout(() => setPromoMsg(null), 3000);
                    }}
                    style={{
                      padding: "7px 14px",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--r-sm)",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      flexShrink: 0,
                      transition: "all 0.2s var(--ease)",
                      boxShadow: "var(--shadow-primary)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
