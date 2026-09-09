/**
 * /api/admin/users
 *
 * GET  — 🔒 Admin JWT. Proxies → GET  /api/user-master
 * POST — 🔒 Admin JWT. Generates a `tbusr001`-style ID, then proxies → POST /api/user-master
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import type { PortalUserPublic } from "@/types";

/**
 * Derives the next sequential user ID in the format `tbusr001`, `tbusr002`, …
 * Scans existing user IDs that match the pattern and increments the highest index.
 * Falls back to `tbusr001` when no existing users match the pattern.
 */
function generateUserId(existingUsers: PortalUserPublic[]): string {
  const pattern = /^tbusr(\d+)$/;
  const maxIndex = existingUsers.reduce<number>((max, u) => {
    const match = u.user_id?.match(pattern);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `tbusr${String(maxIndex + 1).padStart(3, "0")}`;
}

export async function GET(request: NextRequest) {
  const result = await backendFetch("/api/user-master", {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  return Response.json(result.data, { status: result.status });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  // Fetch existing users to derive the next sequential ID
  const listResult = await backendFetch("/api/user-master", {
    method: "GET",
    authorization,
  });

  const existingUsers: PortalUserPublic[] = listResult.ok
    ? ((listResult.data as { data?: PortalUserPublic[] })?.data ?? [])
    : [];

  const user_id = generateUserId(existingUsers);

  const result = await backendFetch("/api/user-master", {
    method: "POST",
    authorization,
    body: { user_id, ...body },
  });

  return Response.json(result.data, { status: result.status });
}
