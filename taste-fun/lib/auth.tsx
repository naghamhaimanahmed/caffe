"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "owner";

export interface RoleInfo {
  label: string;
  english: string;
  route: string;
  user: string;
  scope: string;
  description: string;
}

export const ROLES: Record<Role, RoleInfo> = {
  owner: {
    label: "المالك",
    english: "Owner",
    route: "/owner",
    user: "خالد المنصوري",
    scope: "جميع الفروع",
    description: "لوحة المؤشرات والمبيعات وحالة إغلاق الفروع والموافقات",
  },
};

const STORAGE_KEY = "tf-active-role";

interface AuthContextValue {
  role: Role | null;
  ready: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isRole(value: unknown): value is Role {
  return typeof value === "string" && value in ROLES;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);

  // Restore the mocked session so a page refresh keeps the user signed in.
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (isRole(stored)) setRole(stored);
    } catch {
      // storage unavailable: start signed out
    }
    setReady(true);
  }, []);

  const login = useCallback((next: Role) => {
    setRole(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({ role, ready, login, logout }), [role, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
