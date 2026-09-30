import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { verifyAdminToken } from "@/lib/api/admin-auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isAdmin: boolean;
  permissions?: Record<string, boolean>;
}

const RAW_USER_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "tbs-user-secret-key-2026";
const USER_SECRET = new TextEncoder().encode(RAW_USER_SECRET);

export async function getSessionUser(
  req: NextRequest
): Promise<SessionUser | null> {
  const authHeader = req.headers.get("authorization");
  const userCookie = req.cookies.get("tbs_user_token")?.value;

  // 1. Check Admin Auth via header
  if (authHeader) {
    const adminCheck = await verifyAdminToken(authHeader);
    if (adminCheck.ok) {
      return {
        id: adminCheck.adminId,
        name: "Admin",
        email: adminCheck.email,
        role: "admin",
        isAdmin: true,
      };
    }
  }

  // 2. Check Portal User Cookie or User Bearer token
  const tokenCandidate =
    userCookie || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null);

  if (tokenCandidate) {
    try {
      const { payload } = await jwtVerify(tokenCandidate, USER_SECRET, {
        issuer: "tbs-portal",
        audience: "tbs-portal-users",
      });

      return {
        id: (payload.userId as string) || (payload.sub as string) || "user",
        name: (payload.name as string) || (payload.fullname as string) || "User",
        email: (payload.email as string) || "",
        role: "user",
        isAdmin: false,
        permissions: payload.permissions as Record<string, boolean> | undefined,
      };
    } catch {
      // Continue
    }
  }

  // 3. In dev mode, check if dev token is present in localStorage / custom dev header
  const devToken = process.env.ADMIN_DEV_TOKEN || process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN;
  if (devToken && (authHeader === `Bearer ${devToken}` || req.headers.get("x-dev-token") === devToken)) {
    return {
      id: "dev-admin",
      name: "Dev Admin",
      email: "admin@gmail.com",
      role: "admin",
      isAdmin: true,
    };
  }

  return null;
}
