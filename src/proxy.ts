/**
 * Next.js Edge Proxy
 *
 * Protects /portal/* routes server-side:
 * - Redirects unauthenticated users to /user/login
 * - Redirects users without the required module permission back to /portal
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(USER_COOKIE)?.value;

  // No token → redirect to user login
  if (!token) {
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  let payload: Record<string, unknown>;
  try {
    const { payload: p } = await jwtVerify(token, SECRET, {
      issuer: "tbs-portal",
      audience: "tbs-portal-users",
    });
    payload = p as Record<string, unknown>;
  } catch {
    // Invalid / expired token — clear cookie and redirect
    const loginUrl = new URL("/user/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  // For /portal/[module] routes, check the specific permission
  const moduleMatch = pathname.match(/^\/portal\/([^/]+)(\/.*)?$/);
  if (moduleMatch) {
    const key = moduleMatch[1] as ModuleKey;
    if (MODULE_KEYS.includes(key)) {
      const permissions = payload.permissions as Record<string, boolean> | undefined;
      if (!permissions?.[key]) {
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"],
};
