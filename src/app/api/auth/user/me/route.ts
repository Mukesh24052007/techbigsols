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
import { MODULE_KEYS, type ModulePermissions } from "@/types";

const COOKIE_NAME = "tbs_user_token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return Response.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  const userJwtSecret = process.env.USER_JWT_SECRET;
  if (!userJwtSecret || userJwtSecret.trim() === "") {
    return Response.json(
      { success: false, message: "Server is misconfigured: USER_JWT_SECRET is not set" },
      { status: 500 }
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
  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(userJwtSecret), {
      issuer: "tbs-portal",
      audience: "tbs-portal-users",
    });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, message: "Invalid or expired session." },
      { status: 401 }
    );
  }

  const userId = (payload.userId as string) || (payload.sub as string);
  let dbUser = null;
  try {
    dbUser = await prisma.portalUser.findUnique({
      where: { id: userId },
    });
  } catch (err) {
    console.warn("[me] Local Prisma store unavailable:", err instanceof Error ? err.message : "DB error");
    return Response.json(
      { success: false, message: "Not authenticated." },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: {
      userId,
      email: dbUser?.email || (payload.email as string),
      name: dbUser?.fullname || (payload.name as string),
      permissions: payload.permissions,
    },
  }, { status: 200 });
}
