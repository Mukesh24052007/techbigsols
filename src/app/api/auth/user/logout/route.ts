/**
 * POST /api/auth/user/logout
 *
 * Proxies → POST /api/site-auth/logout on the backend (best-effort),
 * then clears the local HTTP-only cookie regardless of the backend result.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const COOKIE_NAME = "tbs_user_token";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Tell the backend to invalidate the session (best-effort — we don't fail if it's down)
  if (token) {
    await backendFetch("/api/site-auth/logout", {
      method: "POST",
      authorization: `Bearer ${token}`,
      cookie: request.headers.get("cookie"),
    }).catch(() => {});
  }

  // Always clear the cookie on our side
  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return response;
}
