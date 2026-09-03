"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { TOKEN_KEY } from "@/lib/axios";
import {
  loginRequest,
  logoutRequest,
  getMeRequest,
  AdminProfile,
} from "@/lib/api/auth";

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: AdminProfile | null;
  /** Returns an error message string on failure, null on success */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// ── Dev-mode credentials ────────────────────────────────────────────────────
// If NEXT_PUBLIC_DEV_ADMIN_EMAIL / _PASSWORD are set, logging in with those
// exact credentials bypasses the external backend and uses NEXT_PUBLIC_DEV_TOKEN
// (which must match the server-side ADMIN_DEV_TOKEN env var).
const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? "";
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD ?? "";
const DEV_TOKEN = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN ?? "";

function isDevMode() {
  return (
    process.env.NODE_ENV === "development" &&
    DEV_EMAIL !== "" &&
    DEV_PASSWORD !== "" &&
    DEV_TOKEN !== ""
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const router = useRouter();

  // On mount: if a token exists, verify it
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    // If we're in dev mode and the token matches the dev token, accept it
    // without hitting the backend.
    if (isDevMode() && token === DEV_TOKEN) {
      setAdmin({
        id: "dev-admin",
        email: DEV_EMAIL,
        name: "Dev Admin",
        role: "admin",
      });
      setIsAuthenticated(true);
      return;
    }

    getMeRequest()
      .then((profile) => {
        setAdmin(profile);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      });
  }, []);

  /**
   * Login flow.
   * In dev mode with matching credentials: bypass backend.
   * Otherwise: POST to external backend.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    // ── Dev bypass ────────────────────────────────────────────────────────────
    if (isDevMode() && email === DEV_EMAIL && password === DEV_PASSWORD) {
      localStorage.setItem(TOKEN_KEY, DEV_TOKEN);
      setAdmin({
        id: "dev-admin",
        email: DEV_EMAIL,
        name: "Dev Admin",
        role: "admin",
      });
      setIsAuthenticated(true);
      return null;
    }

    // ── Real backend ──────────────────────────────────────────────────────────
    try {
      const { token, admin: profile } = await loginRequest(email, password);
      localStorage.setItem(TOKEN_KEY, token);
      setAdmin(profile);
      setIsAuthenticated(true);
      return null;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const data = (err.response as { data?: { message?: string } }).data;
        if (data?.message) return data.message;
      }
      return "Invalid credentials. Please try again.";
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest();
    } catch {
      // Best-effort
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
      setIsAuthenticated(false);
      router.push("/admin/login");
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, admin, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
