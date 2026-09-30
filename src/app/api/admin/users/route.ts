/**
 * /api/admin/users
 *
 * GET  — 🔒 Admin JWT. Proxies → GET  /api/user-master (with fallback to local Prisma DB)
 * POST — 🔒 Admin JWT. Generates a `tbusr001`-style ID, then proxies → POST /api/user-master
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

  // Attempt backend proxy first
  const result = await backendFetch("/api/user-master", {
    method: "GET",
    authorization,
  });

  if (result.ok) {
    return Response.json(result.data, { status: result.status });
  }

  // Fallback to local Prisma database
  try {
    const users = await prisma.portalUser.findMany({
      orderBy: { id: "asc" },
    });

    const formatted = users.map((u) => {
      let moduleAccess: string[] = [];
      try {
        moduleAccess = JSON.parse(u.moduleAccess);
      } catch {
        moduleAccess = [];
      }

      return {
        user_id: u.id,
        fullname: u.fullname,
        email: u.email,
        moduleAccess,
        is_active: u.isActive,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return Response.json({ success: true, data: formatted }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/admin/users] DB fallback error:", err);
    return Response.json({ success: false, message: "Failed to fetch users." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  // Attempt backend proxy first
  const listResult = await backendFetch("/api/user-master", {
    method: "GET",
    authorization,
  });

  if (listResult.ok) {
    const existingUsers = ((listResult.data as { data?: { user_id: string }[] })?.data ?? []);
    const user_id = generateUserId(existingUsers.map((u) => u.user_id));

    const result = await backendFetch("/api/user-master", {
      method: "POST",
      authorization,
      body: { user_id, ...body },
    });

    return Response.json(result.data, { status: result.status });
  }

  // Fallback to local Prisma database
  try {
    const allUsers = await prisma.portalUser.findMany({ select: { id: true } });
    const user_id = generateUserId(allUsers.map((u) => u.id));

    const fullname = String(body.fullname ?? body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "password123");
    const moduleAccessArr = Array.isArray(body.moduleAccess) ? body.moduleAccess : ["Attendance"];
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.portalUser.create({
      data: {
        id: user_id,
        fullname,
        email,
        passwordHash,
        moduleAccess: JSON.stringify(moduleAccessArr),
        isActive: true,
      },
    });

    // Also create or link corresponding Employee record
    await prisma.employee.create({
      data: {
        id: user_id,
        userId: user_id,
        name: fullname,
        email,
        department: "General",
      },
    });

    return Response.json({
      success: true,
      data: {
        user_id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
        moduleAccess: moduleAccessArr,
        is_active: newUser.isActive,
        createdAt: newUser.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create user in local store.";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}
