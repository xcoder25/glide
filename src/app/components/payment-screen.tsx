"use client";

import React, { useState } from "react";
import { Wallet, CreditCard, Banknote, Clock, Tag, Plus, Check, X, ArrowDownLeft, ArrowUpRight } from "lucide-react";

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
  { id: "visa-4829",   brand: "Visa",       last4: "4829", expiry: "08/26", from: "#0f172a", to: "#1e293b" },
  { id: "mc-7721",    brand: "Mastercard", last4: "7721", expiry: "03/27", from: "#7c2d12", to: "#9a3412" },
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
    <div className="full-screen animate-screen-in">

      {/* Header */}
      <div className="page-header">
        <h2 className="page-title">Wallet &amp; Payment</h2>
      </div>

      <div className="full-screen-scroll safe-bottom">
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Tab Bar */}
          <div className="tab-bar">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`tab-item${tab === id ? " active" : ""}`}
                onClick={() => setTab(id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
              >
                <Icon size={13} />
                <span style={{ fontSize: "0.78rem" }}>{label}</span>
              </button>
            ))}
          </div>

          {/* ── WALLET ── */}
          {tab === "wallet" && (
            <>
              {/* Balance Card */}
              <div className="glass-card glow-primary" style={{ padding: "24px 20px", textAlign: "center", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Glide Balance</p>
                <p style={{ fontSize: "2.5rem", fontWeight: 950, marginTop: "8px", letterSpacing: "-0.03em", color: "var(--text-1)" }}>
                  ₦{payment.walletBalance.toLocaleString()}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginTop: "6px", fontWeight: 500 }}>Available for instant rides</p>
              </div>

              {/* Quick Top-up */}
              <div>
                <p className="section-header" style={{ marginBottom: "10px" }}>Quick Top-up</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => handleTopUp(amt)}
                      className="glass-card glass-card-hover"
                      style={{
                        padding: "14px 6px",
                        fontFamily: "var(--font)",
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        color: "var(--primary)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {SAVED_CARDS.map(card => (
                  <button
                    key={card.id}
                    onClick={() => onPaymentChange({ ...payment, activeCard: card.id })}
                    style={{
                      padding: "20px",
                      borderRadius: "var(--r-xl)",
                      background: `linear-gradient(135deg, ${card.from} 0%, ${card.to} 100%)`,
                      color: "#fff",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                      border: `2px solid ${payment.activeCard === card.id ? "var(--primary)" : "transparent"}`,
                      boxShadow: payment.activeCard === card.id ? "var(--shadow-primary)" : "var(--shadow-md)",
                      transition: "all 0.25s var(--ease)",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.12em", opacity: 0.8, textTransform: "uppercase" }}>{card.brand}</p>
                        {payment.activeCard === card.id && (
                          <span style={{ background: "var(--primary)", padding: "3px 10px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 800 }}>Default</span>
                        )}
                      </div>
                      <p style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.22em", marginTop: "16px" }}>•••• •••• •••• {card.last4}</p>
                      <p style={{ fontSize: "0.72rem", opacity: 0.7, marginTop: "14px", fontWeight: 500 }}>Expires {card.expiry}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary" style={{ borderRadius: "var(--r-xl)" }}>
                <Plus size={16} /> Add New Card
              </button>
            </>
          )}

          {/* ── CASH ── */}
          {tab === "cash" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <button
                style={{
                  padding: "24px 20px",
                  borderRadius: "var(--r-xl)",
                  border: `2.5px solid ${payment.preferCash ? "var(--primary)" : "var(--border)"}`,
                  background: payment.preferCash ? "var(--primary-dim)" : "var(--bg-elevated)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.25s var(--ease)",
                  width: "100%",
                }}
                onClick={() => onPaymentChange({ ...payment, preferCash: !payment.preferCash })}
              >
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: payment.preferCash ? "var(--primary)" : "var(--border-strong)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", transition: "all 0.25s" }}>
                  <Banknote size={24} style={{ color: "#fff" }} />
                </div>
                <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-1)" }}>Cash Payment</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "8px", lineHeight: 1.5, fontWeight: 500 }}>
                  Pay your driver directly at the end of the trip.
                </p>
                <div style={{
                  marginTop: "16px",
                  padding: "8px 20px",
                  borderRadius: "99px",
                  background: payment.preferCash ? "var(--primary)" : "var(--border-strong)",
                  color: "#fff",
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  {payment.preferCash ? <><Check size={14} /> Cash Selected</> : "Tap to Select Cash"}
                </div>
              </button>
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <>
              <p className="section-header">Transactions</p>
              {payment.transactions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-4)" }}>
                  <Clock size={36} style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No transactions yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {payment.transactions.map(tx => (
                    <div key={tx.id} className="glass-card" style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px 16px",
                    }}>
                      <div style={{
                        width: 38, height: 38,
                        borderRadius: "10px",
                        background: tx.type === "credit" ? "var(--green-dim)" : "var(--primary-dim)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {tx.type === "credit"
                          ? <ArrowDownLeft size={16} style={{ color: "var(--green)" }} />
                          : <ArrowUpRight size={16} style={{ color: "var(--primary)" }} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.description}</p>
                        <p style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px", fontWeight: 500 }}>{tx.date}</p>
                      </div>
                      <span style={{ fontSize: "0.92rem", fontWeight: 900, color: tx.type === "credit" ? "var(--green)" : "var(--text-1)", flexShrink: 0 }}>
                        {tx.type === "credit" ? "+" : "−"}₦{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
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
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--r-xl)",
                    fontSize: "0.9rem",
                    fontFamily: "var(--font)",
                    color: "var(--text-1)",
                    background: "var(--bg-elevated)",
                    outline: "none",
                    fontWeight: 600,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
                <button onClick={handlePromo} className="btn btn-primary" style={{ width: "auto", padding: "13px 20px", borderRadius: "var(--r-xl)" }}>
                  Apply
                </button>
              </div>

              {promoMsg && (
                <div className="animate-slide-up" style={{
                  padding: "12px 16px",
                  borderRadius: "var(--r-md)",
                  background: promoMsg.type === "success" ? "var(--green-dim)" : "var(--red-dim)",
                  border: `1px solid ${promoMsg.type === "success" ? "var(--green)" : "var(--red)"}`,
                  color: promoMsg.type === "success" ? "var(--green)" : "var(--red)",
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "var(--green-dim)", borderRadius: "var(--r-lg)", border: "1px solid var(--green)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Check size={16} style={{ color: "var(--green)" }} />
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>Active: {payment.promoApplied}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--green)", marginTop: "2px", fontWeight: 600 }}>{PROMO_CODES[payment.promoApplied]?.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => onPaymentChange({ ...payment, promoApplied: null })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: 4 }}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <p className="section-header" style={{ marginTop: "4px" }}>Available Offers</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(PROMO_CODES).map(([code, info]) => (
                  <div
                    key={code}
                    className="glass-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "16px",
                      borderStyle: payment.promoApplied === code ? "solid" : "dashed",
                      borderColor: payment.promoApplied === code ? "var(--green)" : "var(--border-strong)",
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: "10px", background: payment.promoApplied === code ? "var(--green-dim)" : "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Tag size={16} style={{ color: payment.promoApplied === code ? "var(--green)" : "var(--primary)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.9rem", fontWeight: 850, color: payment.promoApplied === code ? "var(--green)" : "var(--primary)" }}>{code}</p>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-2)", marginTop: "2px", fontWeight: 500 }}>{info.desc}</p>
                      <p style={{ fontSize: "0.65rem", color: "var(--text-3)", marginTop: "2px", fontWeight: 600 }}>Expires: {info.expiry}</p>
                    </div>
                    {payment.promoApplied === code ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--green)", flexShrink: 0 }}>
                        <Check size={15} />
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
                          padding: "6px 12px",
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "var(--r-sm)",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          fontFamily: "var(--font)",
                          boxShadow: "var(--shadow-primary)",
                        }}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
