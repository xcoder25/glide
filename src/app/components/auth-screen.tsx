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
      <div className="full-screen animate-fade-in" style={{
        justifyContent: "flex-end",
        position: "absolute",
        overflow: "hidden",
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
          background: "linear-gradient(to bottom, rgba(4, 4, 9, 0.25) 0%, rgba(4, 4, 9, 0.6) 50%, rgba(4, 4, 9, 0.92) 100%)",
          zIndex: 2,
        }} />

        {/* Bottom Frosted Glass Panel Container */}
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
      </div>
    );
  }

  // ─────────────── FORGOT PASSWORD SENT ───────────────
  if (view === "forgot-sent") {
    return (
      <div className="full-screen animate-fade-in" style={{ alignItems: "center", justifyContent: "center", padding: "32px 28px" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", maxWidth: 380 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={32} style={{ color: "var(--green)" }} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Check your email</h2>
          <p style={{ fontSize: "0.88rem", color: "var(--text-3)", lineHeight: 1.6 }}>
            We sent a password reset link to <strong style={{ color: "var(--text-1)" }}>{forgotEmail}</strong>.
          </p>
          <button onClick={() => go("login")} className="btn btn-primary" style={{ marginTop: "8px", width: "100%" }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ─────────────── FORGOT PASSWORD ───────────────
  if (view === "forgot") {
    return (
      <div className="full-screen animate-screen-in" style={{ padding: "60px 24px" }}>
        <button onClick={() => go("login")} className="back-btn" style={{ border: "none", background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back to Login
        </button>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>Forgot Password?</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "6px", lineHeight: 1.6 }}>
            Enter your email and we'll send you a reset link.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            placeholder="your@email.com"
            className="input-field"
            style={{ paddingLeft: "16px" }}
          />
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
      <div className="full-screen animate-screen-in" style={{ padding: "60px 24px" }}>
        <button onClick={() => { go("signup"); setSignupStep(2); }} style={{ border: "none", background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-display)" }}>Verify your number</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "6px" }}>
            We sent a 6-digit code to <strong style={{ color: "var(--text-1)" }}>{phone || "+234 800 000 0000"}</strong>
          </p>
          {otpAutoFilling && (
            <p style={{ fontSize: "0.75rem", color: "var(--cyan)", fontWeight: 600, marginTop: "6px" }}>📲 Auto-filling from SMS...</p>
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

        {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600, textAlign: "center", marginBottom: "12px" }}>{error}</p>}

        <button
          onClick={handleVerifyOtp}
          disabled={!allFilled || loading}
          className="btn btn-primary"
          style={{ opacity: allFilled ? 1 : 0.5, marginBottom: "16px", borderRadius: "var(--r-xl)" }}
        >
          {loading ? "Verifying..." : "Verify & Create Account"} {!loading && <ArrowRight size={16} />}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--text-3)" }}>
          {otpTimer > 0 ? (
            <span>Resend code in <strong style={{ color: "var(--text-1)" }}>{otpTimer}s</strong></span>
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
      <div className="full-screen animate-screen-in" style={{ padding: "60px 24px" }}>
        <button onClick={() => go("welcome")} style={{ border: "none", background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginBottom: "32px" }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Welcome back 👋</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "6px" }}>Sign in to continue your journeys</p>
        </div>

        {/* Method Toggle */}
        <div className="tab-bar" style={{ marginBottom: "20px" }}>
          <button className={`tab-item${authMethod === "phone" ? " active" : ""}`} onClick={() => setAuthMethod("phone")}>
            Phone
          </button>
          <button className={`tab-item${authMethod === "email" ? " active" : ""}`} onClick={() => setAuthMethod("email")}>
            Email
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {authMethod === "phone" ? (
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="input-field"
              style={{ paddingLeft: "16px" }}
            />
          ) : (
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
              style={{ paddingLeft: "16px" }}
            />
          )}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
              style={{ paddingLeft: "16px", paddingRight: "48px" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-3)" }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-3)", marginTop: "8px" }}>
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
    <div className="full-screen animate-screen-in" style={{ padding: "60px 24px" }}>
      <button
        onClick={() => { if (signupStep > 1) { setSignupStep(1); setError(""); } else go("welcome"); }}
        style={{ border: "none", background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", marginBottom: "32px" }}
      >
        <ArrowLeft size={16} /> {signupStep > 1 ? "Back" : "Home"}
      </button>

      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
          {signupStep === 1 ? "Create account" : "Your details"}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginTop: "6px" }}>
          {signupStep === 1 ? "Step 1 of 2 — Tell us your name" : "Step 2 of 2 — Almost there!"}
        </p>
        <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
          <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: "var(--primary)" }} />
          <div style={{ height: "3px", flex: 1, borderRadius: "99px", background: signupStep === 2 ? "var(--primary)" : "var(--border)" }} />
        </div>
      </div>

      {signupStep === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Full Name"
            className="input-field"
            style={{ paddingLeft: "16px" }}
          />
          {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}
          <button onClick={handleSignupStep1} className="btn btn-primary" style={{ marginTop: "4px", borderRadius: "var(--r-xl)" }}>
            Continue <ArrowRight size={16} />
          </button>
          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-3)" }}>
            Already have an account?{" "}
            <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              Sign In
            </button>
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="input-field"
            style={{ paddingLeft: "16px" }}
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="input-field"
            style={{ paddingLeft: "16px" }}
          />
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create password"
              className="input-field"
              style={{ paddingLeft: "16px", paddingRight: "48px" }}
            />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "var(--text-3)" }}>
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
            <span style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.5 }}>
              I agree to Glide's <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms of Service</span> and{" "}
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>Privacy Policy</span>
            </span>
          </label>

          {error && <p style={{ color: "var(--red)", fontSize: "0.82rem", fontWeight: 600 }}>{error}</p>}

          <button onClick={handleSignupSubmit} disabled={loading} className="btn btn-primary" style={{ marginTop: "4px", borderRadius: "var(--r-xl)" }}>
            {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-3)" }}>
            Already have an account?{" "}
            <button onClick={() => go("login")} style={{ border: "none", background: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              Sign In
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
