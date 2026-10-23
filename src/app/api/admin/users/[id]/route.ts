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
    if (body.fullname !== undefined) dataToUpdate.fullname = String(body.fullname);
    if (body.email !== undefined) dataToUpdate.email = String(body.email);
    if (body.is_active !== undefined) dataToUpdate.isActive = Boolean(body.is_active);
    if (body.moduleAccess !== undefined) dataToUpdate.moduleAccess = JSON.stringify(body.moduleAccess);

    const updated = await prisma.portalUser.update({
      where: { id },
      data: dataToUpdate,
    });

    if (body.fullname !== undefined || body.email !== undefined) {
      await prisma.employee.updateMany({
        where: { userId: id },
        data: {
          name: updated.fullname,
          email: updated.email,
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
  } catch {
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
    await prisma.portalUser.delete({ where: { id } });
    await prisma.employee.deleteMany({ where: { id } });
    return Response.json({ success: true, message: "User deleted successfully." });
  } catch {
    return Response.json({ success: false, message: "Failed to delete user." }, { status: 500 });
  }
}
