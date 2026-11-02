/**
 * /api/admin/users
 *
 * GET  — 🔒 Admin JWT. Returns merged users from both local DB and backend.
 * POST — 🔒 Admin JWT. Saves user to local Prisma DB AND syncs to backend.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateUserId(existingIds: string[]): string {
  const pattern = /^tbusr(\d+)$/;
  const maxIndex = existingIds.reduce<number>((max, id) => {
    const match = id?.match(pattern);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `tbusr${String(maxIndex + 1).padStart(3, "0")}`;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  interface UserItem {
    user_id: string;
    fullname: string;
    email: string;
    moduleAccess: string[];
    is_active: boolean;
    createdAt: string;
    hasFaceTemplate: boolean;
    faceTemplateCount: number;
  }

  // 1. Fetch local users
  const localUsers: UserItem[] = [];
  try {
    const dbUsers = await prisma.portalUser.findMany({
      orderBy: { id: "asc" },
      include: {
        employee: {
          include: {
            faceTemplates: {
              select: { id: true, version: true },
            },
          },
        },
      },
    });

    for (const u of dbUsers) {
      let moduleAccess: string[] = [];
      try {
        moduleAccess = JSON.parse(u.moduleAccess);
      } catch {
        moduleAccess = [];
      }

      localUsers.push({
        user_id: u.id,
        fullname: u.fullname,
        email: u.email,
        moduleAccess,
        is_active: u.isActive,
        createdAt: u.createdAt.toISOString(),
        hasFaceTemplate: (u.employee?.faceTemplates?.length ?? 0) > 0,
        faceTemplateCount: u.employee?.faceTemplates?.length ?? 0,
      });
    }
  } catch (err) {
    console.error("[GET /api/admin/users] Local DB error:", err);
  }

  // 2. Fetch backend users
  interface RawBackendUser {
    userId?: string;
    user_id?: string;
    id?: string;
    fullname?: string;
    name?: string;
    email?: string;
    moduleAccess?: string[] | string;
    is_active?: number | boolean;
    created_at?: string;
  }

  let backendUsers: RawBackendUser[] = [];
  try {
    const result = await backendFetch("/api/user-master", {
      method: "GET",
      authorization,
    });
    if (result.ok) {
      const payload = result.data as { data?: RawBackendUser[] } | RawBackendUser[];
      backendUsers = Array.isArray(payload) ? payload : payload?.data ?? [];
    }
  } catch {
    // Ignore backend fetch error
  }

  // 3. Merge & deduplicate by email
  const seenEmails = new Set<string>();
  const merged: UserItem[] = [];

  for (const u of localUsers) {
    seenEmails.add(u.email.toLowerCase());
    merged.push(u);
  }

  for (const u of backendUsers) {
    const email = String(u.email || "").toLowerCase();
    if (email && !seenEmails.has(email)) {
      seenEmails.add(email);
      let mods = u.moduleAccess;
      if (typeof mods === "string") {
        try {
          mods = JSON.parse(mods) as string[];
        } catch {
          mods = [];
        }
      }
      merged.push({
        user_id: String(u.userId || u.user_id || u.id || ""),
        fullname: String(u.fullname || u.name || "Employee"),
        email: u.email!,
        moduleAccess: Array.isArray(mods) ? mods : [],
        is_active: u.is_active === 1 || u.is_active === true,
        createdAt: u.created_at || new Date().toISOString(),
        hasFaceTemplate: false,
        faceTemplateCount: 0,
      });
    }
  }

  return Response.json({ success: true, data: merged }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const fullname = String(body.fullname ?? body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "password123");
  const moduleAccessArr = Array.isArray(body.moduleAccess)
    ? body.moduleAccess.map(String)
    : ["Attendance"];

  if (!fullname || !email) {
    return Response.json(
      { success: false, message: "Fullname and email are required." },
      { status: 400 }
    );
  }

  // 1. Create or update in local SQLite database
  let localUser: { id: string; fullname: string; email: string; isActive: boolean; createdAt: Date } | null = null;
  try {
    const allUsers = await prisma.portalUser.findMany({ select: { id: true } });
    const user_id = generateUserId(allUsers.map((u) => u.id));
    const passwordHash = await bcrypt.hash(password, 10);

    localUser = await prisma.portalUser.upsert({
      where: { email },
      create: {
        id: user_id,
        fullname,
        email,
        passwordHash,
        moduleAccess: JSON.stringify(moduleAccessArr),
        isActive: true,
      },
      update: {
        fullname,
        passwordHash,
        moduleAccess: JSON.stringify(moduleAccessArr),
        isActive: true,
      },
    });

    await prisma.employee.upsert({
      where: { email },
      create: {
        id: localUser.id,
        userId: localUser.id,
        name: fullname,
        email,
        department: "General",
      },
      update: {
        name: fullname,
        userId: localUser.id,
      },
    });
  } catch (err) {
    console.error("[POST /api/admin/users] Local DB error:", err);
  }

  // 2. Also forward to backend if available
  let backendData: unknown = null;
  try {
    const listResult = await backendFetch("/api/user-master", {
      method: "GET",
      authorization,
    });
    const existingUsers = ((listResult.data as { data?: { user_id: string }[] })?.data ?? []);
    const user_id = localUser?.id || generateUserId(existingUsers.map((u) => u.user_id));

    const result = await backendFetch("/api/user-master", {
      method: "POST",
      authorization,
      body: {
        user_id,
        fullname,
        email,
        password,
        moduleAccess: moduleAccessArr,
      },
    });

    if (result.ok) {
      backendData = result.data;
    }
  } catch {
    // Ignore backend network error
  }

  if (backendData) {
    return Response.json(backendData, { status: 201 });
  }

  if (localUser) {
    return Response.json(
      {
        success: true,
        data: {
          user_id: localUser.id,
          fullname: localUser.fullname,
          email: localUser.email,
          moduleAccess: moduleAccessArr,
          is_active: localUser.isActive,
          createdAt: localUser.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  }

  return Response.json({ success: false, message: "Failed to create user." }, { status: 500 });
}
