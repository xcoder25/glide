"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AuthScreen from "./components/auth-screen";
import SplashScreen from "./components/splash-screen";
import HomeScreen from "./components/home-screen";
import BookingScreen from "./components/booking-screen";
import ActiveRide, { type RideStatus } from "./components/active-ride";
import PaymentScreen, { type PaymentState, type WalletTransaction } from "./components/payment-screen";
import RideHistoryScreen, { type RideRecord } from "./components/ride-history-screen";
import ProfileScreen, { type UserProfile } from "./components/profile-screen";
import SettingsScreen, { type AppSettings } from "./components/settings-screen";
import BottomNav, { type AppView } from "./components/bottom-nav";
import TopNav from "./components/top-nav";
import { type LocationData } from "./components/booking-form";
import { type RideCategory } from "./components/ride-selector";
import RatingModal from "./components/rating-modal";
import NotificationsPanel from "./components/notifications-panel";

// Import Leaflet Map dynamically (SSR disabled)
const GlideMap = dynamic(() => import("./components/map"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)", color: "rgba(255,255,255,0.4)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(217,95,0,0.3)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s infinite linear", margin: "0 auto 14px auto" }} />
        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Loading Uyo map...</span>
      </div>
    </div>
  ),
});

// Haversine in km
function getKmDistance(loc1: LocationData, loc2: LocationData) {
  const R = 6371;
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((loc1.lat * Math.PI) / 180) * Math.cos((loc2.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

const SEED_HISTORY: RideRecord[] = [
  { id: "r1", date: "Yesterday, 4:18 PM", pickup: "Ibom Plaza", dropoff: "Akwa Ibom Airport", fare: 3800, distance: 8, category: "Glide Ride", driverName: "Marcus Sterling", rating: 5, status: "completed" },
  { id: "r2", date: "June 26, 9:04 AM", pickup: "Ibom Icon Hotel", dropoff: "University of Uyo (UNIUYO)", fare: 2500, distance: 12, category: "Glide Premium", driverName: "Chidi Obi", rating: 4, status: "completed" },
  { id: "r3", date: "June 24, 7:30 PM", pickup: "Uyo Central Market", dropoff: "Godswill Akpabio Stadium", fare: 0, distance: 4, category: "Glide Lite", driverName: "Emeka Nwosu", status: "cancelled", cancelReason: "Driver took too long" },
];

const SEED_TRANSACTIONS: WalletTransaction[] = [
  { id: "tx1", date: "Yesterday", description: "Ride Payment — Ibom Plaza → Airport", amount: 3800, type: "debit" },
  { id: "tx2", date: "June 26", description: "Wallet Top-up", amount: 20000, type: "credit" },
  { id: "tx3", date: "June 24", description: "Promo Bonus — WELCOME", amount: 500, type: "credit" },
];

export default function Home() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRating, setPendingRating] = useState<{ driverName: string; categoryName: string; fare: number; pickupName: string; dropoffName: string } | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── View State Machine ──
  const [currentView, setCurrentView] = useState<AppView>("home");

  // ── User State ──
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: "Rider",
    phone: "+234 800 000 0000",
    email: "rider@glide.ng",
    homeAddress: "",
    workAddress: "",
    emergencyName: "",
    emergencyPhone: "",
    avatarColor: "#D95F00",
  });

  // ── Ride State ──
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [dropoff, setDropoff] = useState<LocationData | null>(null);
  const [distance, setDistance] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory | null>(null);
  const [bookedPrice, setBookedPrice] = useState(0);
  const [rideStatus, setRideStatus] = useState<RideStatus>("searching");
  const [isBooked, setIsBooked] = useState(false);

  // ── Booking Screen ──
  const [bookingInitialPickup, setBookingInitialPickup] = useState<LocationData | undefined>();
  const [bookingInitialDropoff, setBookingInitialDropoff] = useState<LocationData | undefined>();

  // ── History / Payment / Settings ──
  const [rideHistory, setRideHistory] = useState<RideRecord[]>(SEED_HISTORY);
  const [recentDestinations, setRecentDestinations] = useState<LocationData[]>([]);

  const [payment, setPayment] = useState<PaymentState>({
    walletBalance: 15200,
    preferCash: false,
    activeCard: "visa-4829",
    transactions: SEED_TRANSACTIONS,
    promoApplied: null,
  });

  const [deviceLocation, setDeviceLocation] = useState<LocationData | null>(null);

  // ── Device Geolocation Effect with Reverse Geocoding ──
  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const addressText = data.display_name || "Current Location";
          
          const name = data.address?.neighbourhood || 
                       data.address?.suburb || 
                       data.address?.road || 
                       data.address?.city || 
                       "My Location";

          setDeviceLocation({
            name,
            lat: latitude,
            lng: longitude,
            address: addressText,
          });
        } catch (error) {
          setDeviceLocation({
            name: "My Location",
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
          });
        }
      },
      (error) => {
        console.warn("Geolocation warning:", error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    notifications: true,
    language: "English",
  });

  // ── Mobile Bottom Sheet Drag State ──
  const [sheetHeight, setSheetHeight] = useState(420);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragStartY = React.useRef(0);
  const dragStartHeight = React.useRef(0);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth <= 768) {
        // 50% of the usable height above the nav bar
        setSheetHeight(Math.round((window.innerHeight - 72) * 0.50));
      }
    }
  }, [currentView]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window === "undefined" || window.innerWidth > 768) return;
    setIsDraggingSheet(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = sheetHeight;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSheet) return;
    const clientY = e.touches[0].clientY;
    const deltaY = dragStartY.current - clientY;
    const maxH = Math.round((window.innerHeight - 72) * 0.88);
    const minH = 220;
    const newH = Math.max(minH, Math.min(maxH, dragStartHeight.current + deltaY));
    setSheetHeight(newH);
  };

  const handleTouchEnd = () => {
    setIsDraggingSheet(false);
    if (typeof window === "undefined") return;
    const usableH = window.innerHeight - 72; // subtract nav bar
    const snapMin = 260;
    const snapDefault = Math.round(usableH * 0.50);
    const snapMax = Math.round(usableH * 0.88);

    const diffs = [
      { val: snapMin, diff: Math.abs(sheetHeight - snapMin) },
      { val: snapDefault, diff: Math.abs(sheetHeight - snapDefault) },
      { val: snapMax, diff: Math.abs(sheetHeight - snapMax) },
    ];
    diffs.sort((a, b) => a.diff - b.diff);
    setSheetHeight(diffs[0].val);
  };

  const handleDragHandleClick = () => {
    if (typeof window === "undefined") return;
    const usableH = window.innerHeight - 72;
    const snapDefault = Math.round(usableH * 0.50);
    const snapMax = Math.round(usableH * 0.88);
    if (sheetHeight < snapMax - 50) {
      setSheetHeight(snapMax);
    } else {
      setSheetHeight(snapDefault);
    }
  };

  // ── Dark Mode Effect ──
  useEffect(() => {
    const html = document.documentElement;
    if (settings.darkMode) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }
  }, [settings.darkMode]);

  // ── Distance calc ──
  useEffect(() => {
    if (pickup && dropoff) {
      setDistance(getKmDistance(pickup, dropoff));
    } else {
      setDistance(0);
    }
  }, [pickup, dropoff]);

  // ─── HANDLERS ───

  const handleLoginSuccess = (name: string, phone: string, email: string) => {
    setUserProfile(prev => ({ ...prev, fullName: name, phone, email }));
    setIsLoggedIn(true);
    setCurrentView("home");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("home");
    setIsBooked(false);
    setPickup(null);
    setDropoff(null);
  };

  const handleStartBooking = (initialPickup?: LocationData, initialDropoff?: LocationData) => {
    setBookingInitialPickup(initialPickup);
    setBookingInitialDropoff(initialDropoff);
    setCurrentView("booking");
  };

  const handleBookingConfirmed = (p: LocationData, d: LocationData, cat: RideCategory, price: number) => {
    setPickup(p);
    setDropoff(d);
    setSelectedCategory(cat);
    setBookedPrice(price);
    setRideStatus("arriving");
    setIsBooked(true);
    setCurrentView("ride");
    // Add to recent destinations
    setRecentDestinations(prev => [d, ...prev.filter(l => l.name !== d.name)].slice(0, 5));
  };

  const handleCancelRide = () => {
    if (rideStatus !== "completed" && pickup && dropoff) {
      setRideHistory(prev => [{
        id: `r${Date.now()}`,
        date: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
        pickup: pickup.name,
        dropoff: dropoff.name,
        pickupData: pickup,
        dropoffData: dropoff,
        fare: 0,
        distance,
        category: selectedCategory?.name || "",
        driverName: "Marcus Sterling",
        status: "cancelled",
        cancelReason: "User cancelled",
      }, ...prev]);
      setIsBooked(false);
      setPickup(null);
      setDropoff(null);
      setRideStatus("searching");
      setCurrentView("home");
      return;
    }
    if (rideStatus === "completed" && pickup && dropoff) {
      const record: RideRecord = {
        id: `r${Date.now()}`,
        date: new Date().toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }),
        pickup: pickup.name,
        dropoff: dropoff.name,
        pickupData: pickup,
        dropoffData: dropoff,
        fare: bookedPrice,
        distance,
        category: selectedCategory?.name || "",
        driverName: "Marcus Sterling",
        rating: 5,
        status: "completed",
      };
      setRideHistory(prev => [record, ...prev]);
      setPayment(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - bookedPrice,
        transactions: [{
          id: `tx${Date.now()}`,
          date: "Just now",
          description: `Ride — ${pickup.name} → ${dropoff.name}`,
          amount: bookedPrice,
          type: "debit",
        }, ...prev.transactions],
      }));
      // Show rating modal before returning home
      setPendingRating({
        driverName: "Marcus Sterling",
        categoryName: selectedCategory?.name || "",
        fare: bookedPrice,
        pickupName: pickup.name,
        dropoffName: dropoff.name,
      });
      setIsBooked(false);
      setPickup(null);
      setDropoff(null);
      setRideStatus("searching");
      setCurrentView("home");
    }
  };

  const handleRatingSubmitted = (rating: number, tip: number, comment: string) => {
    // In a real app, submit rating to backend.
    // Update the most recent ride history entry with the rating.
    setRideHistory(prev => {
      const updated = [...prev];
      if (updated[0] && updated[0].status === "completed") {
        updated[0] = { ...updated[0], rating };
      }
      return updated;
    });
    if (tip > 0) {
      setPayment(prev => ({
        ...prev,
        walletBalance: prev.walletBalance - tip,
        transactions: [{
          id: `tx-tip-${Date.now()}`,
          date: "Just now",
          description: `Tip for Marcus Sterling`,
          amount: tip,
          type: "debit",
        }, ...prev.transactions],
      }));
    }
    setPendingRating(null);
  };

  const handleRebook = (p: LocationData, d: LocationData) => {
    handleStartBooking(p, d);
  };

  // ─── RENDER ───

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (!isLoggedIn) return <AuthScreen onLoginSuccess={handleLoginSuccess} />;

  const showMap = currentView === "home" || currentView === "booking" || currentView === "ride";

  return (
    <div className="app-container">
      {/* Desktop Icon Sidebar */}
      <div className="desktop-sidebar">
        <TopNav
          currentView={currentView}
          userName={userProfile.fullName}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
        />
      </div>

      {/* Control Panel */}
      <div 
        className="control-panel"
        style={{
          height: typeof window !== "undefined" && window.innerWidth <= 768 ? `${sheetHeight}px` : undefined,
          transition: isDraggingSheet ? "none" : "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Mobile Drag Handle */}
        <div 
          className="drag-handle-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleDragHandleClick}
          style={{ cursor: "ns-resize" }}
        >
          <div className="drag-handle-pill" />
        </div>

        {/* Header (shown on home, profile, history, payment, settings views) */}
        {(currentView === "home" || currentView === "profile" || currentView === "history" || currentView === "payment" || currentView === "settings") && (
          <header style={{ padding: "clamp(12px, 3vw, 18px) clamp(16px, 4vw, 24px)", borderBottom: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Logo */}
              <div style={{ width: 36, height: 36, borderRadius: "11px", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(217,95,0,0.28)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <span style={{ fontSize: "1.05rem", fontWeight: 900, color: "var(--text-main)", letterSpacing: "-0.02em", display: "block", lineHeight: 1 }}>Glide</span>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em" }}>UYO · AKWA IBOM</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Notifications badge */}
              <div style={{ position: "relative" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", position: "absolute", top: -1, right: -1, border: "2px solid var(--background)", zIndex: 1 }} />
                <button
                  style={{ width: 36, height: 36, border: "1px solid var(--card-border)", borderRadius: "11px", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.2s" }}
                  onClick={() => setShowNotifications(true)}
                  title="Notifications"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
              </div>
              {/* Avatar */}
              <button
                onClick={() => setCurrentView("profile")}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-sans)", boxShadow: "0 2px 8px rgba(217,95,0,0.25)" }}
                title="Profile"
              >
                {userProfile.fullName.charAt(0).toUpperCase()}
              </button>
            </div>
          </header>
        )}

        {/* Live Activity Tracker Banner */}
        {isBooked && currentView !== "ride" && (
          <div
            className="animate-slide-up"
            onClick={() => setCurrentView("ride")}
            style={{
              padding: "12px 18px",
              background: "linear-gradient(135deg, rgba(217,95,0,0.08) 0%, rgba(26,107,60,0.08) 100%)",
              borderBottom: "1.5px solid rgba(217,95,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              gap: "12px",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(217,95,0,0.25)",
                  flexShrink: 0,
                }}
              >
                {/* SVG Car Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <circle cx="17" cy="17" r="2" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>
                  {rideStatus === "searching" && "Connecting with driver..."}
                  {rideStatus === "arriving" && "Driver is arriving shortly"}
                  {rideStatus === "arrived" && "Driver has arrived outside!"}
                  {rideStatus === "inprogress" && "On trip to destination"}
                  {rideStatus === "completed" && "Trip completed"}
                </p>
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "1px" }}>
                  {selectedCategory?.name || "Glide Comfort"} • Marcus Sterling (GLIDE-001)
                </p>
              </div>
            </div>
            <button
              style={{
                padding: "6px 12px",
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              Track Live
            </button>
          </div>
        )}

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {currentView === "home" && (
            <HomeScreen
              userName={userProfile.fullName}
              recentDestinations={recentDestinations}
              favoriteHome={userProfile.homeAddress ? { name: "Home", lat: 6.4281, lng: 3.4219, address: userProfile.homeAddress } : undefined}
              favoriteWork={userProfile.workAddress ? { name: "Work", lat: 6.5181, lng: 3.3989, address: userProfile.workAddress } : undefined}
              deviceLocation={deviceLocation}
              onStartBooking={handleStartBooking}
            />
          )}

          {currentView === "booking" && (
            <BookingScreen
              initialPickup={bookingInitialPickup}
              initialDropoff={bookingInitialDropoff}
              deviceLocation={deviceLocation}
              onConfirmed={handleBookingConfirmed}
              onBack={() => setCurrentView("home")}
            />
          )}

          {currentView === "ride" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", flex: 1, padding: "24px" }}>
              <ActiveRide
                categoryName={selectedCategory?.name || ""}
                price={bookedPrice}
                pickupName={pickup?.name || ""}
                dropoffName={dropoff?.name || ""}
                status={rideStatus}
                onStatusChange={setRideStatus}
                onCancel={handleCancelRide}
              />
            </div>
          )}

          {currentView === "payment" && (
            <PaymentScreen payment={payment} onPaymentChange={setPayment} />
          )}

          {currentView === "history" && (
            <RideHistoryScreen history={rideHistory} onRebook={handleRebook} />
          )}

          {currentView === "profile" && (
            <ProfileScreen profile={userProfile} onSave={setUserProfile} />
          )}

          {currentView === "settings" && (
            <SettingsScreen
              settings={settings}
              onSettingsChange={setSettings}
            />
          )}
        </div>

        {/* Bottom Nav (mobile) */}
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </div>

      {/* Map Container */}
      {isLoggedIn && showMap && (
        <div className="map-container">
          <GlideMap pickup={pickup} dropoff={dropoff} status={rideStatus} deviceLocation={deviceLocation} />
        </div>
      )}

      {/* Post-Ride Rating Modal */}
      {pendingRating && (
        <RatingModal
          driverName={pendingRating.driverName}
          categoryName={pendingRating.categoryName}
          fare={pendingRating.fare}
          pickupName={pendingRating.pickupName}
          dropoffName={pendingRating.dropoffName}
          onSubmit={handleRatingSubmitted}
          onSkip={() => setPendingRating(null)}
        />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
