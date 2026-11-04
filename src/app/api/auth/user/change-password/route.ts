/**
 * POST /api/auth/user/change-password
 *
 * Proxies → POST /api/site-auth/change-password on the Express backend.
 * Uses the HTTP-only tbs_user_token cookie exclusively as the identity source.
 * Never accepts a client-supplied employee/user ID.
 *
 * Exclusively forwards to the Express backend without local database fallback.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const COOKIE_NAME = "tbs_user_token";

export async function POST(request: NextRequest) {
  // 1. Authenticate exclusively via HTTP-only cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return Response.json(
      { success: false, message: "Authentication required. Please log in." },
      { status: 401 }
    );
  }

  // 2. Parse and validate request body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return Response.json(
      { success: false, message: "currentPassword and newPassword are required." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return Response.json(
      { success: false, message: "newPassword must be at least 8 characters in length." },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return Response.json(
      { success: false, message: "newPassword must be different from currentPassword." },
      { status: 400 }
    );
  }

  // 3. Forward to external backend: POST /api/site-auth/change-password
  // Only forward currentPassword and newPassword — never allow client-specified user identity
  const result = await backendFetch("/api/site-auth/change-password", {
    method: "POST",
    authorization: `Bearer ${token}`,
    body: { currentPassword, newPassword },
  });

  // 4. Forward backend response preserving status code and safe message
  const data = result.data as Record<string, unknown>;
  const message =
    typeof data?.message === "string"
      ? data.message
      : result.ok
      ? "Password changed successfully."
      : result.status === 502
      ? "Authentication service is temporarily unavailable. Please try again later."
      : "Failed to change password.";

  return Response.json(
    { success: result.ok, message },
    { status: result.status }
  );
}
