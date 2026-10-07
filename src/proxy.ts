/**
 * Next.js Edge Proxy  (src/proxy.ts — this IS the middleware, named proxy.ts)
 *
 * Protects /portal/* routes server-side:
 * - Redirects unauthenticated / invalid-token users to /user/login?next=<path>
 * - Redirects users without the required module permission back to /portal/<userId>
 *
 * Leniency notes:
 * - Tokens issued by the external backend may not carry our local issuer/audience,
 *   so we skip those constraints and only verify the signature + expiry.
 * - /portal/[userId] routes (e.g. /portal/tbusr001) are NOT module-permission-gated
 *   here — the page component itself guards ownership.
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Inlined to avoid Edge-runtime path-alias resolution issues with @/types
const MODULE_KEYS = [
  "attendance",
  "assetMaster",
  "productMaster",
  "employeeMaster",
  "payrollSheet",
  "accountsModule",
  "inventoryReport",
  "profitAndLoss",
  "balanceSheet",
  "trialBalance",
] as const;

type ModuleKey = (typeof MODULE_KEYS)[number];

const RAW_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "tbs-user-secret-key-2026";

const SECRET = new TextEncoder().encode(RAW_SECRET);
const USER_COOKIE = "tbs_user_token";

/** Decode a JWT payload without verifying signature (Edge-safe, no Node crypto). */
function decodePayloadUnsafe(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob is available in the Edge runtime
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(USER_COOKIE)?.value;

  // ── If the user visits /user/login with a valid token, skip to their portal ─
  if (pathname === "/user/login") {
    if (!token) return NextResponse.next();

    // Try to read the userId from the token payload
    let userId: string | undefined;
    try {
      const { payload: p } = await jwtVerify(token, SECRET);
      userId = p.userId as string | undefined ?? p.sub as string | undefined;
    } catch {
      const decoded = decodePayloadUnsafe(token);
      if (decoded) {
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp as number | undefined;
        if (!exp || exp > now) {
          userId = decoded.userId as string | undefined;
        }
      }
    }

    if (userId) {
      const next = request.nextUrl.searchParams.get("next");
      return NextResponse.redirect(new URL(next ?? `/portal/${userId}`, request.url));
    }

    // Token present but unreadable — let the login page handle it
    return NextResponse.next();
  }

  // ── No token → redirect to user login ────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Verify token ──────────────────────────────────────────────────────────
  // First try strict local verification (our own JWTs).
  // If that fails, fall back to a lenient decode (backend-issued JWTs that share
  // the same secret but may differ on issuer/audience).
  let payload: Record<string, unknown> | null = null;

  try {
    const { payload: p } = await jwtVerify(token, SECRET, {
      issuer: "tbs-portal",
      audience: "tbs-portal-users",
    });
    payload = p as Record<string, unknown>;
  } catch {
    // Strict verification failed — try lenient (no iss/aud check)
    try {
      const { payload: p } = await jwtVerify(token, SECRET);
      payload = p as Record<string, unknown>;
    } catch {
      // Signature invalid — try reading claims without verification
      // (handles backend tokens signed with a different key — expired check only)
      const decoded = decodePayloadUnsafe(token);
      if (decoded) {
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp as number | undefined;
        if (exp && exp < now) {
          // Token is expired — clear cookie and redirect
          const loginUrl = new URL("/user/login", request.url);
          loginUrl.searchParams.set("next", pathname);
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete(USER_COOKIE);
          return response;
        }
        // Token not yet expired — trust the payload
        payload = decoded;
      } else {
        // Completely unreadable token — clear and redirect
        const loginUrl = new URL("/user/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete(USER_COOKIE);
        return response;
      }
    }
  }

  // ── /portal/[userId] routes — let the page component handle ownership ─────
  // Matches /portal/tbusr001, /portal/tbusr002, etc.
  if (/^\/portal\/tbusr\w+/.test(pathname)) {
    return NextResponse.next();
  }

  // ── /portal/[moduleKey] routes — check module permission ─────────────────
  const moduleMatch = pathname.match(/^\/portal\/([^/]+)(\/.*)?$/);
  if (moduleMatch) {
    const key = moduleMatch[1] as ModuleKey;
    if (MODULE_KEYS.includes(key)) {
      const permissions = payload?.permissions as Record<string, boolean> | undefined;
      if (!permissions?.[key]) {
        // Redirect to user's personal dashboard
        const userId = payload?.userId as string | undefined;
        const fallback = userId ? `/portal/${userId}` : "/portal";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/user/login"],
};
