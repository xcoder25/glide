"use client";

import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 4;
      });
    }, 80);

    const exitTimer     = setTimeout(() => setExiting(true), 2400);
    const completeTimer = setTimeout(() => onComplete(), 2900);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-deep)",
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.5s ease" : "none",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow orbs */}
      <div style={{
        position: "absolute",
        width: 500, height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,26,0.12) 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,194,255,0.08) 0%, transparent 70%)",
        bottom: "10%", right: "10%",
        pointerEvents: "none",
      }} />

      {/* Logo Mark */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 24,
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-primary)",
          marginBottom: 24,
          animation: "splash-pop-in 0.7s var(--ease) both",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontSize: "3.2rem",
          fontWeight: 950,
          letterSpacing: "-2px",
          color: "var(--text-1)",
          margin: 0,
          fontFamily: "var(--font-display)",
        }}
      >
        GLIDE
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--text-3)",
          marginTop: 10,
          marginBottom: 48,
          fontFamily: "var(--font)",
        }}
      >
        Smart Mobility · Uyo
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 160,
          height: 3,
          background: "var(--border-strong)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 99,
            background: "linear-gradient(90deg, var(--primary), var(--amber))",
            boxShadow: "0 0 12px var(--primary)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Version */}
      <p style={{
        position: "absolute",
        bottom: 32,
        fontSize: "0.65rem",
        color: "var(--text-3)",
        fontFamily: "var(--font)",
        fontWeight: 500,
        letterSpacing: "0.05em",
      }}>
        v2.4.1 · Uyo, Akwa Ibom
      </p>
    </div>
  );
}
