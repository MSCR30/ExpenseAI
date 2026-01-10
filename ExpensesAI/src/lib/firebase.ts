import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
};

const hasAllEnv = Object.values(cfg).every(Boolean);

let app: ReturnType<typeof initializeApp> | null = null;
try {
  if (hasAllEnv) {
    app = initializeApp(cfg as Required<typeof cfg>);
  } else {
    console.warn("Firebase env vars are missing. Auth is disabled until .env is configured.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase app:", e);
}

export const firebaseReady = !!app;
export const auth = app ? getAuth(app) : (undefined as any);
export const googleProvider = new GoogleAuthProvider();
