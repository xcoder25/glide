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
import DriverScreen from "./components/driver-screen";
import ScheduleRideModal, { type ScheduledRide } from "./components/schedule-ride-modal";
import CarpoolMatchModal from "./components/carpool-match-modal";
import ReferralScreen from "./components/referral-screen";
import OnboardingTour from "./components/onboarding-tour";
import AdminDashboard from "./components/admin-dashboard";

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

// Generate a randomised surge multiplier for this session (1.0–1.8 in affected zones)
function generateSurge(): number {
  const r = Math.random();
  if (r < 0.4) return 1.0;           // 40% — no surge
  if (r < 0.65) return 1.2;          // 25% — mild
  if (r < 0.85) return 1.4;          // 20% — moderate
  return parseFloat((1.5 + Math.random() * 0.3).toFixed(1)); // 15% — high
}

const SEED_HISTORY: RideRecord[] = [
  { id: "r1", date: "Yesterday, 4:18 PM", pickup: "Ibom Plaza", dropoff: "Akwa Ibom Airport", pickupData: { name: "Ibom Plaza", lat: 5.0253, lng: 7.9306, address: "Udo Udoma Ave, Uyo" }, dropoffData: { name: "Akwa Ibom Airport", lat: 4.8725, lng: 8.0925, address: "Airport Rd, Uyo" }, fare: 3800, distance: 8, category: "Glide Ride", driverName: "Marcus Sterling", rating: 5, status: "completed" },
  { id: "r2", date: "June 26, 9:04 AM", pickup: "Ibom Icon Hotel", dropoff: "University of Uyo (UNIUYO)", pickupData: { name: "Ibom Icon Hotel", lat: 5.0378, lng: 7.9142, address: "Nwaniba Rd, Uyo" }, dropoffData: { name: "University of Uyo (UNIUYO)", lat: 5.0153, lng: 7.9336, address: "UNIUYO Campus, Uyo" }, fare: 2500, distance: 12, category: "Glide Premium", driverName: "Chidi Obi", rating: 4, status: "completed" },
  { id: "r3", date: "June 24, 7:30 PM", pickup: "Uyo Central Market", dropoff: "Godswill Akpabio Stadium", pickupData: { name: "Uyo Central Market", lat: 5.0280, lng: 7.9220, address: "Abak Rd, Uyo" }, dropoffData: { name: "Godswill Akpabio Stadium", lat: 5.0480, lng: 7.9520, address: "Stadium Rd, Uyo" }, fare: 0, distance: 4, category: "Glide Lite", driverName: "Emeka Nwosu", status: "cancelled", cancelReason: "Driver took too long" },
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

  // ── New Phase 2 State ──
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [scheduledRide, setScheduledRide] = useState<ScheduledRide | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePending, setSchedulePending] = useState<{ pickup: LocationData; dropoff: LocationData; category: RideCategory; price: number } | null>(null);
  const [showCarpoolModal, setShowCarpoolModal] = useState(false);
  const [carpoolPending, setCarpoolPending] = useState<{ pickup: LocationData; dropoff: LocationData; category: RideCategory; price: number } | null>(null);
  const [surgeMultiplier] = useState<number>(generateSurge);
  const [referralBalance] = useState(2000);

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
    sound: true,
    saveData: false,
  });

  // ── Mobile Bottom Sheet Drag State ──
  const [sheetHeight, setSheetHeight] = useState(420);
  const [isDraggingSheet, setIsDraggingSheet] = useState(false);
  const dragStartY = React.useRef(0);
  const dragStartHeight = React.useRef(0);

  // ── Dark Mode Effect ──
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.darkMode ? "dark" : "light");
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
    // Show onboarding on first login
    const alreadyOnboarded = typeof window !== "undefined" && localStorage.getItem("glide_onboarded");
    if (!alreadyOnboarded) {
      setTimeout(() => setShowOnboarding(true), 600);
    }
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

  // ── Driver Mode ──
  if (isDriverMode) {
    return <DriverScreen onExitDriverMode={() => setIsDriverMode(false)} />;
  }

  // ── Admin Dashboard ──
  if (showAdmin) {
    return <AdminDashboard onClose={() => setShowAdmin(false)} />;
  }

  const showMap = currentView === "home" || currentView === "booking" || currentView === "ride";

  return (
    <div className="app-root">

      {/* ── Map Layer (always behind) ── */}
      <div className="map-layer">
        <GlideMap
          pickup={pickup}
          dropoff={dropoff}
          status={rideStatus}
          deviceLocation={deviceLocation}
          surgeMultiplier={surgeMultiplier}
          showSurgeOverlay={currentView === "booking"}
        />
      </div>

      {/* ── Screen Layer ── */}
      <div className="screen-layer">

        {/* HOME */}
        {currentView === "home" && (
          <HomeScreen
            key="home"
            userName={userProfile.fullName}
            recentDestinations={recentDestinations}
            favoriteHome={userProfile.homeAddress ? { name: "Home", lat: 5.0253, lng: 7.9306, address: userProfile.homeAddress } : undefined}
            favoriteWork={userProfile.workAddress ? { name: "Work", lat: 5.0480, lng: 7.9520, address: userProfile.workAddress } : undefined}
            deviceLocation={deviceLocation}
            onStartBooking={handleStartBooking}
            onShowNotifications={() => setShowNotifications(true)}
            onShowProfile={() => setCurrentView("profile")}
            userInitial={userProfile.fullName.charAt(0).toUpperCase()}
            avatarColor={userProfile.avatarColor}
            isBooked={isBooked}
            rideStatus={rideStatus}
            selectedCategoryName={selectedCategory?.name}
            onTrackRide={() => setCurrentView("ride")}
          />
        )}

        {/* BOOKING */}
        {currentView === "booking" && (
          <BookingScreen
            key="booking"
            initialPickup={bookingInitialPickup}
            initialDropoff={bookingInitialDropoff}
            deviceLocation={deviceLocation}
            surgeMultiplier={surgeMultiplier}
            onConfirmed={handleBookingConfirmed}
            onScheduleRide={(p, d, cat, price) => {
              setSchedulePending({ pickup: p, dropoff: d, category: cat, price });
              setShowScheduleModal(true);
            }}
            onCarpoolRequest={(p, d, cat, price) => {
              setCarpoolPending({ pickup: p, dropoff: d, category: cat, price });
              setShowCarpoolModal(true);
            }}
            onBack={() => setCurrentView("home")}
          />
        )}

        {/* ACTIVE RIDE */}
        {currentView === "ride" && (
          <ActiveRide
            key="ride"
            categoryName={selectedCategory?.name || ""}
            price={bookedPrice}
            pickupName={pickup?.name || ""}
            dropoffName={dropoff?.name || ""}
            status={rideStatus}
            onStatusChange={setRideStatus}
            onCancel={handleCancelRide}
          />
        )}

        {/* PAYMENT */}
        {currentView === "payment" && (
          <PaymentScreen
            key="payment"
            payment={payment}
            onPaymentChange={setPayment}
          />
        )}

        {/* HISTORY */}
        {currentView === "history" && (
          <RideHistoryScreen
            key="history"
            history={rideHistory}
            onRebook={handleRebook}
          />
        )}

        {/* PROFILE */}
        {currentView === "profile" && (
          <ProfileScreen
            key="profile"
            profile={userProfile}
            onSave={setUserProfile}
          />
        )}

        {/* SETTINGS */}
        {currentView === "settings" && (
          <SettingsScreen
            key="settings"
            settings={settings}
            onSettingsChange={setSettings}
            onEnterDriverMode={() => setIsDriverMode(true)}
            onOpenAdmin={() => setShowAdmin(true)}
          />
        )}

        {/* REFERRAL */}
        {currentView === "referral" && (
          <ReferralScreen
            key="referral"
            referralBalance={referralBalance}
          />
        )}
      </div>

      {/* ── Floating Bottom Nav ── */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />

      {/* ── Post-Ride Rating Modal ── */}
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

      {/* ── Notifications Panel ── */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* ── Schedule Ride Modal ── */}
      {showScheduleModal && schedulePending && (
        <ScheduleRideModal
          pickup={schedulePending.pickup}
          dropoff={schedulePending.dropoff}
          category={schedulePending.category}
          price={schedulePending.price}
          onConfirm={(ride) => {
            setScheduledRide(ride);
            setShowScheduleModal(false);
            setCurrentView("home");
          }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {/* ── Carpool Modal ── */}
      {showCarpoolModal && carpoolPending && (
        <CarpoolMatchModal
          pickup={carpoolPending.pickup}
          dropoff={carpoolPending.dropoff}
          category={carpoolPending.category}
          soloPrice={carpoolPending.price}
          onAcceptPool={(splitPrice) => {
            handleBookingConfirmed(carpoolPending.pickup, carpoolPending.dropoff, carpoolPending.category, splitPrice);
            setShowCarpoolModal(false);
          }}
          onUpgradeSolo={() => {
            handleBookingConfirmed(carpoolPending.pickup, carpoolPending.dropoff, carpoolPending.category, carpoolPending.price);
            setShowCarpoolModal(false);
          }}
          onClose={() => setShowCarpoolModal(false)}
        />
      )}

      {/* ── Onboarding Tour ── */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => {
            setShowOnboarding(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("glide_onboarded", "1");
            }
          }}
        />
      )}
    </div>
  );
}

