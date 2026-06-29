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
      case 1: return { text: "Poor",        color: "var(--red)"  };
      case 2: return { text: "Fair",        color: "var(--amber)"        };
      case 3: return { text: "Good",        color: "var(--amber)"        };
      case 4: return { text: "Great",       color: "var(--green)" };
      case 5: return { text: "Excellent! 🎉", color: "var(--green)" };
      default: return { text: "Tap a star to rate", color: "var(--text-3)" };
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
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--green-dim)", border: "1px solid var(--green)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,217,126,0.3)", animation: "splash-pop-in 0.6s var(--ease) both" }}>
            <ThumbsUp size={40} style={{ color: "var(--green)" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Thank you!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "8px", lineHeight: 1.5, fontWeight: 500 }}>
              Your feedback helps improve Glide for everyone in Uyo.
            </p>
          </div>
          {selectedTip > 0 && (
            <div style={{ padding: "10px 20px", background: "var(--green-dim)", border: "1px solid var(--green)", borderRadius: "var(--r-md)", fontSize: "0.82rem", fontWeight: 700, color: "var(--green)" }}>
              ₦{selectedTip.toLocaleString()} tip sent to {driverName.split(" ")[0]} 🙏
            </div>
          )}
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={24} fill={i <= rating ? "var(--amber)" : "transparent"} stroke={i <= rating ? "var(--amber)" : "var(--text-4)"} />
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
            <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--primary-dim)", padding: "3px 10px", borderRadius: "99px", border: "1px solid var(--primary-glow)" }}>
              Trip Complete ✓
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginTop: "8px" }}>Rate your ride</h3>
            <p style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "3px", fontWeight: 500 }}>
              {pickupName} → {dropoffName}
            </p>
          </div>
          <button onClick={onSkip} className="back-btn" style={{ width: 34, height: 34 }}>
            <X size={15} />
          </button>
        </div>

        {/* Driver Card */}
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px" }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1.1rem", color: "#fff", flexShrink: 0 }}>
            {driverName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-1)" }}>{driverName}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px", fontWeight: 500 }}>{categoryName}</p>
            <div style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="var(--amber)" stroke="var(--amber)" />)}
              <span style={{ fontSize: "0.65rem", color: "var(--text-3)", marginLeft: "4px", fontWeight: 600 }}>4.9 overall</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>₦{fare.toLocaleString()}</p>
            <p style={{ fontSize: "0.6rem", color: "var(--text-3)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>Total Paid</p>
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
                  fill={(hoveredStar || rating) >= star ? "var(--amber)" : "transparent"}
                  stroke={(hoveredStar || rating) >= star ? "var(--amber)" : "var(--border-strong)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.9rem", fontWeight: 800, color: ratingInfo.color, transition: "color 0.2s" }}>
            {ratingInfo.text}
          </p>
        </div>

        {/* Category Ratings */}
        {rating > 0 && (
          <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <p className="section-header">Detailed Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORY_RATINGS.map(cat => {
                const val = categoryRatings[cat.key];
                return (
                  <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1rem", width: 22 }}>{cat.icon}</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-2)", width: 90, flexShrink: 0 }}>{cat.label}</span>
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
                            size={18}
                            fill={(hoveredCategory?.key === cat.key ? hoveredCategory.star : val) >= star ? "var(--amber)" : "transparent"}
                            stroke={(hoveredCategory?.key === cat.key ? hoveredCategory.star : val) >= star ? "var(--amber)" : "var(--border-strong)"}
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

        {/* Quick Tags */}
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
                    border: `1.5px solid ${selectedTags.includes(tag) ? "var(--green)" : "var(--border-strong)"}`,
                    background: selectedTags.includes(tag) ? "var(--green-dim)" : "transparent",
                    color: selectedTags.includes(tag) ? "var(--green)" : "var(--text-2)",
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
            border: "1.5px solid var(--border)",
            borderRadius: "var(--r-md)",
            fontSize: "0.86rem",
            fontFamily: "var(--font)",
            color: "var(--text-1)",
            background: "var(--bg-elevated)",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
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
                  border: `1.5px solid ${selectedTip === value ? "var(--primary)" : "var(--border)"}`,
                  background: selectedTip === value ? "var(--primary-dim)" : "var(--bg-elevated)",
                  color: selectedTip === value ? "var(--primary)" : "var(--text-2)",
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
            style={{ flex: 1, padding: "13px", fontSize: "0.92rem", opacity: rating === 0 ? 0.4 : 1 }}
          >
            Submit {selectedTip > 0 ? `+ ₦${selectedTip}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
