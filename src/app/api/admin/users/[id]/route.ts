/**
 * /api/admin/users/[id]
 *
 * GET    — 🔒 Admin JWT. Proxies → GET    /api/user-master/:id
 * PUT    — 🔒 Admin JWT. Proxies → PUT    /api/user-master/:id
 * DELETE — 🔒 Admin JWT. Proxies → DELETE /api/user-master/:id
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  return Response.json(result.data, { status: result.status });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "PUT",
    authorization: request.headers.get("authorization"),
    body,
  });

  return Response.json(result.data, { status: result.status });
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const result = await backendFetch(`/api/user-master/${id}`, {
    method: "DELETE",
    authorization: request.headers.get("authorization"),
  });

  return Response.json(result.data, { status: result.status });
}
