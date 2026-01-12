import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, firebaseReady, googleProvider } from "@/lib/firebase";

interface LocalUser {
  uid: string;
  email: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const firebaseUserToLocalUser = (fbUser: FirebaseUser): LocalUser => ({
  uid: fbUser.uid,
  email: fbUser.email || "",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up Firebase auth state listener
  useEffect(() => {
    if (!firebaseReady) {
      console.error("Firebase is not initialized. Please check your .env.local configuration.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser(firebaseUserToLocalUser(fbUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    if (!firebaseReady) {
      throw new Error("Firebase is not initialized. Please check your .env.local configuration.");
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(firebaseUserToLocalUser(userCredential.user));
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account");
    }
  };

  const login = async (email: string, password: string) => {
    if (!firebaseReady) {
      throw new Error("Firebase is not initialized. Please check your .env.local configuration.");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(firebaseUserToLocalUser(userCredential.user));
    } catch (error: any) {
      throw new Error(error.message || "Invalid email or password");
    }
  };

  const loginWithGoogle = async () => {
    if (!firebaseReady) {
      throw new Error("Firebase is not initialized. Please check your .env.local configuration.");
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(firebaseUserToLocalUser(result.user));
    } catch (error: any) {
      throw new Error(error.message || "Google sign-in failed");
    }
  };

  const logout = async () => {
    if (!firebaseReady) {
      throw new Error("Firebase is not initialized");
    }
    try {
      await signOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign out");
    }
  };

  const updateEmail = async (newEmail: string) => {
    if (!firebaseReady) throw new Error("Firebase is not initialized");
    const current = auth.currentUser;
    if (!current) throw new Error("No authenticated user");
    try {
      await fbUpdateEmail(current, newEmail);
      setUser((u) => (u ? { ...u, email: newEmail } : u));
    } catch (error: any) {
      throw new Error(error.message || "Failed to update email");
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!firebaseReady) throw new Error("Firebase is not initialized");
    const current = auth.currentUser;
    if (!current) throw new Error("No authenticated user");
    try {
      await fbUpdatePassword(current, newPassword);
    } catch (error: any) {
      throw new Error(error.message || "Failed to update password");
    }
  };

  const resetPassword = async (email: string) => {
    if (!firebaseReady) throw new Error("Firebase is not initialized");
    try {
      // Provide a continue URL so the email contains a useful redirect back to the app after reset
      const actionCodeSettings = {
        url: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      } as const;

      await fbSendPasswordResetEmail(auth, email, actionCodeSettings as any);
      // Log success for local debugging
      console.info("Password reset email requested for:", email);
    } catch (error: any) {
      console.error("Password reset failed", error?.code, error?.message);
      // Surface a helpful message including Firebase error code when available
      const code = error?.code ? `${error.code} - ` : "";
      throw new Error(code + (error?.message || "Failed to send password reset email"));
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateEmail,
    updatePassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
