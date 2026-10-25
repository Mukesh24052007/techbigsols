/**
 * /api/admin/users/[id]
 *
 * GET    — 🔒 Admin JWT. Proxies → GET    /api/user-master/:id
 * PUT    — 🔒 Admin JWT. Proxies → PUT    /api/user-master/:id
 * DELETE — 🔒 Admin JWT. Proxies → DELETE /api/user-master/:id
 *
 * Falls back to local Prisma DB when backend is unreachable (502/503/504)
 * or rejects auth (401/403, e.g. dev token not recognized by Express).
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/api/admin-auth";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

/** Returns true if the backend response means we should fall back to local DB */
function shouldFallback(status: number): boolean {
  return (status >= 502 && status <= 504) || status === 401 || status === 403;
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const authorization = request.headers.get("authorization");

  // Verify admin token locally first
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "GET",
    authorization,
  });

  if (result.ok || !shouldFallback(result.status)) {
    return Response.json(result.data, { status: result.status });
  }

  try {
    const user = await prisma.portalUser.findUnique({ where: { id } });
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return Response.json({
      success: true,
      data: {
        user_id: user.id,
        fullname: user.fullname,
        email: user.email,
        moduleAccess: JSON.parse(user.moduleAccess || "[]"),
        is_active: user.isActive,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch {
    return Response.json({ success: false, message: "Database query failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const authorization = request.headers.get("authorization");

  // Verify admin token locally first
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "PUT",
    authorization,
    body,
  });

  if (result.ok || !shouldFallback(result.status)) {
    return Response.json(result.data, { status: result.status });
  }

  try {
    const dataToUpdate: Record<string, unknown> = {};
    if (body.fullname !== undefined) dataToUpdate.fullname = String(body.fullname).trim();
    if (body.email !== undefined) {
      const cleanEmail = String(body.email).trim().toLowerCase();
      // Check if another user has this email
      const existingUser = await prisma.portalUser.findFirst({
        where: { email: cleanEmail, NOT: { id } },
      });
      if (existingUser) {
        return Response.json(
          {
            success: false,
            message: `Email "${cleanEmail}" is already used by ${existingUser.fullname} (${existingUser.id}).`,
          },
          { status: 409 }
        );
      }
      dataToUpdate.email = cleanEmail;
    }
    if (body.password !== undefined && String(body.password).trim().length >= 6) {
      dataToUpdate.passwordHash = await bcrypt.hash(String(body.password).trim(), 10);
    }
    if (body.is_active !== undefined) dataToUpdate.isActive = Boolean(body.is_active);
    if (body.moduleAccess !== undefined) dataToUpdate.moduleAccess = JSON.stringify(body.moduleAccess);

    const updated = await prisma.portalUser.update({
      where: { id },
      data: dataToUpdate,
    });

    if (body.fullname !== undefined || body.email !== undefined) {
      await prisma.employee.updateMany({
        where: { OR: [{ userId: id }, { id }] },
        data: {
          ...(dataToUpdate.fullname ? { name: String(dataToUpdate.fullname) } : {}),
          ...(dataToUpdate.email ? { email: String(dataToUpdate.email) } : {}),
        },
      });
    }

    return Response.json({
      success: true,
      data: {
        user_id: updated.id,
        fullname: updated.fullname,
        email: updated.email,
        moduleAccess: JSON.parse(updated.moduleAccess || "[]"),
        is_active: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("[PUT /api/admin/users/[id]] Error:", err);
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return Response.json({ success: false, message: "A user with this email already exists." }, { status: 409 });
    }
    return Response.json({ success: false, message: "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const authorization = request.headers.get("authorization");

  // Verify admin token locally first
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "DELETE",
    authorization,
  });

  if (result.ok || !shouldFallback(result.status)) {
    return Response.json(result.data, { status: result.status });
  }

  try {
    const linkedEmp = await prisma.employee.findFirst({
      where: { OR: [{ userId: id }, { id }] },
      select: { id: true },
    });

    await prisma.$transaction(async (tx) => {
      if (linkedEmp) {
        await tx.faceTemplate.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.attendanceAttempt.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.reVerificationPrompt.deleteMany({ where: { record: { employeeId: linkedEmp.id } } });
        await tx.presenceInterval.deleteMany({ where: { record: { employeeId: linkedEmp.id } } });
        await tx.attendanceRecord.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.leave.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.regularization.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.consentRecord.deleteMany({ where: { employeeId: linkedEmp.id } });
        await tx.employee.deleteMany({ where: { id: linkedEmp.id } });
      }
      await tx.portalUser.deleteMany({ where: { id } });
    });

    return Response.json({ success: true, message: "User deleted successfully." });
  } catch (err: unknown) {
    console.error("[DELETE /api/admin/users/[id]] Error:", err);
    return Response.json({ success: false, message: "Failed to delete user." }, { status: 500 });
  }
}
