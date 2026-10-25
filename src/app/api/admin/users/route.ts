/**
 * /api/admin/users
 *
 * GET  — 🔒 Admin JWT. Proxies → GET  /api/user-master (with fallback to local Prisma DB if backend is unreachable or rejects auth)
 * POST — 🔒 Admin JWT. Generates a `tbusr001`-style ID, then proxies → POST /api/user-master
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/api/admin-auth";
import bcrypt from "bcryptjs";

function generateUserId(existingIds: string[]): string {
  const pattern = /^tbusr(\d+)$/;
  const maxIndex = existingIds.reduce<number>((max, id) => {
    const match = id?.match(pattern);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `tbusr${String(maxIndex + 1).padStart(3, "0")}`;
}

/** Returns true if the backend response means we should fall back to local DB */
function shouldFallback(status: number): boolean {
  return (status >= 502 && status <= 504) || status === 401 || status === 403;
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  // Verify admin token locally first
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

  // Attempt backend proxy first
  const result = await backendFetch("/api/user-master", {
    method: "GET",
    authorization,
  });

  if (result.ok) {
    return Response.json(result.data, { status: result.status });
  }

  // If backend is not reachable or rejected the token, fall back to local DB
  if (!shouldFallback(result.status)) {
    return Response.json(result.data, { status: result.status });
  }

  // Fallback to local Prisma database
  try {
    const users = await prisma.portalUser.findMany({
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
        hasFaceTemplate: (u.employee?.faceTemplates?.length ?? 0) > 0,
        faceTemplateCount: u.employee?.faceTemplates?.length ?? 0,
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

  // Verify admin token locally first
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

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

    if (result.ok || !shouldFallback(result.status)) {
      return Response.json(result.data, { status: result.status });
    }
  }

  // Fallback to local Prisma database (backend unreachable or auth rejected)
  try {
    const fullname = String(body.fullname ?? body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "password123");
    const moduleAccessArr = Array.isArray(body.moduleAccess) ? body.moduleAccess : ["Attendance"];

    if (!fullname || !email) {
      return Response.json(
        { success: false, message: "Full name and email are required." },
        { status: 400 }
      );
    }

    // Check if email already exists in portal users
    const existingUser = await prisma.portalUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: `Email "${email}" is already in use by ${existingUser.fullname} (${existingUser.id}). You can activate or edit this user from the list.`,
        },
        { status: 409 }
      );
    }

    // Check existing employee by email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
    });

    // Generate safe unique ID considering both tables
    const allUsers = await prisma.portalUser.findMany({ select: { id: true } });
    const allEmps = await prisma.employee.findMany({ select: { id: true } });
    const existingIds = [...allUsers.map((u) => u.id), ...allEmps.map((e) => e.id)];
    const user_id = generateUserId(existingIds);

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.portalUser.create({
        data: {
          id: user_id,
          fullname,
          email,
          passwordHash,
          moduleAccess: JSON.stringify(moduleAccessArr),
          isActive: true,
        },
      });

      if (existingEmployee) {
        await tx.employee.update({
          where: { id: existingEmployee.id },
          data: {
            userId: user_id,
            name: fullname,
          },
        });
      } else {
        await tx.employee.create({
          data: {
            id: user_id,
            userId: user_id,
            name: fullname,
            email,
            department: "General",
          },
        });
      }

      return user;
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
    console.error("[POST /api/admin/users] Error:", err);
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "P2002") {
        return Response.json(
          { success: false, message: "A user or employee with this email already exists." },
          { status: 409 }
        );
      }
    }
    const rawMsg = err instanceof Error ? err.message : "";
    const cleanMsg = rawMsg.includes("Unique constraint")
      ? "A record with this email already exists."
      : "Failed to create user. Please check the details and try again.";

    return Response.json({ success: false, message: cleanMsg }, { status: 500 });
  }
}
