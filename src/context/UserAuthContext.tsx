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
  /** Returns error message on failure, or null on success. On success also sets user state. */
  login: (email: string, password: string) => Promise<{ error: string | null; user: PortalUserSession | null }>;
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
          if (data.user?.userId) setUser(data.user as PortalUserSession);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error: string | null; user: PortalUserSession | null }> => {
    try {
      const res = await fetch("/api/auth/user/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.message ?? "Login failed.", user: null };
      }
      const sessionUser = data.user as PortalUserSession;
      setUser(sessionUser);
      return { error: null, user: sessionUser };
    } catch {
      return { error: "Network error. Please try again.", user: null };
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
