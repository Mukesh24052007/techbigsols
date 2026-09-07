/**
 * GET /api/auth/user/me
 *
 * Proxies → GET /api/site-auth/me on the backend.
 *
 * Forwards the site-user's JWT cookie so the backend can identify them.
 * The backend is expected to return the current user's profile.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const COOKIE_NAME = "tbs_user_token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return Response.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  // Forward as Bearer token in Authorization header — most backends accept this.
  // Also forward the raw Cookie header in case the backend reads it directly.
  const result = await backendFetch("/api/site-auth/me", {
    method: "GET",
    authorization: `Bearer ${token}`,
    cookie: request.headers.get("cookie"),
  });

  if (!result.ok) {
    return Response.json(result.data, { status: result.status });
  }

  const payload = result.data as Record<string, unknown>;

  // Normalise to the shape UserAuthContext expects: { user: { userId, email, name, permissions } }
  const user =
    (payload.user as Record<string, unknown>) ??
    (payload.data as Record<string, unknown>) ??
    payload;

  return Response.json({ success: true, user }, { status: 200 });
}
