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

const PROMO_CODES: Record<string, { discount: number; desc: string }> = {
  "GLIDE10":  { discount: 10, desc: "10% off your next ride" },
  "LAGOS50":  { discount: 50, desc: "₦50 off first Lagos ride" },
  "WELCOME":  { discount: 500, desc: "₦500 new user bonus" },
  "FRIDAY20": { discount: 20, desc: "20% off Friday rides" },
};

const SAVED_CARDS = [
  { id: "visa-4829",   brand: "Visa",       last4: "4829", expiry: "08/26", color: "#1a1a6b" },
  { id: "mc-7721",    brand: "Mastercard", last4: "7721", expiry: "03/27", color: "#8B0000" },
];

export default function PaymentScreen({ payment, onPaymentChange }: PaymentScreenProps) {
  const [tab, setTab] = useState<"wallet" | "cards" | "cash" | "history" | "promos">("wallet");
  const [promoInput, setPromoInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(0);

  const handlePromo = () => {
    const code = promoInput.trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (promo) {
      onPaymentChange({ ...payment, promoApplied: code });
      setPromoMsg({ type: "success", text: `✅ Code applied! ${promo.desc}` });
    } else {
      setPromoMsg({ type: "error", text: "❌ Invalid or expired promo code." });
    }
    setTimeout(() => setPromoMsg(null), 3000);
  };

  const handleTopUp = (amount: number) => {
    onPaymentChange({
      ...payment,
      walletBalance: payment.walletBalance + amount,
      transactions: [
        {
          id: `tx-${Date.now()}`,
          date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
          description: "Wallet Top-up",
          amount,
          type: "credit",
        },
        ...payment.transactions,
      ],
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
        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Payment</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>Manage your payment methods & wallet</p>

        {/* Tab Bar */}
        <div className="tab-bar" style={{ marginTop: "20px", overflowX: "auto" }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`tab-item${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
              style={{ display: "flex", alignItems: "center", gap: "5px" }}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 24px 100px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        
        {/* ── WALLET ── */}
        {tab === "wallet" && (
          <>
            {/* Balance Card */}
            <div style={{
              background: "linear-gradient(135deg, var(--primary) 0%, #B34D00 100%)",
              borderRadius: "20px",
              padding: "28px 24px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(217,95,0,0.35)",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              <div style={{ position: "absolute", bottom: -30, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
              <p style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.7, letterSpacing: "0.06em", textTransform: "uppercase" }}>Glide Wallet Balance</p>
              <p style={{ fontSize: "2.4rem", fontWeight: 900, marginTop: "6px", letterSpacing: "-0.02em" }}>
                ₦{payment.walletBalance.toLocaleString()}
              </p>
              <p style={{ fontSize: "0.78rem", opacity: 0.7, marginTop: "4px" }}>Available for instant rides</p>
            </div>

            {/* Top-up Amounts */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Quick Top-up</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleTopUp(amt)}
                    className="glass-card-interactive"
                    style={{
                      padding: "12px 8px",
                      border: "1.5px solid var(--card-border)",
                      borderRadius: "12px",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      cursor: "pointer",
                      background: "rgba(217,95,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Plus size={12} />
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
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Saved Cards</p>
            {SAVED_CARDS.map(card => (
              <div
                key={card.id}
                onClick={() => onPaymentChange({ ...payment, activeCard: card.id })}
                style={{
                  padding: "20px 22px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}bb 100%)`,
                  color: "#fff",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  border: payment.activeCard === card.id ? "2px solid var(--primary)" : "2px solid transparent",
                  boxShadow: payment.activeCard === card.id ? "0 4px 20px rgba(217,95,0,0.3)" : "0 4px 16px rgba(0,0,0,0.15)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", opacity: 0.7, textTransform: "uppercase" }}>{card.brand}</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.2em", marginTop: "16px" }}>•••• •••• •••• {card.last4}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "0.75rem", opacity: 0.7 }}>
                  <span>Expires {card.expiry}</span>
                  {payment.activeCard === card.id && (
                    <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>Default</span>
                  )}
                </div>
              </div>
            ))}
            <button className="btn btn-secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px" }}>
              <Plus size={16} /> Add New Card
            </button>
          </>
        )}

        {/* ── CASH ── */}
        {tab === "cash" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              padding: "24px",
              borderRadius: "20px",
              border: `2px solid ${payment.preferCash ? "var(--accent)" : "var(--card-border)"}`,
              background: payment.preferCash ? "rgba(26,107,60,0.05)" : "rgba(0,0,0,0.01)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.25s",
            }}
              onClick={() => onPaymentChange({ ...payment, preferCash: !payment.preferCash })}
            >
              <Banknote size={40} style={{ color: payment.preferCash ? "var(--accent)" : "var(--text-muted)", marginBottom: "12px" }} />
              <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-main)" }}>Cash Payment</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
                Pay your driver directly with cash at the end of your trip.
              </p>
              <div style={{
                marginTop: "16px",
                padding: "8px 20px",
                borderRadius: "99px",
                background: payment.preferCash ? "var(--accent)" : "rgba(0,0,0,0.04)",
                color: payment.preferCash ? "#fff" : "var(--text-muted)",
                fontSize: "0.82rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.25s",
              }}>
                {payment.preferCash ? <><Check size={14} /> Cash Preferred</> : "Tap to Enable Cash"}
              </div>
            </div>
            <div style={{ padding: "14px 18px", background: "rgba(217,95,0,0.04)", borderRadius: "12px", border: "1px solid rgba(217,95,0,0.15)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              💡 Cash rides are available with all vehicle categories. Ensure you have exact change ready as drivers may not carry change.
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Transaction History
            </p>
            {payment.transactions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                <Clock size={32} style={{ opacity: 0.3, marginBottom: "10px" }} />
                <p style={{ fontSize: "0.88rem" }}>No transactions yet</p>
              </div>
            ) : (
              payment.transactions.map(tx => (
                <div
                  key={tx.id}
                  style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--card-border)", background: "rgba(0,0,0,0.01)" }}
                >
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    background: tx.type === "credit" ? "rgba(26,107,60,0.08)" : "rgba(217,95,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {tx.type === "credit"
                      ? <ArrowDownLeft size={16} style={{ color: "var(--accent)" }} />
                      : <ArrowUpRight size={16} style={{ color: "var(--primary)" }} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)" }}>{tx.description}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{tx.date}</p>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800, color: tx.type === "credit" ? "var(--accent)" : "var(--text-main)" }}>
                    {tx.type === "credit" ? "+" : "-"}₦{tx.amount.toLocaleString()}
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
                  padding: "12px 16px",
                  border: "1.5px solid var(--card-border)",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-main)",
                  background: "rgba(0,0,0,0.01)",
                  outline: "none",
                }}
              />
              <button onClick={handlePromo} className="btn btn-primary" style={{ padding: "12px 20px", borderRadius: "12px", fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                Apply
              </button>
            </div>

            {promoMsg && (
              <div className="animate-slide-up" style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: promoMsg.type === "success" ? "rgba(26,107,60,0.08)" : "rgba(220,38,38,0.06)",
                border: `1px solid ${promoMsg.type === "success" ? "rgba(26,107,60,0.2)" : "rgba(220,38,38,0.15)"}`,
                color: promoMsg.type === "success" ? "var(--accent)" : "#dc2626",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}>
                {promoMsg.text}
              </div>
            )}

            {payment.promoApplied && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(26,107,60,0.06)", borderRadius: "12px", border: "1px solid rgba(26,107,60,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Check size={16} style={{ color: "var(--accent)" }} />
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-main)" }}>Active: {payment.promoApplied}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--accent)", marginTop: "2px" }}>{PROMO_CODES[payment.promoApplied]?.desc}</p>
                  </div>
                </div>
                <button onClick={() => onPaymentChange({ ...payment, promoApplied: null })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
            )}

            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "8px" }}>
              Available Offers
            </p>
            {Object.entries(PROMO_CODES).map(([code, info]) => (
              <div
                key={code}
                onClick={() => { setPromoInput(code); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1.5px dashed var(--card-border)",
                  background: "rgba(217,95,0,0.02)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Tag size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--primary)", letterSpacing: "0.05em" }}>{code}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{info.desc}</p>
                </div>
                <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
