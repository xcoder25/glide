"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Copy, Check, Share2, Gift, Trophy, Users, ChevronRight, Star, Zap } from "lucide-react";

const REFERRAL_CODE = "GLIDE-MARC42";
const REFERRAL_LINK = `https://glide.ng/invite/${REFERRAL_CODE}`;

const MOCK_REFERRALS = [
  { name: "Emeka Obi", date: "June 28", status: "completed", bonus: 1000 },
  { name: "Ngozi Ade", date: "June 25", status: "completed", bonus: 1000 },
];

const LEADERBOARD = [
  { rank: 1, name: "Chioma Eze", count: 18, city: "Uyo", emoji: "🥇" },
  { rank: 2, name: "Bello Hassan", count: 15, city: "Uyo", emoji: "🥈" },
  { rank: 3, name: "Marcus Sterling", count: 12, city: "Uyo", emoji: "🥉", isYou: true },
  { rank: 4, name: "Amaka Nwosu", count: 9, city: "Uyo", emoji: "" },
  { rank: 5, name: "Kingsley Okon", count: 7, city: "Uyo", emoji: "" },
];

const AVAILABLE_PROMOS = [
  { code: "WELCOME50", desc: "50% off your next ride", expires: "Jul 5, 2026", discount: "50%", color: "var(--primary)" },
  { code: "GLIDE100", desc: "₦100 off any Glide Lite ride", expires: "Jul 10, 2026", discount: "₦100", color: "var(--cyan)" },
  { code: "FESTIVE", desc: "25% off this weekend only", expires: "Jun 30, 2026", discount: "25%", color: "#8B5CF6" },
];

interface ReferralScreenProps {
  referralBalance: number;
  onApplyPromo?: (code: string) => void;
}

