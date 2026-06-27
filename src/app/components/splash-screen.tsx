"use client";

import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";

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
        return prev + 5;
      });
    }, 100);

    const exitTimer     = setTimeout(() => setExiting(true), 2200);
    const completeTimer = setTimeout(() => onComplete(),     2700);

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
        background: "#ffffff",
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transition: exiting ? "opacity 0.5s ease" : "none",
      }}
    >
      {/* Soft bg glow */}
      <div style={{
        position: "absolute",
        width: 360,
        height: 360,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(217,95,0,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo box */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "linear-gradient(135deg, #D95F00 0%, #1A6B3C 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 35px rgba(217,95,0,0.28)",
          marginBottom: 22,
          /* keyframe defined in globals.css */
          animation: "splash-pop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0s both",
        }}
      >
        <Zap size={34} color="white" />
      </div>

      {/* Brand name */}
      <h1
        style={{
          fontSize: "2.8rem",
          fontWeight: 900,
          letterSpacing: "-1px",
          background: "linear-gradient(135deg, #1a0a00 0%, #D95F00 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          animation: "splash-fade-up 0.6s ease 0.25s both",
        }}
      >
        GLIDE
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#94a3b8",
          marginTop: 8,
          marginBottom: 44,
          animation: "splash-fade-up 0.6s ease 0.4s both",
        }}
      >
        Electric Luxury Mobility
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: 140,
          height: 3,
          background: "rgba(0,0,0,0.06)",
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
            background: "linear-gradient(90deg, #D95F00, #1A6B3C)",
            boxShadow: "0 0 8px rgba(217,95,0,0.5)",
            transition: "width 0.12s linear",
          }}
        />
      </div>
    </div>
  );
}
