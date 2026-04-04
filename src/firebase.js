import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Ensure environment variables are loaded (Vite uses import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check for required configuration
const requiredKeys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];
const missingKeys = requiredKeys.filter(key => !import.meta.env[key]);

if (missingKeys.length > 0) {
  console.warn(`⚠️ Missing Firebase environment variables: ${missingKeys.join(', ')}. Check your .env file or Vercel dashboard.`);
}

// Initialize Firebase safely
let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let analytics = null;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Analytics is optional and only runs if supported
    isSupported().then(yes => {
      if (yes && firebaseConfig.measurementId && app) {
        analytics = getAnalytics(app);
      }
    }).catch(err => console.debug("Analytics not supported"));
  } else {
    console.warn("Firebase was not initialized: VITE_FIREBASE_API_KEY is missing.");
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, auth, db, googleProvider, analytics };


