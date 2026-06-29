import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgLQOAMmAkrWf-1X6umxJGUIYXRn8gZB8",
  authDomain: "uyo-taxi-ride.firebaseapp.com",
  projectId: "uyo-taxi-ride",
  databaseURL: "https://uyo-taxi-ride-default-rtdb.firebaseio.com",
  storageBucket: "uyo-taxi-ride.firebasestorage.app",
  messagingSenderId: "7829874674",
  appId: "1:7829874674:web:7ff3ccb335d5c3a8bb2d6b",
  measurementId: "G-29NYXQ3QE3"
};

// Initialize Firebase (safely checking if it is already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

// Initialize Analytics conditionally (only in client browser environment)
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };

