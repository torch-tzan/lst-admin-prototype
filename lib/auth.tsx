"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AdminUser, Role } from "./types";

const STORAGE_KEY = "lst-admin-session-v1";

// テストアカウント 3 種（デモ用）
export const TEST_ACCOUNTS: AdminUser[] = [
  {
    id: "u-lst",
    name: "運営管理者",
    email: "admin@lst.example",
    role: "lst-admin",
  },
  {
    id: "u-venue-1",
    name: "パデルコート広島 企業管理者",
    email: "manager@hiroshima-padel.example",
    role: "venue-admin",
    venueId: "v1",
  },
  {
    id: "u-venue-2",
    name: "北広島パデルクラブ 企業管理者",
    email: "manager@kitahiroshima.example",
    role: "venue-admin",
    venueId: "v2",
  },
];

interface AuthContextValue {
  user: AdminUser | null;
  login: (account: AdminUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, []);

  const login = (account: AdminUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    setUser(account);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function useRequireRole(...roles: Role[]) {
  const { user } = useAuth();
  return user && roles.includes(user.role);
}
