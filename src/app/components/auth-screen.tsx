"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Mail, User, ArrowRight, ArrowLeft, Zap, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface AuthScreenProps {
  onLoginSuccess: (name: string, phone: string, email: string) => void;
}

type AuthView = "welcome" | "login" | "signup" | "otp" | "forgot" | "forgot-sent";

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>("welcome");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [signupStep, setSignupStep] = useState(1);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpAutoFilling, setOtpAutoFilling] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP countdown
  useEffect(() => {
    if (view !== "otp") return;
    setOtpTimer(30);
    const interval = setInterval(() => {
      setOtpTimer(t => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [view]);

  // OTP auto-fill simulation after 3s
  useEffect(() => {
    if (view !== "otp") return;
    const timeout = setTimeout(() => {
      setOtpAutoFilling(true);
      const code = ["4", "2", "0", "7", "1", "9"];
      code.forEach((digit, i) => {
        setTimeout(() => {
          setOtp(prev => {
            const next = [...prev];
            next[i] = digit;
            return next;
          });
        }, i * 80);
      });
      setTimeout(() => setOtpAutoFilling(false), 600);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [view]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = () => {
    setError("");
    if (authMethod === "phone" && phone.trim().length < 9) { setError("Enter a valid phone number"); return; }
    if (authMethod === "email" && !email.includes("@")) { setError("Enter a valid email address"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess("Alex Johnson", phone || "08000000000", email || "alex@example.com");
    }, 1200);
  };

  const handleSignupStep1 = () => {
    if (fullName.trim().length < 2) { setError("Please enter your full name"); return; }
    setError("");
    setSignupStep(2);
  };

  const handleSignupSubmit = () => {
    setError("");
    if (!email.includes("@")) { setError("Enter a valid email address"); return; }
    if (phone.trim().length < 9) { setError("Enter a valid phone number"); return; }
    if (!agreedToTerms) { setError("Please agree to Terms & Conditions"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView("otp");
    }, 800);
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter all 6 digits"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(fullName, phone, email);
    }, 900);
  };

  const reset = () => {
    setError("");
    setLoading(false);
    setSignupStep(1);
    setOtp(["", "", "", "", "", ""]);
  };

  const go = (v: AuthView) => { reset(); setView(v); };

  // ─────────────── WELCOME ───────────────
  if (view === "welcome") {
    return (
      <div className="animate-fade-in" style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(24px, 6vw, 48px) clamp(20px, 6vw, 40px)",
        background: "var(--bg-gradient)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decorations */}
        <div style={{ position: "absolute", top: "15%", right: "-10%", width: 260, height: 260, borderRadius: "50%", background: "rgba(217,95,0,0.07)", filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "-10%", width: 200, height: 200, borderRadius: "50%", background: "rgba(26,107,60,0.08)", filter: "blur(50px)", pointerEvents: "none" }} />

        {/* Logo */}
        <div className="animate-slide-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "56px" }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "24px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 48px rgba(217,95,0,0.35)",
          }}>
            <Zap size={40} color="#fff" strokeWidth={2.5} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2.8rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.03em", lineHeight: 1 }}>Glide</h1>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>Uyo Smart Mobility Platform</p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="animate-slide-up" style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginBottom: "48px" }}>
          {["🚗 Fast Rides", "🔒 Verified Drivers", "₦ Fair Fares", "📍 Uyo & Beyond"].map(tag => (
            <span key={tag} style={{
              padding: "6px 14px",
              background: "rgba(217,95,0,0.08)",
              border: "1px solid rgba(217,95,0,0.15)",
              borderRadius: "99px",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "var(--primary)",
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="animate-slide-up" style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => go("signup")}
            className="btn btn-primary"
            style={{ padding: "16px", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
          >
            <Zap size={20} /> Get Started Free
          </button>
          <button
            onClick={() => go("login")}
            className="btn btn-secondary"
            style={{ padding: "16px", fontSize: "1rem" }}
          >
            I already have an account
          </button>
        </div>

        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "24px", textAlign: "center" }}>
          By continuing you agree to our <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</span> &{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    );
  }

  // ─────────────── FORGOT PASSWORD SENT ───────────────
  if (view === "forgot-sent") {
    return (
      <div className="animate-fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 28px" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(26,107,60,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={32} style={{ color: "var(--accent)" }} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)" }}>Check your email</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            We sent a password reset link to <strong style={{ color: "var(--text-main)" }}>{forgotEmail || "your email"}</strong>. Check your inbox and follow the instructions.
          </p>
          <button onClick={() => go("login")} className="btn btn-primary" style={{ marginTop: "8px", padding: "14px 32px", width: "100%" }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── FORGOT PASSWORD ───────────────
  if (view === "forgot") {
    return (
      <div className="animate-slide-right" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "60px 28px 32px" }}>
        <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Login
        </button>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "18px", background: "rgba(217,95,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Mail size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Forgot Password?</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.6 }}>
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ padding: "14px 16px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
          />
          {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}
          <button
            onClick={() => {
              if (!forgotEmail.includes("@")) { setError("Enter a valid email"); return; }
              go("forgot-sent");
            }}
            className="btn btn-primary"
            style={{ padding: "15px", fontSize: "0.95rem" }}
          >
            Send Reset Link <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── OTP VERIFICATION ───────────────
  if (view === "otp") {
    const allFilled = otp.every(d => d !== "");
    return (
      <div className="animate-slide-right" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "60px 28px 32px" }}>
        <button onClick={() => { go("signup"); setSignupStep(2); }} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "18px", background: "rgba(217,95,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Phone size={26} style={{ color: "var(--primary)" }} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.01em" }}>Verify your number</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.6 }}>
            We sent a 6-digit code to <strong style={{ color: "var(--text-main)" }}>{phone || "+234 800 000 0000"}</strong>
          </p>
          {otpAutoFilling && (
            <p style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600, marginTop: "4px" }}>📲 Auto-filling from SMS...</p>
          )}
        </div>

        {/* OTP Boxes */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el; }}
              className="otp-input"
              type="tel"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
            />
          ))}
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleVerifyOtp}
          disabled={!allFilled || loading}
          className="btn btn-primary"
          style={{ padding: "15px", fontSize: "0.95rem", opacity: allFilled ? 1 : 0.5, marginBottom: "16px" }}
        >
          {loading ? "Verifying..." : "Verify & Create Account"} {!loading && <ArrowRight size={18} />}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {otpTimer > 0 ? (
            <span>Resend code in <strong style={{ color: "var(--text-main)" }}>{otpTimer}s</strong></span>
          ) : (
            <button
              onClick={() => { setOtp(["", "", "", "", "", ""]); setOtpTimer(30); setError(""); }}
              style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─────────────── LOGIN ───────────────
  if (view === "login") {
    return (
      <div className="animate-slide-right" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "clamp(40px, 8vw, 72px) clamp(20px, 6vw, 36px) clamp(24px, 5vw, 40px)" }}>
        <button onClick={() => go("welcome")} style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.02em" }}>Welcome back 👋</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>Sign in to continue your journeys</p>
        </div>

        {/* Method Toggle */}
        <div className="tab-bar" style={{ marginBottom: "20px" }}>
          <button className={`tab-item${authMethod === "phone" ? " active" : ""}`} onClick={() => setAuthMethod("phone")}>
            <Phone size={13} style={{ display: "inline", marginRight: "5px" }} /> Phone
          </button>
          <button className={`tab-item${authMethod === "email" ? " active" : ""}`} onClick={() => setAuthMethod("email")}>
            <Mail size={13} style={{ display: "inline", marginRight: "5px" }} /> Email
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {authMethod === "phone" ? (
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              style={{ padding: "14px 16px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
          ) : (
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ padding: "14px 16px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
          )}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{ padding: "14px 48px 14px 16px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            onClick={() => go("forgot")}
            style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.82rem", textAlign: "right" }}
          >
            Forgot password?
          </button>

          {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

          <button onClick={handleLogin} disabled={loading} className="btn btn-primary" style={{ padding: "15px", fontSize: "0.95rem", marginTop: "4px" }}>
            {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={18} /></>}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "8px" }}>
            Don't have an account?{" "}
            <button onClick={() => go("signup")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ─────────────── SIGN UP ───────────────
  return (
    <div className="animate-slide-right" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "clamp(40px, 8vw, 72px) clamp(20px, 6vw, 36px) clamp(24px, 5vw, 40px)" }}>
      <button
        onClick={() => { if (signupStep > 1) { setSignupStep(1); setError(""); } else go("welcome"); }}
        style={{ border: "none", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontFamily: "var(--font-sans)", marginBottom: "32px" }}
      >
        <ArrowLeft size={16} /> {signupStep > 1 ? "Back" : "Home"}
      </button>

      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
          {signupStep === 1 ? "Create account" : "Your contacts"}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "6px" }}>
          {signupStep === 1 ? "Step 1 of 2 — Tell us your name" : "Step 2 of 2 — Almost there!"}
        </p>
        <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
          <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: "var(--primary)" }} />
          <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: signupStep === 2 ? "var(--primary)" : "rgba(0,0,0,0.08)" }} />
        </div>
      </div>

      {signupStep === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <User size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full Name"
              style={{ padding: "14px 14px 14px 40px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
          </div>
          {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}
          <button onClick={handleSignupStep1} className="btn btn-primary" style={{ padding: "15px", fontSize: "0.95rem", marginTop: "4px" }}>
            Continue <ArrowRight size={18} />
          </button>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
              Sign In
            </button>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ position: "relative" }}>
            <Phone size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              style={{ padding: "14px 14px 14px 40px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              style={{ padding: "14px 14px 14px 40px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create password"
              style={{ padding: "14px 48px 14px 16px", border: "1.5px solid var(--card-border-focus)", borderRadius: "14px", fontSize: "0.95rem", fontFamily: "var(--font-sans)", color: "var(--text-main)", background: "rgba(0,0,0,0.01)", outline: "none", width: "100%" }}
            />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: "1px", accentColor: "var(--primary)", flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              I agree to Glide's <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</span> and{" "}
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</span>
            </span>
          </label>

          {error && <p style={{ color: "#dc2626", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

          <button onClick={handleSignupSubmit} disabled={loading} className="btn btn-primary" style={{ padding: "15px", fontSize: "0.95rem", marginTop: "4px" }}>
            {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={18} /></>}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
              Sign In
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
