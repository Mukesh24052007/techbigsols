/**
 * POST /api/auth/user/login
 *
 * Proxies → POST /api/site-auth/login on the external backend.
 * Returns { success, user } and sets the tbs_user_token HTTP-only cookie.
 *
 * Falls back to local Prisma DB ONLY when backendFetch could not reach the backend
 * (network error / 502/503/504) OR when the backend returned 401/404 and a local
 * Prisma user exists (legacy dev fallback).
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MODULE_KEYS, type ModulePermissions } from "@/types";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "tbs_user_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: NextRequest) {
  const userJwtSecret = process.env.USER_JWT_SECRET;
  if (!userJwtSecret || userJwtSecret.trim() === "") {
    return Response.json(
      { success: false, message: "Server is misconfigured: USER_JWT_SECRET is not set" },
      { status: 500 }
    );
  }

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

  if (result.ok) {
    const payload = result.data as Record<string, unknown>;
    const rawUser = (payload.user ?? payload.data ?? {}) as Record<string, unknown>;

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
          k === "attendance",
      ])
    ) as ModulePermissions;

    const normalizedUser = {
      userId: String(rawUser.userId ?? rawUser.user_id ?? rawUser.id ?? ""),
      email: String(rawUser.email ?? ""),
      name: String(rawUser.name ?? rawUser.fullname ?? rawUser.fullName ?? "Portal User"),
      permissions,
    };

    const response = Response.json({ success: true, user: normalizedUser }, { status: 200 });

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

  // If backend was unreachable (network error / 502 / 503 / 504)
  const isUnreachable = result.status >= 502 && result.status <= 504;

  // If backend returned 401 or 404, check whether a local Prisma user exists
  if (result.status === 401 || result.status === 404) {
    const email = String(body.email ?? "").trim().toLowerCase();
    let localExists = false;
    try {
      if (email) {
        const found = await prisma.portalUser.findUnique({
          where: { email },
          select: { id: true },
        });
        localExists = !!found;
      }
    } catch (err) {
      console.warn("[login] Local Prisma check unavailable:", err instanceof Error ? err.message : "DB error");
      localExists = false;
    }

    if (localExists) {
      return handleLocalLogin(body, userJwtSecret);
    }
  }

  if (isUnreachable) {
    return handleLocalLogin(body, userJwtSecret);
  }

  // Any other real HTTP response from backend (400, 403, 409, 422, 500, or 401/404 without local user)
  const data = result.data as Record<string, unknown>;
  const message =
    typeof data?.message === "string" ? data.message : "Invalid email or password.";
  return Response.json({ success: false, message }, { status: result.status });
}

// ─── Local fallback ──────────────────────────────────────────────────────────
async function handleLocalLogin(
  body: Record<string, unknown>,
  userJwtSecret: string
): Promise<Response> {
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return Response.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.portalUser.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    let parsedModules: string[] = [];
    try {
      parsedModules = JSON.parse(user.moduleAccess);
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

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.fullname,
      permissions,
      type: "site_user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("tbs-portal")
      .setAudience("tbs-portal-users")
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(userJwtSecret));

    const isProduction = process.env.NODE_ENV === "production";
    const response = Response.json(
      {
        success: true,
        user: {
          userId: user.id,
          email: user.email,
          name: user.fullname,
          permissions,
        },
      },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${isProduction ? "; Secure" : ""}`
    );

    return response;
  } catch (err) {
    console.warn("[login] Local Prisma store unavailable:", err instanceof Error ? err.message : "DB error");
    return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
  }
}
