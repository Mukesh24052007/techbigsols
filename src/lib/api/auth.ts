/**
 * Client-side auth API helpers.
 *
 * Uses the shared apiClient from @/lib/axios whose baseURL points to
 * NEXT_PUBLIC_API_BASE_URL. The JWT interceptor is already attached there,
 * so every request automatically carries the stored admin token when present.
 */

import { apiClient } from "@/lib/axios";

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
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

/** POST /api/auth/logout (best-effort) */
export async function logoutRequest(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

/** GET /api/auth/me — re-validates a stored JWT on page load */
export async function getMeRequest(): Promise<AdminProfile> {
  const { data } = await apiClient.get<AdminProfile>("/api/auth/me");
  return data;
}
