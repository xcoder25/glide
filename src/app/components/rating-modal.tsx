"use client";

import React, { useState } from "react";
import { Star, X, ThumbsUp, Zap } from "lucide-react";

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
  { label: "₦100", value: 100 },
  { label: "₦200", value: 200 },
  { label: "₦500", value: 500 },
];

const QUICK_TAGS = [
  "Safe Driver 🛡️",
  "Clean Car ✨",
  "On Time ⏱️",
  "Friendly 😊",
  "Smooth Ride 🚗",
  "Great Music 🎵",
];

export default function RatingModal({
  driverName,
  categoryName,
  fare,
  pickupName,
  dropoffName,
  onSubmit,
  onSkip,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTip, setSelectedTip] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Great";
      case 5: return "Excellent!";
      default: return "Tap to rate";
    }
  };

  const getRatingColor = (r: number) => {
    if (r <= 2) return "#dc2626";
    if (r === 3) return "#d97706";
    return "var(--accent)";
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(rating, selectedTip, [comment, ...selectedTags].filter(Boolean).join(" | "));
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet animate-modal-pop" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent) 0%, #0d5c2e 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(26,107,60,0.35)" }}>
            <ThumbsUp size={36} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Thank you!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.5 }}>
              Your feedback helps us improve Glide for everyone in Lagos.
            </p>
          </div>
          {selectedTip > 0 && (
            <div style={{ padding: "12px 20px", background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)", borderRadius: "12px", fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
              ₦{selectedTip.toLocaleString()} tip sent to {driverName.split(" ")[0]} 🙏
            </div>
          )}
          <div style={{ display: "flex", gap: "4px" }}>
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={22} fill={i <= rating ? "var(--accent)" : "transparent"} stroke={i <= rating ? "var(--accent)" : "var(--text-muted)"} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-sheet animate-modal-pop" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={14} color="#fff" />
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Trip Complete</span>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Rate your ride</h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {pickupName} → {dropoffName}
            </p>
          </div>
          <button
            onClick={onSkip}
            style={{ border: "none", background: "rgba(0,0,0,0.05)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Driver Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "rgba(0,0,0,0.015)", borderRadius: "14px", border: "1px solid var(--card-border)" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem", color: "#fff", flexShrink: 0, boxShadow: "0 4px 12px rgba(217,95,0,0.25)" }}>
            {driverName.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>{driverName}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{categoryName}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--primary)" }}>₦{fare.toLocaleString()}</p>
            <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL PAID</p>
          </div>
        </div>

        {/* Star Rating */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", transition: "transform 0.15s", transform: hoveredStar >= star || rating >= star ? "scale(1.15)" : "scale(1)" }}
              >
                <Star
                  size={36}
                  fill={(hoveredStar || rating) >= star ? "var(--accent)" : "transparent"}
                  stroke={(hoveredStar || rating) >= star ? "var(--accent)" : "rgba(0,0,0,0.15)"}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: rating > 0 ? getRatingColor(rating) : "var(--text-muted)", transition: "color 0.2s" }}>
            {getRatingLabel(hoveredStar || rating)}
          </span>
        </div>

        {/* Quick Tags */}
        {rating >= 4 && (
          <div className="animate-slide-up">
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>What was great?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: `1.5px solid ${selectedTags.includes(tag) ? "var(--accent)" : "var(--card-border)"}`,
                    background: selectedTags.includes(tag) ? "rgba(26,107,60,0.08)" : "transparent",
                    color: selectedTags.includes(tag) ? "var(--accent)" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-sans)",
                    transition: "all 0.2s",
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comment Box */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a note for your driver... (optional)"
          rows={2}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1.5px solid var(--card-border)",
            borderRadius: "12px",
            fontSize: "0.88rem",
            fontFamily: "var(--font-sans)",
            color: "var(--text-main)",
            background: "rgba(0,0,0,0.01)",
            outline: "none",
            resize: "none",
            lineHeight: 1.5,
          }}
        />

        {/* Tip Selection */}
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Add a tip?</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
            {TIP_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSelectedTip(value)}
                style={{
                  padding: "10px 6px",
                  borderRadius: "10px",
                  border: `1.5px solid ${selectedTip === value ? "var(--primary)" : "var(--card-border)"}`,
                  background: selectedTip === value ? "rgba(217,95,0,0.07)" : "transparent",
                  color: selectedTip === value ? "var(--primary)" : "var(--text-muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onSkip}
            className="btn btn-secondary"
            style={{ padding: "13px 20px", fontSize: "0.88rem" }}
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="btn btn-primary"
            style={{ flex: 1, padding: "13px", fontSize: "0.92rem", opacity: rating === 0 ? 0.45 : 1 }}
          >
            Submit Rating {selectedTip > 0 ? `+ ₦${selectedTip} Tip` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
