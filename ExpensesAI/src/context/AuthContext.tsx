import { createContext, useContext, useEffect, useState } from "react";

type LocalUser = { uid: string; email: string };

interface AuthContextValue {
  user: LocalUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; // no-op placeholder
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "auth_users";
const SESSION_KEY = "auth_session";

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const persistSession = (u: LocalUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const readUsers = (): Record<string, { email: string; passwordHash: string }> => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const writeUsers = (users: Record<string, { email: string; passwordHash: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const signup = async (email: string, password: string) => {
    const users = readUsers();
    const key = email.toLowerCase();
    if (users[key]) throw new Error("Account already exists");
    const passwordHash = await sha256(password);
    users[key] = { email, passwordHash };
    writeUsers(users);
    const u: LocalUser = { uid: crypto.randomUUID(), email };
    setUser(u);
    persistSession(u);
  };

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const key = email.toLowerCase();
    const rec = users[key];
    if (!rec) throw new Error("Invalid credentials");
    const passwordHash = await sha256(password);
    if (rec.passwordHash !== passwordHash) throw new Error("Invalid credentials");
    const u: LocalUser = { uid: crypto.randomUUID(), email };
    setUser(u);
    persistSession(u);
  };

  const loginWithGoogle = async () => {
    throw new Error("Google sign-in is not available without a backend provider");
  };

  const logout = async () => {
    setUser(null);
    persistSession(null);
  };

  const value: AuthContextValue = { user, loading, login, signup, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
