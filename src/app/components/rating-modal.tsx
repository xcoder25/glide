"use client";

import React, { useState } from "react";
import { Star, X, ThumbsUp } from "lucide-react";

interface RatingModalProps {
  driverName: string;
  categoryName: string;
  fare: number;
  pickupName: string;
  dropoffName: string;
  onSubmit: (rating: number, tip: number, comment: string) => void;
  onSkip: () => void;
}

const TIP_OPTIONS = [
  { label: "No Tip", value: 0 },
  { label: "₦100",   value: 100 },
  { label: "₦200",   value: 200 },
  { label: "₦500",   value: 500 },
];

const QUICK_TAGS = [
  "Safe Driver 🛡️", "Clean Car ✨", "On Time ⏱️",
  "Friendly 😊", "Smooth Ride 🚗", "Great Music 🎵",
];

const CATEGORY_RATINGS = [
  { key: "friendliness", label: "Friendliness", icon: "😊" },
  { key: "punctuality",  label: "Punctuality",  icon: "⏱️" },
  { key: "cleanliness",  label: "Cleanliness",  icon: "✨" },
  { key: "route",        label: "Route",        icon: "🗺️" },
];

export default function RatingModal({
  driverName, categoryName, fare, pickupName, dropoffName, onSubmit, onSkip,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTip, setSelectedTip] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    friendliness: 0,
    punctuality:  0,
    cleanliness:  0,
    route:        0,
  });
  const [hoveredCategory, setHoveredCategory] = useState<{ key: string; star: number } | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return { text: "Poor",        color: "var(--danger)"  };
      case 2: return { text: "Fair",        color: "#F59E0B"        };
      case 3: return { text: "Good",        color: "#F59E0B"        };
      case 4: return { text: "Great",       color: "var(--success)" };
      case 5: return { text: "Excellent! 🎉", color: "var(--success)" };
      default: return { text: "Tap a star to rate", color: "var(--text-faint)" };
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    const catSummary = CATEGORY_RATINGS
      .filter(c => categoryRatings[c.key] > 0)
      .map(c => `${c.label}: ${categoryRatings[c.key]}/5`)
      .join(", ");
    setTimeout(() => {
      onSubmit(rating, selectedTip, [comment, ...selectedTags, catSummary].filter(Boolean).join(" | "));
    }, 1600);
  };

  const ratingInfo = getRatingLabel(hoveredStar || rating);

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet animate-modal-pop" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg, var(--success) 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(16,185,129,0.4)", animation: "splash-pop-in 0.6s var(--ease) both" }}>
            <ThumbsUp size={40} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em" }}>Thank you!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.55, fontWeight: 500 }}>
              Your feedback helps improve Glide for everyone in Uyo.
            </p>
          </div>
          {selectedTip > 0 && (
            <div style={{ padding: "12px 24px", background: "var(--success-subtle)", border: "1px solid var(--success-glow)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontWeight: 700, color: "var(--success)" }}>
              ₦{selectedTip.toLocaleString()} tip sent to {driverName.split(" ")[0]} 🙏
            </div>
          )}
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={24} fill={i <= rating ? "#F59E0B" : "transparent"} stroke={i <= rating ? "#F59E0B" : "var(--text-faint)"} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-sheet animate-modal-pop" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", background: "var(--primary-subtle)", padding: "3px 10px", borderRadius: "99px", border: "1px solid var(--primary-glow)" }}>
              Trip Complete ✓
            </span>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--text-heading)", letterSpacing: "-0.02em", marginTop: "8px" }}>Rate your ride</h3>
            <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: 500 }}>
              {pickupName} → {dropoffName}
            </p>
          </div>
          <button
            onClick={onSkip}
            style={{ border: "1px solid var(--card-border)", background: "var(--card-bg)", borderRadius: "10px", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-faint)", flexShrink: 0, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--danger)"; e.currentTarget.style.borderColor = "var(--danger)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-faint)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Driver Card */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "var(--card-bg)", borderRadius: "var(--r-lg)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, #F59E0B 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.2rem", color: "#fff", flexShrink: 0, boxShadow: "var(--shadow-primary)" }}>
            {driverName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.01em" }}>{driverName}</p>
            <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>{categoryName}</p>
            <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#F59E0B" stroke="#F59E0B" />)}
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginLeft: "4px", fontWeight: 600 }}>4.9 overall</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em" }}>₦{fare.toLocaleString()}</p>
            <p style={{ fontSize: "0.6rem", color: "var(--text-faint)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Total Paid</p>
          </div>
        </div>

        {/* Overall Stars */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <p className="section-header" style={{ alignSelf: "flex-start" }}>Overall Rating</p>
          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", transition: "transform 0.2s var(--ease-spring)", transform: (hoveredStar >= star || rating >= star) ? "scale(1.2)" : "scale(1)" }}
              >
                <Star
                  size={36}
                  fill={(hoveredStar || rating) >= star ? "#F59E0B" : "transparent"}
                  stroke={(hoveredStar || rating) >= star ? "#F59E0B" : "var(--card-border-strong)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: ratingInfo.color, transition: "color 0.2s", letterSpacing: "-0.01em" }}>
            {ratingInfo.text}
          </p>
        </div>

        {/* Category Ratings — show when overall is rated */}
        {rating > 0 && (
          <div className="animate-slide-up">
            <p className="section-header" style={{ marginBottom: "10px" }}>Detailed Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORY_RATINGS.map(cat => {
                const val = categoryRatings[cat.key];
                return (
                  <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1rem", width: 22 }}>{cat.icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-body)", width: 90, flexShrink: 0 }}>{cat.label}</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoveredCategory({ key: cat.key, star })}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onClick={() => setCategoryRatings(prev => ({ ...prev, [cat.key]: star }))}
                          style={{
                            border: "none", background: "none", cursor: "pointer", padding: "2px",
                            transform: (hoveredCategory?.key === cat.key && hoveredCategory.star >= star || val >= star) ? "scale(1.15)" : "scale(1)",
                            transition: "transform 0.15s",
                          }}
                        >
                          <Star
                            size={20}
                            fill={(hoveredCategory?.key === cat.key ? hoveredCategory.star : val) >= star ? "#F59E0B" : "transparent"}
                            stroke={(hoveredCategory?.key === cat.key ? hoveredCategory.star : val) >= star ? "#F59E0B" : "var(--card-border-strong)"}
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                    {val > 0 && <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", marginLeft: 2 }}>{val}/5</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Tags — only on 4+ stars */}
        {rating >= 4 && (
          <div className="animate-slide-up">
            <p className="section-header" style={{ marginBottom: "8px" }}>What was great?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "99px",
                    border: `1.5px solid ${selectedTags.includes(tag) ? "var(--success)" : "var(--card-border-strong)"}`,
                    background: selectedTags.includes(tag) ? "var(--success-subtle)" : "transparent",
                    color: selectedTags.includes(tag) ? "var(--success)" : "var(--text-muted)",
                    fontSize: "0.73rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                    transition: "all 0.2s var(--ease)",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a note for your driver... (optional)"
          rows={2}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1.5px solid var(--card-border-strong)",
            borderRadius: "var(--r-md)",
            fontSize: "0.86rem",
            fontFamily: "var(--font)",
            color: "var(--text-heading)",
            background: "var(--card-bg)",
            outline: "none",
            resize: "none",
            lineHeight: 1.55,
            fontWeight: 500,
            transition: "border-color 0.2s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--card-border-strong)"; }}
        />

        {/* Tip */}
        <div>
          <p className="section-header" style={{ marginBottom: "8px" }}>Add a tip?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {TIP_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedTip(value)}
                style={{
                  padding: "11px 6px",
                  borderRadius: "var(--r-md)",
                  border: `1.5px solid ${selectedTip === value ? "var(--primary)" : "var(--card-border-strong)"}`,
                  background: selectedTip === value ? "var(--primary-subtle)" : "var(--card-bg)",
                  color: selectedTip === value ? "var(--primary)" : "var(--text-muted)",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  transition: "all 0.2s var(--ease)",
                  textAlign: "center",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onSkip} className="btn btn-secondary" style={{ padding: "13px 20px", fontSize: "0.88rem", flexShrink: 0, width: "auto" }}>
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="btn btn-primary"
            style={{ flex: 1, padding: "13px", fontSize: "0.92rem", opacity: rating === 0 ? 0.4 : 1, transition: "opacity 0.2s, transform 0.2s" }}
          >
            Submit {selectedTip > 0 ? `+ ₦${selectedTip} Tip` : "Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