export default function ReferralScreen({ referralBalance, onApplyPromo }: ReferralScreenProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"refer" | "promos" | "leaderboard">("refer");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const referralsMade = MOCK_REFERRALS.length;
  const referralsNeeded = 5;
  const bonusGoal = 2000;
  const progress = Math.min(referralsMade / referralsNeeded, 1);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(REFERRAL_LINK).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: "Join Glide!",
        text: `Get your first ride free! Use my code ${REFERRAL_CODE} on Glide.`,
        url: REFERRAL_LINK,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }, [handleCopy]);

  const handleApplyPromo = (code: string) => {
    setAppliedCode(code);
    onApplyPromo?.(code);
  };

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "refer", label: "Refer Friends" },
    { id: "promos", label: "Promos" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="full-screen animate-screen-in">
      {/* Header */}
      <div className="page-header" style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)", padding: "18px 20px 0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg, var(--primary), var(--amber))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-primary)" }}>
            <Gift size={18} color="#fff" />
          </div>
          <div>
            <h2 className="page-title" style={{ marginBottom: "2px" }}>Referrals & Rewards</h2>
            <p style={{ fontSize: "0.7rem", color: "var(--text-3)", fontWeight: 500 }}>Earn by sharing Glide with friends</p>
          </div>
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: "0", borderBottom: "none", overflowX: "auto" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px", border: "none", background: "transparent",
                fontFamily: "var(--font)", fontSize: "0.82rem", fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? "var(--primary)" : "var(--text-3)",
                cursor: "pointer", borderBottom: `2px solid ${activeTab === tab.id ? "var(--primary)" : "transparent"}`,
                transition: "all 0.2s", flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="full-screen-scroll safe-bottom" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── REFER TAB ── */}
        {activeTab === "refer" && (
          <>
            {/* Referral Balance */}
            <div style={{ background: "linear-gradient(135deg, var(--primary) 0%, #e05a12 100%)", borderRadius: "var(--r-xl)", padding: "22px", boxShadow: "var(--shadow-primary)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Referral Balance</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>₦{(referralBalance + 2000).toLocaleString()}</div>
              <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", marginTop: "4px", fontWeight: 500 }}>Available in your Glide wallet</div>
            </div>

            {/* Progress to next bonus */}
            <div className="glass-card" style={{ padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--text-1)" }}>Next Bonus Goal</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary)" }}>{referralsMade}/{referralsNeeded} friends</div>
              </div>
              <div style={{ height: 8, background: "var(--border)", borderRadius: "99px", overflow: "hidden", marginBottom: "8px" }}>
                <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg, var(--primary), var(--amber))", borderRadius: "99px", transition: "width 1s var(--ease)" }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 500 }}>
                Refer {referralsNeeded - referralsMade} more friends to unlock ₦{bonusGoal.toLocaleString()} bonus
              </div>
            </div>

            {/* Referral Code Card */}
            <div className="glass-card" style={{ padding: "18px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Your Referral Code</div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
                <div style={{
                  flex: 1, padding: "14px 16px", background: "var(--bg-elevated)",
                  borderRadius: "var(--r-lg)", border: "1.5px dashed var(--primary)",
                  fontSize: "1.2rem", fontWeight: 900, fontFamily: "monospace",
                  color: "var(--primary)", letterSpacing: "0.05em", textAlign: "center",
                }}>
                  {REFERRAL_CODE}
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    width: 48, height: 48, borderRadius: "var(--r-lg)", background: copied ? "var(--green-dim)" : "var(--primary-dim)",
                    border: `1px solid ${copied ? "rgba(0,217,126,0.3)" : "var(--primary-glow)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.25s",
                  }}
                >
                  {copied ? <Check size={18} style={{ color: "var(--green)" }} /> : <Copy size={18} style={{ color: "var(--primary)" }} />}
                </button>
              </div>
              <button onClick={handleShare} className="btn btn-primary" style={{ borderRadius: "var(--r-xl)", gap: "10px" }}>
                <Share2 size={16} />
                Share with Friends
              </button>
            </div>

            {/* Recent referrals */}
            {MOCK_REFERRALS.length > 0 && (
              <div>
                <div className="section-label" style={{ marginBottom: "10px" }}>
                  <Users size={10} style={{ color: "var(--text-3)" }} />
                  Recent Referrals
                </div>
                <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
                  {MOCK_REFERRALS.map((ref, i) => (
                    <div key={ref.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: i < MOCK_REFERRALS.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-dim)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 900, color: "var(--primary)" }}>
                          {ref.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-1)" }}>{ref.name}</div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "2px" }}>Joined {ref.date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--green)" }}>+₦{ref.bonus.toLocaleString()}</div>
                        <div style={{ fontSize: "0.62rem", background: "var(--green-dim)", color: "var(--green)", borderRadius: "99px", padding: "2px 8px", marginTop: "2px", fontWeight: 700 }}>Earned</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PROMOS TAB ── */}
        {activeTab === "promos" && (
          <>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 500, lineHeight: 1.6 }}>
              Tap a promo to apply it to your next ride. One promo active at a time.
            </div>
            {AVAILABLE_PROMOS.map(promo => {
              const isApplied = appliedCode === promo.code;
              return (
                <div
                  key={promo.code}
                  className="glass-card"
                  style={{ padding: "16px 18px", border: `1.5px solid ${isApplied ? promo.color : "var(--border)"}`, transition: "all 0.2s", animation: "slide-up 0.3s var(--ease) both" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: 46, height: 46, borderRadius: "var(--r-lg)", background: `${promo.color}18`, border: `1px solid ${promo.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Zap size={20} style={{ color: promo.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                        <span style={{ fontSize: "0.92rem", fontWeight: 900, fontFamily: "monospace", color: promo.color }}>{promo.code}</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "99px", background: `${promo.color}18`, color: promo.color }}>{promo.discount} OFF</span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-2)", fontWeight: 600 }}>{promo.desc}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-4)", marginTop: "3px" }}>Expires {promo.expires}</div>
                    </div>
                    <button
                      onClick={() => handleApplyPromo(promo.code)}
                      style={{
                        padding: "8px 14px", borderRadius: "var(--r-full)",
                        background: isApplied ? "var(--green-dim)" : `${promo.color}18`,
                        border: `1px solid ${isApplied ? "rgba(0,217,126,0.3)" : `${promo.color}30`}`,
                        color: isApplied ? "var(--green)" : promo.color,
                        fontFamily: "var(--font)", fontWeight: 800, fontSize: "0.72rem",
                        cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
                        display: "flex", alignItems: "center", gap: "5px",
                      }}
                    >
                      {isApplied ? <><Check size={12} /> Applied</> : "Apply"}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {activeTab === "leaderboard" && (
          <>
            <div style={{ textAlign: "center", padding: "8px 0 4px 0" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>June 2026</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Top Referrers in Uyo 🏆</div>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              {LEADERBOARD.map((entry, i) => (
                <div
                  key={entry.name}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px",
                    borderBottom: i < LEADERBOARD.length - 1 ? "1px solid var(--border)" : "none",
                    background: entry.isYou ? "var(--primary-dim)" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ fontSize: "1.2rem", width: 28, textAlign: "center", flexShrink: 0 }}>
                    {entry.emoji || <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-3)" }}>#{entry.rank}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: entry.isYou ? "var(--primary)" : "var(--text-1)" }}>
                      {entry.name} {entry.isYou && <span style={{ fontSize: "0.65rem", background: "var(--primary)", color: "#fff", padding: "1px 7px", borderRadius: "99px", fontWeight: 700, marginLeft: "4px" }}>You</span>}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-3)", marginTop: "2px" }}>{entry.city}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1rem", fontWeight: 900, color: entry.isYou ? "var(--primary)" : "var(--text-1)", fontFamily: "var(--font-display)" }}>{entry.count}</div>
                    <div style={{ fontSize: "0.62rem", color: "var(--text-3)", fontWeight: 500 }}>referrals</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, var(--primary-dim), transparent)", borderRadius: "var(--r-lg)", border: "1px solid var(--primary-glow)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Star size={18} fill="var(--amber)" stroke="var(--amber)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-1)" }}>You're #3 this month!</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px" }}>Refer 3 more to reach #1 and win ₦10,000</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
