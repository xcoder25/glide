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
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    const exitTimer = setTimeout(() => setExiting(true), 2400);
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
        background: "linear-gradient(to bottom, rgba(4, 4, 9, 0.45) 0%, rgba(4, 4, 9, 0.75) 50%, rgba(4, 4, 9, 0.96) 100%), url('/ride.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 9999,
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.05)" : "scale(1)",
        transition: exiting ? "opacity 0.6s var(--ease), transform 0.6s var(--ease)" : "none",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow orbs - Animated for depth */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 82, 0, 0.14) 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          pointerEvents: "none",
          animation: "ambient-aurora 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 229, 255, 0.1) 0%, transparent 70%)",
          bottom: "5%",
          right: "5%",
          pointerEvents: "none",
          animation: "ambient-aurora-secondary 10s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 0, 122, 0.08) 0%, transparent 70%)",
          top: "-5%",
          left: "-5%",
          pointerEvents: "none",
          animation: "ambient-aurora-secondary 12s ease-in-out infinite alternate-reverse",
        }}
      />

      {/* Floating Logo Squircle Emblem */}
      <div
        style={{
          position: "relative",
          width: "96px",
          height: "96px",
          borderRadius: "28px",
          background: "linear-gradient(135deg, rgba(255, 82, 0, 0.95) 0%, rgba(255, 0, 122, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 20px 50px rgba(255, 82, 0, 0.4), inset 0 0 12px rgba(255, 255, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          animation: "splash-image-enter 1s var(--ease) both, gentle-float 4.5s ease-in-out infinite 1s",
          zIndex: 10,
        }}
      >
        <Zap size={44} color="#ffffff" strokeWidth={2.5} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }} />
      </div>

      {/* Brand name - with tracking reveal */}
      <h1
        style={{
          fontSize: "3.4rem",
          fontWeight: 950,
          letterSpacing: "-2px",
          color: "#ffffff",
          margin: 0,
          fontFamily: "var(--font-display)",
          animation: "text-reveal-expand 1s var(--ease) both",
          zIndex: 10,
        }}
      >
        GLIDE
      </h1>

      {/* Tagline - with reveal */}
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255, 255, 255, 0.7)",
          marginTop: 8,
          marginBottom: 44,
          fontFamily: "var(--font)",
          animation: "tagline-reveal 1.2s var(--ease) both",
          zIndex: 10,
        }}
      >
        Smart Mobility · Uyo
      </p>

      {/* Progress bar container */}
      <div
        style={{
          width: 170,
          height: 4,
          background: "rgba(255, 255, 255, 0.15)",
          borderRadius: 99,
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 99,
            background: "linear-gradient(90deg, var(--primary), var(--cyan))",
            transition: "width 0.1s linear",
            animation: "pulse-progress 2.5s infinite ease-in-out",
          }}
        />
      </div>

      {/* Version footer */}
      <p
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: "0.68rem",
          color: "rgba(255, 255, 255, 0.5)",
          fontFamily: "var(--font)",
          fontWeight: 500,
          letterSpacing: "0.05em",
          opacity: 0.8,
          zIndex: 10,
        }}
      >
        v2.5.0 · Uyo, Akwa Ibom
      </p>
    </div>
  );
}
