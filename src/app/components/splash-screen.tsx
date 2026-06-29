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
        background: "linear-gradient(160deg, #080e1a 0%, #0d1628 50%, #1a0d00 100%)",
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
        background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
        top: "50%", left: "50%",
        transform: "translate(-50%, -60%)",
        pointerEvents: "none",
        animation: "glow-pulse 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        width: 300, height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)",
        bottom: "10%", right: "10%",
        pointerEvents: "none",
      }} />

      {/* Logo Mark */}
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          background: "linear-gradient(135deg, #F97316 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 60px rgba(249,115,22,0.4), 0 0 0 1px rgba(249,115,22,0.3)",
          marginBottom: 28,
          animation: "splash-pop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0s both",
        }}
      >
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontSize: "3.2rem",
          fontWeight: 900,
          letterSpacing: "-2px",
          color: "#ffffff",
          margin: 0,
          fontFamily: "var(--font)",
          animation: "splash-fade-up 0.6s ease 0.25s both",
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
          color: "rgba(255,255,255,0.35)",
          marginTop: 10,
          marginBottom: 52,
          fontFamily: "var(--font)",
          animation: "splash-fade-up 0.6s ease 0.4s both",
        }}
      >
        Smart Mobility · Uyo
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 160,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 99,
          overflow: "hidden",
          animation: "splash-fade-in 0.5s ease 0.55s both",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 99,
            background: "linear-gradient(90deg, #F97316, #FB923C)",
            boxShadow: "0 0 12px rgba(249,115,22,0.6)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Version */}
      <p style={{
        position: "absolute",
        bottom: 32,
        fontSize: "0.65rem",
        color: "rgba(255,255,255,0.2)",
        fontFamily: "var(--font)",
        fontWeight: 500,
        letterSpacing: "0.05em",
        animation: "splash-fade-in 0.5s ease 0.8s both",
      }}>
        v2.4.1 · Uyo, Akwa Ibom
      </p>
    </div>
  );
}
