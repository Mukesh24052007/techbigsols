import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  let body: {
    userId?: string;
    attendanceDate?: string;
    status?: "PRESENT" | "ABSENT";
    reason?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, attendanceDate, status, reason } = body;
  if (!userId || !attendanceDate || !status || !reason?.trim()) {
    return Response.json(
      { success: false, message: "userId, attendanceDate, status, and reason are required." },
      { status: 400 }
    );
  }

  // 1. Try backend
  try {
    const result = await backendFetch("/api/attendance/admin/manual-override", {
      method: "POST",
      authorization,
      body,
    });
    if (result.ok) {
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Local fallback
  try {
    const emp = await prisma.employee.findFirst({
      where: {
        OR: [{ id: userId }, { userId: userId }],
      },
    });

    const empId = emp ? emp.id : userId;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const record = await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: empId,
          date: attendanceDate,
        },
      },
      create: {
        employeeId: empId,
        date: attendanceDate,
        checkIn: new Date(),
        status,
        method: "Manual Admin Edit",
        ip,
        workedMinutes: status === "PRESENT" ? 480 : 0,
      },
      update: {
        status,
        method: "Manual Admin Edit",
        workedMinutes: status === "PRESENT" ? 480 : 0,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: "MANUAL_OVERRIDE",
        target: `employee:${empId}, date:${attendanceDate}`,
        details: JSON.stringify({
          status,
          reason: reason.trim(),
          override_reason: reason.trim(),
          recordId: record.id,
        }),
        performedBy: "Admin",
        ip,
      },
    });

    return Response.json({
      success: true,
      message: `Attendance status updated to ${status} for ${emp?.name || userId}.`,
      data: {
        recordId: record.id,
        userId: empId,
        attendanceDate,
        status,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to apply manual override.";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}

