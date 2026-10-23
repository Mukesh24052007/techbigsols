/**
 * GET /api/admin/users/modules
 *
 * 🔒 Admin JWT. Proxies → GET /api/user-master/modules
 *
 * Returns the full module checkbox list from the backend.
 * Falls back to the locally defined MODULE_KEYS if the backend
 * is unreachable (502/503/504) or rejects auth (401/403).
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { MODULE_KEYS, MODULE_LABELS } from "@/types";

export async function GET(request: NextRequest) {
  const result = await backendFetch("/api/user-master/modules", {
    method: "GET",
    authorization: request.headers.get("authorization"),
  });

  const shouldFallback =
    (result.status >= 502 && result.status <= 504) ||
    result.status === 401 ||
    result.status === 403;

  if (!shouldFallback) {
    return Response.json(result.data, { status: result.status });
  }

  // Fallback: build the list from local constants
  const modules = MODULE_KEYS.map((key) => ({ key, label: MODULE_LABELS[key] }));
  return Response.json({ success: true, data: modules });
}
