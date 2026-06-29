"use client";

import React, { useState } from "react";
import { X, Car, CreditCard, ShieldCheck, UploadCloud, CheckCircle } from "lucide-react";

interface DriverEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: {
    vehicleModel: string;
    plateNumber: string;
    licenseNumber: string;
    bankName: string;
    accountNumber: string;
  }) => void;
}

export default function DriverEnrollmentModal({ isOpen, onClose, onSubmit }: DriverEnrollmentModalProps) {
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUploadMock = () => {
    setLicenseUploaded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleModel || !plateNumber || !licenseNumber || !bankName || !accountNumber || !licenseUploaded) {
      setError("Please fill all fields and upload your driver's license");
      return;
    }
    setError("");
    onSubmit({
      vehicleModel,
      plateNumber,
      licenseNumber,
      bankName,
      accountNumber,
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />

      {/* Modal Card */}
      <div className="animate-scale-in" style={{
        position: "relative",
        width: "100%",
        maxWidth: "460px",
        background: "var(--bg-surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid var(--border-med)",
        boxShadow: "var(--shadow-2xl)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, var(--primary) 0%, #d93d00 100%)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#fff",
        }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 900, fontFamily: "var(--font-display)", letterSpacing: "-0.01em", margin: 0 }}>Enroll as Driver</h3>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.75)", margin: "4px 0 0 0", fontWeight: 500 }}>Join the Uyo fleet & start earning</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {error && (
            <div style={{ padding: "10px 14px", background: "var(--red-dim)", border: "1px solid rgba(255,75,75,0.25)", borderRadius: "var(--r-md)", color: "var(--red)", fontSize: "0.76rem", fontWeight: 700 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Section 1: Vehicle Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "6px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Car size={13} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Vehicle Details</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>Vehicle Model & Year</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota Corolla 2018"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                />
              </div>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>License Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. UYO-123-AB"
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />

          {/* Section 2: License info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "6px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={13} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Credentials</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>Driver's License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL-98302-K"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                />
              </div>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>Driver's License Document</label>
                <button
                  type="button"
                  onClick={handleUploadMock}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: `1.5px dashed ${licenseUploaded ? "var(--green)" : "var(--border-med)"}`,
                    background: licenseUploaded ? "var(--green-dim)" : "var(--bg-elevated)",
                    borderRadius: "var(--r-md)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s",
                  }}
                >
                  {licenseUploaded ? (
                    <>
                      <CheckCircle size={22} style={{ color: "var(--green)" }} />
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--green)" }}>License Uploaded Successfully</span>
                      <span style={{ fontSize: "0.62rem", color: "var(--text-3)", fontWeight: 500 }}>Tap to change document</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={22} style={{ color: "var(--text-3)" }} />
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-2)" }}>Upload Front of Driver's License</span>
                      <span style={{ fontSize: "0.62rem", color: "var(--text-4)" }}>Supports JPG, PNG, PDF up to 5MB</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />

          {/* Section 3: Bank info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <div style={{ width: 24, height: 24, borderRadius: "6px", background: "var(--primary-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CreditCard size={13} style={{ color: "var(--primary)" }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Payout Account</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zenith Bank"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                />
              </div>
              <div>
                <label className="section-label" style={{ marginBottom: "6px" }}>Account Number</label>
                <input
                  type="text"
                  pattern="[0-9]*"
                  maxLength={10}
                  placeholder="10-digit account no."
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", fontFamily: "var(--font)", color: "var(--text-1)", background: "var(--bg-elevated)", outline: "none", fontWeight: 500 }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: "var(--r-xl)", padding: "14px", fontSize: "0.92rem", fontWeight: 800, marginTop: "8px" }}
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
