import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";
import { getTodayDateString } from "@/lib/attendance/qr-sessions";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get("date") || getTodayDateString();
  const statusParam = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 25));

  // 1. Try external backend
  try {
    const query = searchParams.toString();
    const result = await backendFetch(`/api/attendance/admin/daily-logs?${query}`, {
      method: "GET",
      authorization,
    });
    if (result.ok) {
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Local database fallback
  try {
    const whereClause: {
      date: string;
      status?: string;
    } = { date: dateParam };

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }

    const [total, records] = await Promise.all([
      prisma.attendanceRecord.count({ where: whereClause }),
      prisma.attendanceRecord.findMany({
        where: whereClause,
        include: { employee: true },
        orderBy: { checkIn: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedRecords = records.map((r, idx) => ({
      id: r.id || (page - 1) * limit + idx + 1,
      user_id: r.employeeId,
      attendance_date: r.date,
      fullname: r.employee?.name || r.employeeId,
      office_id: 1,
      check_in_at: r.checkIn ? r.checkIn.toISOString() : null,
      check_out_at: r.checkOut ? r.checkOut.toISOString() : null,
      status: r.status,
      is_manual_override: (r.method || "").toLowerCase().includes("manual"),
      override_reason: null,
      override_by: null,
      worked_minutes: Number(r.workedMinutes || 0),
      check_in_lat: r.lat ?? null,
      check_in_lng: r.lng ?? null,
      check_in_accuracy: r.gpsAccuracy ?? null,
      check_out_lat: null,
      check_out_lng: null,
      check_out_accuracy: null,
      ip: r.ip ?? null,
      created_at: r.createdAt.toISOString(),
      updated_at: r.createdAt.toISOString(),
    }));

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return Response.json({
      success: true,
      data: {
        date: dateParam,
        total,
        page,
        limit,
        totalPages,
        records: formattedRecords,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load daily logs.";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}

