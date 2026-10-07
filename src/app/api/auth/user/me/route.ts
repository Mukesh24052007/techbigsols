/**
 * GET /api/auth/user/me
 *
 * Proxies → GET /api/site-auth/me on the backend, with fallback
 * to local JWT verification and database profile retrieval.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "tbs_user_token";
const RAW_USER_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "tbs-user-secret-key-2026";
const USER_SECRET = new TextEncoder().encode(RAW_USER_SECRET);

import { MODULE_KEYS, type ModulePermissions } from "@/types";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return Response.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const result = await backendFetch("/api/site-auth/me", {
    method: "GET",
    authorization: `Bearer ${token}`,
    cookie: request.headers.get("cookie"),
  });

  if (result.ok) {
    const payload = result.data as Record<string, unknown>;
    const rawUser = (
      (payload.user as Record<string, unknown>) ??
      (payload.data as Record<string, unknown>) ??
      payload
    ) as Record<string, unknown>;

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
        (rawUser.permissions && typeof rawUser.permissions === "object" && (rawUser.permissions as Record<string, boolean>)[k] === true) ||
        parsedModules.some((m) =>
          m.toLowerCase().replace(/[\s_-]/g, "") === k.toLowerCase().replace(/[\s_-]/g, "") ||
          m.toLowerCase().includes(k.toLowerCase())
        ) ||
        k === "attendance",
      ])
    ) as ModulePermissions;

    const user = {
      userId: String(rawUser.userId ?? rawUser.user_id ?? rawUser.id ?? ""),
      email: String(rawUser.email ?? ""),
      name: String(rawUser.name ?? rawUser.fullname ?? rawUser.fullName ?? "Portal User"),
      permissions,
    };

    return Response.json({ success: true, user }, { status: 200 });
  }

  // Fallback: verify local JWT
  try {
    const { payload } = await jwtVerify(token, USER_SECRET, {
      issuer: "tbs-portal",
      audience: "tbs-portal-users",
    });

    const userId = (payload.userId as string) || (payload.sub as string);
    const dbUser = await prisma.portalUser.findUnique({
      where: { id: userId },
    });

    return Response.json({
      success: true,
      user: {
        userId,
        email: dbUser?.email || payload.email,
        name: dbUser?.fullname || payload.name,
        permissions: payload.permissions,
      },
    }, { status: 200 });
  } catch {
    return Response.json(
      { success: false, message: "Invalid or expired session." },
      { status: 401 }
    );
  }
}
