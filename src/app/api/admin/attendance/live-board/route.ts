/**
 * GET /api/admin/attendance/live-board
 *
 * Proxies → GET /api/attendance/admin/live on the Express backend (port 5000).
 * Falls back gracefully to local users and attendance records if backend is unavailable.
 */

import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  // 1. Try Express backend endpoint: /api/attendance/admin/live
  try {
    const result = await backendFetch("/api/attendance/admin/live", {
      method: "GET",
      authorization,
    });

    if (result.ok) {
      const payload = (result.data as Record<string, unknown>)?.data ?? result.data;
      const raw = payload as Record<string, unknown>;
      const rows = (raw?.rows ?? []) as Array<Record<string, unknown>>;

      const employees = rows.map((r) => ({
        user_id: String(r.employeeId ?? r.userId ?? r.id ?? ""),
        fullname: String(r.name ?? r.fullname ?? "Employee"),
        email: String(r.email ?? ""),
        department: String(r.department ?? "—"),
        checkInTime: (r.checkInTime as string) ?? null,
        checkOutTime: (r.checkOutTime as string) ?? null,
        status: (r.status === "ABSENT" ? "NOT_CHECKED_IN" : r.status ?? "NOT_CHECKED_IN") as string,
        presenceState: r.presenceState === "ABSENT" ? null : (r.presenceState as string | null),
        workedMinutes: Number(r.workedMinutes ?? 0),
      }));

      return Response.json(
        {
          success: true,
          data: {
            employees,
            counts: raw?.counts ?? null,
            officeConfig: {
              name: "TBS HQ Bangalore",
              shift_start: "09:30",
              grace_minutes: 10,
            },
          },
        },
        { status: 200 }
      );
    }
  } catch {
    // Proceed to fallback
  }

  // 2. Fallback: local Prisma database
  try {
    const users = await prisma.portalUser.findMany({
      where: { isActive: true },
      include: {
        employee: {
          include: {
            attendance: {
              take: 1,
              orderBy: { checkIn: "desc" },
            },
          },
        },
      },
    });

    const employees = users
      .filter((u) => {
        try {
          const mods = JSON.parse(u.moduleAccess) as string[];
          return mods.some((m) => m.toLowerCase().includes("attendance"));
        } catch {
          return true;
        }
      })
      .map((u) => {
        const record = u.employee?.attendance?.[0];
        return {
          user_id: u.id,
          fullname: u.fullname,
          email: u.email,
          department: u.employee?.department ?? "—",
          checkInTime: record?.checkIn?.toISOString() ?? null,
          checkOutTime: record?.checkOut?.toISOString() ?? null,
          status: record ? record.status : "NOT_CHECKED_IN",
          presenceState: record?.locationStatus ?? null,
          workedMinutes: record?.workedMinutes ?? 0,
        };
      });

    return Response.json(
      {
        success: true,
        data: {
          employees,
          officeConfig: {
            name: "TBS HQ Bangalore",
            shift_start: "09:30",
            grace_minutes: 10,
          },
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load live board";
    return Response.json({ success: false, message }, { status: 500 });
  }
}
