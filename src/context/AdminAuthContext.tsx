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
  isLoading: boolean;
  /** Returns an error message string on failure, null on success */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// ── Dev-mode credentials ────────────────────────────────────────────────────
const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? "";
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD ?? "";
const DEV_TOKEN = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN ?? "";

function isDevCredentials(email: string, password: string) {
  return (
    DEV_EMAIL !== "" &&
    DEV_PASSWORD !== "" &&
    email.toLowerCase() === DEV_EMAIL.toLowerCase() &&
    password === DEV_PASSWORD
  );
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: if a token exists, verify it
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setIsLoading(false);
      return;
    }

    // If the token matches the dev token, accept it immediately
    if (DEV_TOKEN !== "" && token === DEV_TOKEN) {
      setAdmin({
        id: "dev-admin",
        email: DEV_EMAIL || "admin@techbigsolutions.in",
        name: "Dev Admin",
        role: "admin",
      });
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    getMeRequest()
      .then((profile) => {
        setAdmin(profile);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setIsAuthenticated(false);
        setAdmin(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  /**
   * Login flow.
   * If matching configured dev credentials: set local session.
   * Otherwise: POST to login endpoint.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<string | null> => {
    // ── Dev bypass ────────────────────────────────────────────────────────────
    if (isDevCredentials(email, password)) {
      const activeToken = DEV_TOKEN || "dev-secret-change-me";
      localStorage.setItem(TOKEN_KEY, activeToken);
      setAdmin({
        id: "dev-admin",
        email: DEV_EMAIL,
        name: "Dev Admin",
        role: "admin",
      });
      setIsAuthenticated(true);
      return null;
    }

    // ── Backend / API Route ───────────────────────────────────────────────────
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
      value={{ isAuthenticated, admin, isLoading, login, logout }}
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
