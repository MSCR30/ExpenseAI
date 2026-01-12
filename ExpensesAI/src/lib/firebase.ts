import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if all required Firebase config values are present
const hasAllEnv = Object.values(firebaseConfig).every(
  (value) => value && typeof value === "string" && value.length > 0
);

let app: ReturnType<typeof initializeApp> | null = null;
let firebaseReady = false;

if (hasAllEnv) {
  try {
    app = initializeApp(firebaseConfig);
    firebaseReady = true;
    console.log("✅ Firebase initialized successfully");
  } catch (e) {
    console.error("❌ Failed to initialize Firebase app:", e);
    firebaseReady = false;
  }
} else {
  console.warn(
    "⚠️ Firebase environment variables are missing or incomplete. Authentication is disabled.\n" +
    "Please check your .env.local file has all required Firebase config values."
  );
}

// Export Firebase instances
export const auth = app ? getAuth(app) : (undefined as any);
export const db = app ? getFirestore(app) : (undefined as any);
export const googleProvider = app ? new GoogleAuthProvider() : (undefined as any);
export { firebaseReady };
