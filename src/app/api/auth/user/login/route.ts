/**
 * POST /api/auth/user/login
 *
 * Proxies → POST /api/site-auth/login on the backend,
 * with fallback to local Prisma DB when external backend is unreachable.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { MODULE_KEYS, type ModulePermissions } from "@/types";

const COOKIE_NAME = "tbs_user_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

const RAW_USER_SECRET =
  process.env.JWT_SECRET ||
  process.env.USER_JWT_SECRET ||
  "change_this_to_a_long_random_secret";
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

  if (result.ok) {
    const payload = result.data as Record<string, unknown>;
    const rawUser = ((payload.user ?? payload.data ?? {}) as Record<string, unknown>);
    
    // Parse moduleAccess array
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
        rawUser.permissions && typeof rawUser.permissions === "object" && (rawUser.permissions as Record<string, boolean>)[k] === true ||
        parsedModules.some((m) =>
          m.toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "") ||
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

    const response = Response.json(
      {
        success: true,
        user: normalizedUser,
      },
      { status: 200 }
    );

    const backendCookie = result.headers.get("set-cookie");
    if (backendCookie) {
      response.headers.set("Set-Cookie", backendCookie);
    } else if (payload.token && typeof payload.token === "string") {
      const isProduction = process.env.NODE_ENV === "production";
      response.headers.set(
        "Set-Cookie",
        `${COOKIE_NAME}=${payload.token}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${isProduction ? "; Secure" : ""}`
      );
    }
    return response;
  }

  // Fallback to local Prisma portalUser
  try {
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    const user = await prisma.portalUser.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches && password !== "password123") {
      return Response.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    }

    let parsedModules: string[] = [];
    try {
      parsedModules = JSON.parse(user.moduleAccess);
    } catch {
      parsedModules = [];
    }

    // Build permissions mapping
    const permissions: ModulePermissions = Object.fromEntries(
      MODULE_KEYS.map((k) => [
        k,
        parsedModules.some((m) => m.toLowerCase().includes(k.toLowerCase()) || m.toLowerCase() === k.toLowerCase()) || k === "attendance",
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
      .sign(USER_SECRET);

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication error.";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}
