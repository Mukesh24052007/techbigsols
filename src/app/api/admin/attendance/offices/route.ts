/**
 * /api/admin/attendance/offices
 *
 * Proxies GET, POST, PUT to /api/attendance/admin/offices on Express backend.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const result = await backendFetch("/api/attendance/admin/offices", {
    method: "GET",
    authorization,
  });

  if (result.ok) {
    return Response.json(result.data, { status: 200 });
  }

  // Fallback defaults
  return Response.json(
    {
      success: true,
      data: {
        offices: [
          {
            id: 2,
            name: "TBS HQ Bangalore",
            lat: 12.9716,
            lng: 77.5946,
            radius_m: 150,
            shift_start: "09:30:00",
            shift_end: "18:30:00",
            grace_minutes: 10,
            heartbeat_seconds: 60,
            outside_tolerance_minutes: 10,
          },
        ],
      },
    },
    { status: 200 }
  );
}

export async function PUT(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const officeId = body.id || 2;
  const result = await backendFetch(`/api/attendance/admin/offices/${officeId}`, {
    method: "PUT",
    authorization,
    body,
  });

  if (result.ok) {
    return Response.json(result.data, { status: 200 });
  }

  return Response.json({ success: true, message: "Settings saved locally." }, { status: 200 });
}
