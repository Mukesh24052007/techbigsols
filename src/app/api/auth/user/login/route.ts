/**
 * POST /api/auth/user/login
 *
 * Proxies → POST /api/site-auth/login on the external backend.
 * Returns { success, user } and sets the tbs_user_token HTTP-only cookie.
 *
 * If the backend is unreachable (502) or unavailable, falls back to verifying
 * credentials against the local Prisma SQLite DB and issues a local JWT —
 * matching the same pattern used by GET /api/auth/user/me.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MODULE_KEYS, type ModulePermissions } from "@/types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "tbs_user_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const RAW_USER_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "tbs-user-secret-key-2026";
const USER_SECRET = new TextEncoder().encode(RAW_USER_SECRET);

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch("/api/site-auth/login", {
    method: "POST",
    body,
  });

  // ── Local fallback when the external backend is unavailable ─────────────
  if (!result.ok && result.status === 502) {
    return handleLocalLogin(body);
  }

  if (!result.ok) {
    // Backend returned a real auth error (401, 403, etc.) — respect it.
    const data = result.data as Record<string, unknown>;
    const message =
      typeof data?.message === "string" ? data.message : "Invalid email or password.";
    return Response.json({ success: false, message }, { status: result.status });
  }

  const payload = result.data as Record<string, unknown>;
  const rawUser = (payload.user ?? payload.data ?? {}) as Record<string, unknown>;

  // Parse moduleAccess array (backend may return array or JSON string)
  let parsedModules: string[] = [];
  if (Array.isArray(rawUser.moduleAccess)) {
    parsedModules = rawUser.moduleAccess.map(String);
  } else if (typeof rawUser.moduleAccess === "string") {
    try {
      parsedModules = JSON.parse(rawUser.moduleAccess);
    } catch {
      parsedModules = [];
    }
  }

  const permissions: ModulePermissions = Object.fromEntries(
    MODULE_KEYS.map((k) => [
      k,
      (rawUser.permissions &&
        typeof rawUser.permissions === "object" &&
        (rawUser.permissions as Record<string, boolean>)[k] === true) ||
        parsedModules.some(
          (m) =>
            m.toLowerCase().replace(/[\s_-]/g, "") ===
              k.toLowerCase().replace(/[\s_-]/g, "") ||
            m.toLowerCase().includes(k.toLowerCase())
        ) ||
        k === "attendance", // Attendance always enabled for portal users
    ])
  ) as ModulePermissions;

  const normalizedUser = {
    userId: String(rawUser.userId ?? rawUser.user_id ?? rawUser.id ?? ""),
    email: String(rawUser.email ?? ""),
    name: String(rawUser.name ?? rawUser.fullname ?? rawUser.fullName ?? "Portal User"),
    permissions,
  };

  const response = Response.json({ success: true, user: normalizedUser }, { status: 200 });

  // Prefer the cookie set by the backend; fall back to a token in the payload body.
  const backendCookie = result.headers.get("set-cookie");
  if (backendCookie) {
    response.headers.set("Set-Cookie", backendCookie);
  } else if (typeof payload.token === "string") {
    const isProduction = process.env.NODE_ENV === "production";
    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${payload.token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${isProduction ? "; Secure" : ""}`
    );
  }

  return response;
}

// ─── Local bcrypt fallback ────────────────────────────────────────────────
// Used when the external backend returns 502 (unreachable).
// Verifies credentials against the local Prisma SQLite DB (PortalUser) and
// issues a signed JWT so the session works identically to the backend path.

async function handleLocalLogin(body: Record<string, unknown>): Promise<Response> {
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return Response.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }

  let dbUser: {
    id: string;
    email: string;
    fullname: string;
    passwordHash: string;
    moduleAccess: string;
    isActive: boolean;
  } | null = null;

  try {
    dbUser = await prisma.portalUser.findUnique({ where: { email } });
  } catch (err) {
    console.error("[login] Local DB lookup failed:", err);
    return Response.json(
      { success: false, message: "Authentication service is currently unavailable." },
      { status: 503 }
    );
  }

  // Generic message to avoid user enumeration
  const invalidMsg = "Invalid email or password.";

  if (!dbUser || !dbUser.isActive) {
    return Response.json({ success: false, message: invalidMsg }, { status: 401 });
  }

  const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
  if (!passwordMatch) {
    return Response.json({ success: false, message: invalidMsg }, { status: 401 });
  }

  // Parse module access and build permissions
  let parsedModules: string[] = [];
  try {
    parsedModules = JSON.parse(dbUser.moduleAccess);
  } catch {
    parsedModules = [];
  }

  const permissions: ModulePermissions = Object.fromEntries(
    MODULE_KEYS.map((k) => [
      k,
      parsedModules.some(
        (m) =>
          m.toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "") ||
          m.toLowerCase().includes(k.toLowerCase())
      ) || k === "attendance",
    ])
  ) as ModulePermissions;

  const normalizedUser = {
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.fullname,
    permissions,
  };

  // Sign a local JWT identical in shape to what the backend issues
  const token = await new SignJWT({
    userId: dbUser.id,
    email: dbUser.email,
    name: dbUser.fullname,
    role: "user",
    permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("tbs-portal")
    .setAudience("tbs-portal-users")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(USER_SECRET);

  const isProduction = process.env.NODE_ENV === "production";
  const response = Response.json({ success: true, user: normalizedUser }, { status: 200 });
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${isProduction ? "; Secure" : ""}`,
  );

  return response;
}
