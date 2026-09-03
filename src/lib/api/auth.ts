/**
 * Client-side auth API helpers.
 *
 * These always talk to the external backend (NEXT_PUBLIC_API_BASE_URL),
 * not to Next.js route handlers, so they use a dedicated Axios instance
 * rather than the shared apiClient (whose baseURL is "" for same-origin
 * product calls).
 */

import axios from "axios";
import { TOKEN_KEY } from "@/lib/axios";

const BACKEND_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000";

const authClient = axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

// Attach token if present
authClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminProfile;
}

/** POST /api/auth/login → JWT token + admin profile */
export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await authClient.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

/** POST /api/auth/logout (best-effort) */
export async function logoutRequest(): Promise<void> {
  await authClient.post("/api/auth/logout");
}

/** GET /api/auth/me — re-validates a stored JWT on page load */
export async function getMeRequest(): Promise<AdminProfile> {
  const { data } = await authClient.get<AdminProfile>("/api/auth/me");
  return data;
}
