"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { ModulePermissions } from "@/types";

export interface PortalUserSession {
  userId: string;
  email: string;
  name: string;
  permissions: ModulePermissions;
}

interface UserAuthContextType {
  isAuthenticated: boolean;
  user: PortalUserSession | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: try to restore session from the HTTP-only cookie via /api/auth/user/me
  useEffect(() => {
    fetch("/api/auth/user/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return data.message ?? "Login failed.";
      setUser(data.user);
      return null;
    } catch {
      return "Network error. Please try again.";
    }
  };

  const logout = async (): Promise<void> => {
    await fetch("/api/auth/user/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.push("/user/login");
  };

  return (
    <UserAuthContext.Provider
      value={{ isAuthenticated: !!user, user, isLoading, login, logout }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
