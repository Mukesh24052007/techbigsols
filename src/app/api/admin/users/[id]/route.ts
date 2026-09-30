/**
 * /api/admin/users/[id]
 *
 * GET    — 🔒 Admin JWT. Proxies → GET    /api/user-master/:id
 * PUT    — 🔒 Admin JWT. Proxies → PUT    /api/user-master/:id
 * DELETE — 🔒 Admin JWT. Proxies → DELETE /api/user-master/:id
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  if (result.ok) {
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
  } catch (err) {
    return Response.json({ success: false, message: "Database query failed" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "PUT",
    authorization: request.headers.get("authorization"),
    body,
  });

  if (result.ok) {
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

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "DELETE",
    authorization: request.headers.get("authorization"),
  });

  if (result.ok) {
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
