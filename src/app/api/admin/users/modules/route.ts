/**
 * GET /api/admin/users/modules
 *
 * 🔒 Admin JWT. Proxies → GET /api/user-master/modules
 *
 * Returns the full module checkbox list from the backend.
 * Falls back to the locally defined MODULE_KEYS if the backend
 * is unavailable, so the admin UI always has something to render.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MODULE_KEYS, MODULE_LABELS } from "@/types";

export async function GET(request: NextRequest) {
  const result = await backendFetch("/api/user-master/modules", {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  // If backend responded successfully, forward it as-is
  if (result.ok) {
    return Response.json(result.data, { status: result.status });
  }

  // Fallback: build the list from local constants so the UI never breaks
  const modules = MODULE_KEYS.map((key) => ({ key, label: MODULE_LABELS[key] }));
  return Response.json({ success: true, data: modules });
}
