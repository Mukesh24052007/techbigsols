import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { attendanceBus } from "@/lib/attendance-bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);

  // In production, require authenticated user; in dev allow transparent dashboard loading
  if (!user && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Current date in Asia/Kolkata (IST = UTC + 5:30)
  const date = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  const [emps, recs, leaves] = await Promise.all([
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
    prisma.attendanceRecord.findMany({ where: { date } }),
    prisma.leave.findMany({
      where: {
        status: "APPROVED",
        fromDate: { lte: date },
        toDate: { gte: date },
      },
    }),
  ]);

  const rec = new Map(recs.map((r) => [r.employeeId, r]));
  const onLeave = new Set(leaves.map((l) => l.employeeId));

  const rows = emps.map((e) => {
    const r = rec.get(e.id);
    return {
      id: e.id,
      name: e.name,
      department: e.department,
      checkIn: r ? r.checkIn.toISOString() : null,
      method: r ? r.method || "Biometric" : null,
      status: onLeave.has(e.id) && !r ? "LEAVE" : r ? (r.status as "PRESENT" | "LATE" | "ABSENT" | "LEAVE") : "ABSENT",
    };
  });

  return NextResponse.json({ date, rows });
}

// Manual adjustment / admin override with audit logging
export async function PUT(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user || (!user.isAdmin && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden: Admin access required." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const employeeId = String(body.employeeId);
  const status = String(body.status) as "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
  const date = String(body.date || new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10));

  const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!emp) {
    return NextResponse.json({ error: "Employee not found." }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Upsert record
  const checkIn = new Date();
  const record = await prisma.attendanceRecord.upsert({
    where: { employeeId_date: { employeeId, date } },
    update: {
      status,
      method: "Manual Admin Edit",
    },
    create: {
      employeeId,
      date,
      checkIn,
      method: "Manual Admin Edit",
      status,
      ip,
    },
  });

  // Audit log entry for manual edit
  await prisma.auditLog.create({
    data: {
      action: "MANUAL_ATTENDANCE_EDIT",
      target: `employee:${employeeId}, date:${date}`,
      details: `Status set to ${status} for ${emp.name}`,
      performedBy: user.email || user.name || "Admin",
      ip,
    },
  });

  // Broadcast to Live Board
  attendanceBus.emit("checkin", {
    id: record.id,
    employeeId: emp.id,
    name: emp.name,
    department: emp.department,
    checkIn: record.checkIn.toISOString(),
    method: "Manual Edit",
    status,
  });

  return NextResponse.json({ success: true, record });
}
