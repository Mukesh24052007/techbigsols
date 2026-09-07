/**
 * POST /api/auth/user/login
 *
 * Proxies → POST /api/site-auth/login on the backend.
 *
 * On success the backend is expected to return a JSON body with at minimum
 * a { token, user } shape. We extract the token and set it as an HTTP-only
 * cookie so the browser never sees it directly, then return the user profile
 * to the client.
 *
 * If the backend sets its own Set-Cookie header we forward that too.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const COOKIE_NAME = "tbs_user_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch("/api/site-auth/login", {
    method: "POST",
    body,
  });

  // Forward non-200 responses straight back
  if (!result.ok) {
    return Response.json(result.data, { status: result.status });
  }

  const payload = result.data as Record<string, unknown>;

  // Build the success response
  const response = Response.json(
    {
      success: true,
      user: payload.user ?? payload.data ?? null,
    },
    { status: 200 }
  );

  // If the backend already set a cookie, forward it
  const backendCookie = result.headers.get("set-cookie");
  if (backendCookie) {
    response.headers.set("Set-Cookie", backendCookie);
  } else if (payload.token && typeof payload.token === "string") {
    // Backend returned a token in the body — wrap it in our own HTTP-only cookie
    const isProduction = process.env.NODE_ENV === "production";
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${payload.token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${isProduction ? "; Secure" : ""}`
    );
  }

  return response;
}
