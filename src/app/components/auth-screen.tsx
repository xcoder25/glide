"use client";

import React, { useState, useEffect, useRef } from "react";
import { Phone, Mail, User, ArrowRight, ArrowLeft, Zap, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";

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

  // ─────────────── RENDER CONTENT HELPER ───────────────
  const renderContent = () => {
    // ─────────────── WELCOME ───────────────
    if (view === "welcome") {
      return (
        <div style={{
          width: "100%",
          maxWidth: 460,
          background: "rgba(10, 10, 20, 0.68)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "32px 32px 0 0",
          padding: "36px 24px max(env(safe-area-inset-bottom, 0px), 36px) 24px",
          boxShadow: "0 -12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          animation: "panel-slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both",
          margin: "0 auto",
        }}>
          
          {/* Header Branding */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-primary)",
            }}>
              <Zap size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "1.35rem", fontWeight: 950, color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Glide</span>
            <span style={{
              marginLeft: "auto",
              padding: "4px 12px",
              background: "rgba(255, 82, 0, 0.15)",
              border: "1px solid rgba(255, 82, 0, 0.3)",
              borderRadius: "99px",
              fontSize: "0.65rem",
              fontWeight: 800,
              color: "var(--primary)",
              letterSpacing: "0.04em",
            }}>
              📍 UYO PREMIUM
            </span>
          </div>

          {/* Welcome Pitch */}
          <div>
            <h2 style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#ffffff",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.04em"
            }}>
              Fast rides, <br />
              on <span style={{ background: "linear-gradient(90deg, var(--primary), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>demand.</span>
            </h2>
            <p style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.7)",
              marginTop: "12px",
              lineHeight: 1.5,
              fontWeight: 500
            }}>
              Experience safe, affordable, and comfortable rides anywhere in Uyo.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button onClick={() => go("signup")} className="btn btn-primary" style={{ padding: "16px", borderRadius: "var(--r-xl)", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)", color: "#ffffff" }}>
              <span>Create Account</span> <ArrowRight size={16} />
            </button>
            
            <button onClick={() => go("login")} className="btn" style={{
              padding: "16px",
              borderRadius: "var(--r-xl)",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}>
              I already have an account
            </button>

            <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.45)", marginTop: "12px", textAlign: "center", lineHeight: 1.4 }}>
              By getting started, you agree to our <br />
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>Terms of Service</span> &amp; <span style={{ color: "var(--primary)", fontWeight: 700 }}>Privacy Policy</span>
            </p>
          </div>
        </div>
      );
    }

    // ─────────────── FORGOT PASSWORD SENT ───────────────
    if (view === "forgot-sent") {
      return (
        <div className="auth-glass-card" style={{ alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0, 181, 116, 0.15)", border: "1px solid rgba(0, 181, 116, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
            <ShieldCheck size={28} style={{ color: "var(--green)" }} />
          </div>
          
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-display)" }}>Check your email</h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.7)", marginTop: "8px", lineHeight: 1.6 }}>
              We sent a password reset link to <br /><strong style={{ color: "#ffffff" }}>{forgotEmail}</strong>.
            </p>
          </div>

          <button onClick={() => go("login")} className="btn btn-primary" style={{ marginTop: "12px", width: "100%" }}>
            Back to Login
          </button>
        </div>
      );
    }

    // ─────────────── FORGOT PASSWORD ───────────────
    if (view === "forgot") {
      return (
        <div className="auth-glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <button onClick={() => go("login")} className="auth-back-btn">
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Reset Password</span>
          </div>

          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>Forgot Password?</h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "6px", lineHeight: 1.5 }}>
              Enter your registered email below to receive a password reset link.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="Email Address"
                className="input-field"
                style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
            </div>

            {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

            <button
              onClick={() => {
                if (!forgotEmail.includes("@")) { setError("Enter a valid email"); return; }
                go("forgot-sent");
              }}
              className="btn btn-primary"
              style={{ borderRadius: "var(--r-xl)" }}
            >
              Send Reset Link <ArrowRight size={16} />
            </button>
          </div>
        </div>
      );
    }

    // ─────────────── OTP VERIFICATION ───────────────
    if (view === "otp") {
      const allFilled = otp.every(d => d !== "");
      return (
        <div className="auth-glass-card" style={{ alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <button onClick={() => { go("signup"); setSignupStep(2); }} className="auth-back-btn">
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Verification</span>
          </div>

          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Verify Number</h2>
            <p style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "6px", lineHeight: 1.4 }}>
              We sent a 6-digit code to <strong style={{ color: "#ffffff" }}>{phone || "+234 800 000 0000"}</strong>
            </p>
            {otpAutoFilling && (
              <p style={{ fontSize: "0.75rem", color: "var(--cyan)", fontWeight: 600, marginTop: "6px" }}>📲 Auto-filling from SMS...</p>
            )}
          </div>

          {/* OTP Boxes */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "10px 0 14px 0" }}>
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
                style={{ background: "rgba(255, 255, 255, 0.04)", border: "1.5px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
            ))}
          </div>

          {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", marginBottom: "12px" }}>{error}</p>}

          <button
            onClick={handleVerifyOtp}
            disabled={!allFilled || loading}
            className="btn btn-primary"
            style={{ opacity: allFilled ? 1 : 0.5, marginBottom: "12px", borderRadius: "var(--r-xl)" }}
          >
            {loading ? "Verifying..." : "Verify & Create Account"} {!loading && <ArrowRight size={16} />}
          </button>

          <div style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
            {otpTimer > 0 ? (
              <span>Resend code in <strong style={{ color: "#ffffff" }}>{otpTimer}s</strong></span>
            ) : (
              <button
                onClick={() => { setOtp(["", "", "", "", "", ""]); setOtpTimer(30); setError(""); }}
                style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
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
        <div className="auth-glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
            <button onClick={() => go("welcome")} className="auth-back-btn">
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Welcome Back</span>
          </div>

          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Sign In</h2>
            <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>Select your login method to continue</p>
          </div>

          {/* Method Toggle */}
          <div className="tab-bar" style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.06)", padding: "4px" }}>
            <button className={`tab-item${authMethod === "phone" ? " active" : ""}`} onClick={() => setAuthMethod("phone")} style={{ color: authMethod === "phone" ? "var(--primary)" : "rgba(255, 255, 255, 0.6)", background: authMethod === "phone" ? "rgba(255,255,255,0.08)" : "transparent" }}>
              Phone
            </button>
            <button className={`tab-item${authMethod === "email" ? " active" : ""}`} onClick={() => setAuthMethod("email")} style={{ color: authMethod === "email" ? "var(--primary)" : "rgba(255, 255, 255, 0.6)", background: authMethod === "email" ? "rgba(255,255,255,0.08)" : "transparent" }}>
              Email
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {authMethod === "phone" ? (
              <div className="auth-input-wrapper">
                <Phone size={16} className="auth-input-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="input-field"
                  style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
                />
              </div>
            ) : (
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="input-field"
                  style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
                />
              </div>
            )}

            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field"
                style={{ paddingLeft: "42px", paddingRight: "44px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 14, border: "none", background: "none", cursor: "pointer", color: "rgba(255, 255, 255, 0.55)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button
              onClick={() => go("forgot")}
              style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", textAlign: "right" }}
            >
              Forgot password?
            </button>

            {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

            <button onClick={handleLogin} disabled={loading} className="btn btn-primary" style={{ marginTop: "4px", borderRadius: "var(--r-xl)" }}>
              {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "8px" }}>
              Don't have an account?{" "}
              <button onClick={() => go("signup")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                Sign Up
              </button>
            </p>
          </div>
        </div>
      );
    }

    // ─────────────── SIGN UP ───────────────
    return (
      <div className="auth-glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
          <button onClick={() => { if (signupStep > 1) { setSignupStep(1); setError(""); } else go("welcome"); }} className="auth-back-btn">
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {signupStep === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </span>
        </div>

        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            {signupStep === 1 ? "Create Account" : "Add Details"}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "4px" }}>
            {signupStep === 1 ? "Tell us your name to get started" : "Provide your contact details"}
          </p>
          <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
            <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: "var(--primary)" }} />
            <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: signupStep === 2 ? "var(--primary)" : "rgba(255, 255, 255, 0.15)" }} />
          </div>
        </div>

        {signupStep === 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="auth-input-wrapper">
              <User size={16} className="auth-input-icon" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Full Name"
                className="input-field"
                style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}
            <button onClick={handleSignupStep1} className="btn btn-primary" style={{ marginTop: "4px", borderRadius: "var(--r-xl)" }}>
              Continue <ArrowRight size={16} />
            </button>
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
              Already have an account?{" "}
              <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                Sign In
              </button>
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="auth-input-wrapper">
              <Phone size={16} className="auth-input-icon" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="input-field"
                style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
            </div>

            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address"
                className="input-field"
                style={{ paddingLeft: "42px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
            </div>

            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create Password"
                className="input-field"
                style={{ paddingLeft: "42px", paddingRight: "44px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, border: "none", background: "none", cursor: "pointer", color: "rgba(255, 255, 255, 0.55)" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginTop: "4px" }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={e => setAgreedToTerms(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: "1px", accentColor: "var(--primary)", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.4 }}>
                I agree to Glide's <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</span> and{" "}
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</span>
              </span>
            </label>

            {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

            <button onClick={handleSignupSubmit} disabled={loading} className="btn btn-primary" style={{ marginTop: "4px", borderRadius: "var(--r-xl)" }}>
              {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>

            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)" }}>
              Already have an account?{" "}
              <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="full-screen animate-fade-in" style={{
      justifyContent: view === "welcome" ? "flex-end" : "center",
      alignItems: "center",
      position: "absolute",
      overflow: "hidden",
      padding: view === "welcome" ? "0" : "24px",
    }}>
      {/* Local CSS Injection */}
      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes panel-slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes card-fade-in {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .auth-glass-card {
          width: 100%;
          max-width: 440px;
          background: rgba(10, 10, 20, 0.72);
          backdrop-filter: blur(36px);
          -webkit-backdrop-filter: blur(36px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 32px 24px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12);
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: card-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .auth-back-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        .auth-back-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateX(-2px);
        }
        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: rgba(255, 255, 255, 0.45);
          pointer-events: none;
        }
      `}</style>

      {/* Ken Burns Animated Background Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url('/ride.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        animation: "ken-burns 28s ease-in-out infinite",
        zIndex: 1,
      }} />

      {/* Dark Ambient Overlay Layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: view === "welcome"
          ? "linear-gradient(to bottom, rgba(4, 4, 9, 0.25) 0%, rgba(4, 4, 9, 0.6) 50%, rgba(4, 4, 9, 0.92) 100%)"
          : "linear-gradient(to bottom, rgba(4, 4, 9, 0.5) 0%, rgba(4, 4, 9, 0.8) 50%, rgba(4, 4, 9, 0.95) 100%)",
        zIndex: 2,
      }} />

      {/* Render active sub-view content */}
      {renderContent()}
    </div>
  );
}
