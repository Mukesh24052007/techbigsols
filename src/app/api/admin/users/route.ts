/**
 * /api/admin/users
 *
 * GET  — 🔒 Admin JWT. Proxies → GET  /api/user-master
 * POST — 🔒 Admin JWT. Proxies → POST /api/user-master
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(request: NextRequest) {
  const result = await backendFetch("/api/user-master", {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  return Response.json(result.data, { status: result.status });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const result = await backendFetch("/api/user-master", {
    method: "POST",
    authorization: request.headers.get("authorization"),
    body,
  });

  return Response.json(result.data, { status: result.status });
}
