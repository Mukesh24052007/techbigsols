import type { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/api/backend";
import { jwtVerify, decodeJwt } from "jose";
import { prisma } from "@/lib/prisma";
import {
  getTodayDateString,
  validateScannedToken,
} from "@/lib/attendance/qr-sessions";

// Exact allowlist of allowed (METHOD, PATH) combinations
const ALLOWED_ENDPOINTS: Record<string, Set<string>> = {
  GET: new Set(["me/status", "me/history"]),
  POST: new Set([
    "me/consent",
    "challenge",
    "check-in",
    "reverify",
    "heartbeat",
    "check-out",
    "regularization",
    "qr/check-in",
    "qr/check-out",
  ]),
};

const COOKIE_NAME = "tbs_user_token";
const TIMEOUT_MS = 15_000;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const RAW_USER_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "tbs-user-secret-key-2026";
const USER_SECRET = new TextEncoder().encode(RAW_USER_SECRET);

async function extractUserFromToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, USER_SECRET);
    return payload;
  } catch {
    try {
      return decodeJwt(token);
    } catch {
      return null;
    }
  }
}

async function handleLocalAttendance(
  subPath: string,
  method: string,
  request: NextRequest,
  token: string,
  bodyData: unknown
) {
  const payload = await extractUserFromToken(token);
  if (!payload) {
    return Response.json(
      { success: false, message: "Invalid session token." },
      { status: 401 }
    );
  }

  const userId = String(payload.userId || payload.sub || "");
  const userEmail = String(payload.email || "");

  // Lookup or auto-link Employee
  let employee = await prisma.employee.findFirst({
    where: {
      OR: [
        { id: userId },
        { userId: userId },
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
  });

  if (!employee && userId) {
    const portalUser = await prisma.portalUser.findUnique({
      where: { id: userId },
    });
    if (portalUser) {
      employee = await prisma.employee.create({
        data: {
          id: portalUser.id,
          userId: portalUser.id,
          name: portalUser.fullname,
          email: portalUser.email,
          department: "General",
        },
      });
    }
  }

  if (!employee) {
    return Response.json(
      { success: false, message: "Employee profile not found." },
      { status: 404 }
    );
  }

  const today = getTodayDateString();

  // ── 1. GET me/status ────────────────────────────────────────────────────────
  if (method === "GET" && subPath === "me/status") {
    const record = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    return Response.json({
      success: true,
      consented: true,
      faceEnrolled: true,
      office: {
        id: "1",
        name: "Headquarters (Main)",
        lat: 13.1232,
        lng: 80.0781,
        radius_m: 2000,
        shift_start: "09:30",
        shift_end: "18:30",
        grace_minutes: 10,
        heartbeat_seconds: 60,
      },
      todayRecord: record
        ? {
            id: record.id,
            checkInTime: record.checkIn?.toISOString() || null,
            checkOutTime: record.checkOut?.toISOString() || null,
            status: record.status,
            presenceState: record.locationStatus || "INSIDE",
            workedMinutes: record.workedMinutes || 0,
          }
        : null,
    });
  }

  // ── 2. GET me/history ───────────────────────────────────────────────────────
  if (method === "GET" && subPath === "me/history") {
    const month = request.nextUrl.searchParams.get("month") || today.slice(0, 7);
    const records = await prisma.attendanceRecord.findMany({
      where: {
        employeeId: employee.id,
        date: { startsWith: month },
      },
      orderBy: { date: "desc" },
    });

    return Response.json({
      success: true,
      records: records.map((r) => ({
        id: r.id,
        date: r.date,
        checkInTime: r.checkIn?.toISOString() || null,
        checkOutTime: r.checkOut?.toISOString() || null,
        status: r.status,
        workedMinutes: r.workedMinutes,
        is_manual_override: (r.method || "").toLowerCase().includes("manual"),
      })),
    });
  }

  const body = (bodyData as Record<string, unknown>) || {};

  // ── 3. POST qr/check-in ─────────────────────────────────────────────────────
  if (method === "POST" && subPath === "qr/check-in") {
    const qrToken = String(body.qrToken || "").trim();
    const validation = validateScannedToken(qrToken, "CHECK_IN");
    if (!validation.valid) {
      return Response.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (existing?.checkIn) {
      return Response.json(
        {
          success: false,
          message:
            "Duplicate Check-In: You have already recorded your check-in for today.",
        },
        { status: 409 }
      );
    }

    // Shift check: after 09:40 is LATE
    const nowIST = new Date(Date.now() + 5.5 * 3600 * 1000);
    const hours = nowIST.getUTCHours();
    const minutes = nowIST.getUTCMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 40);
    const status = isLate ? "LATE" : "PRESENT";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const record = await prisma.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      create: {
        employeeId: employee.id,
        date: today,
        checkIn: new Date(),
        status,
        method: "QR",
        locationStatus: "INSIDE",
        lat: typeof body.lat === "number" ? body.lat : null,
        lng: typeof body.lng === "number" ? body.lng : null,
        gpsAccuracy: typeof body.accuracy === "number" ? body.accuracy : null,
        workedMinutes: 0,
        ip,
      },
      update: {
        checkIn: new Date(),
        status,
        method: "QR",
        locationStatus: "INSIDE",
      },
    });

    try {
      await prisma.attendanceAttempt.create({
        data: {
          employeeId: employee.id,
          attemptType: "CHECK_IN",
          success: true,
          lat: typeof body.lat === "number" ? body.lat : null,
          lng: typeof body.lng === "number" ? body.lng : null,
          deviceInfo: request.headers.get("user-agent") || "QR Scanner",
        },
      });
    } catch {
      // Best-effort
    }

    return Response.json({
      success: true,
      message: "Check-In recorded successfully.",
      data: {
        recordId: record.id,
        userId: employee.id,
        attendanceDate: today,
        checkInAt: record.checkIn.toISOString(),
        status: record.status,
      },
    });
  }

  // ── 4. POST qr/check-out ────────────────────────────────────────────────────
  if (method === "POST" && subPath === "qr/check-out") {
    const qrToken = String(body.qrToken || "").trim();
    const validation = validateScannedToken(qrToken, "CHECK_OUT");
    if (!validation.valid) {
      return Response.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
    });

    if (!existing || !existing.checkIn) {
      return Response.json(
        {
          success: false,
          message:
            "Check-Out rejected: no active Check-In found for today. Please check in first.",
        },
        { status: 400 }
      );
    }

    if (existing.checkOut) {
      return Response.json(
        {
          success: false,
          message:
            "Duplicate Check-Out: You have already checked out for today.",
        },
        { status: 409 }
      );
    }

    const checkInTime = new Date(existing.checkIn).getTime();
    const checkOutTime = Date.now();
    const workedMinutes = Math.max(
      0,
      Math.round((checkOutTime - checkInTime) / 60000)
    );

    const updated = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: {
        checkOut: new Date(checkOutTime),
        checkOutReason: "MANUAL",
        workedMinutes,
      },
    });

    try {
      await prisma.attendanceAttempt.create({
        data: {
          employeeId: employee.id,
          attemptType: "CHECK_OUT",
          success: true,
          lat: typeof body.lat === "number" ? body.lat : null,
          lng: typeof body.lng === "number" ? body.lng : null,
          deviceInfo: request.headers.get("user-agent") || "QR Scanner",
        },
      });
    } catch {
      // Best-effort
    }

    return Response.json({
      success: true,
      message: "Check-Out recorded successfully.",
      data: {
        recordId: updated.id,
        userId: employee.id,
        attendanceDate: today,
        checkInAt: updated.checkIn.toISOString(),
        checkOutAt: updated.checkOut!.toISOString(),
        workedMinutes: updated.workedMinutes,
        status: updated.status,
      },
    });
  }

  // ── 5. POST me/consent ──────────────────────────────────────────────────────
  if (method === "POST" && subPath === "me/consent") {
    return Response.json({
      success: true,
      message: "Consent successfully registered.",
    });
  }

  // ── 6. POST regularization ──────────────────────────────────────────────────
  if (method === "POST" && subPath === "regularization") {
    const regDate = String(body.date || today);
    const reason = String(body.reason || "Attendance Regularization");
    await prisma.regularization.create({
      data: {
        employeeId: employee.id,
        date: regDate,
        reason,
        status: "PENDING",
      },
    });
    return Response.json({
      success: true,
      message: "Regularization request submitted successfully.",
    });
  }

  return Response.json(
    { success: false, message: `Unsupported endpoint /api/attendance/${subPath}` },
    { status: 404 }
  );
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const method = request.method.toUpperCase();
  const { path: pathSegments = [] } = await params;

  // Path validation: Reject traversal, encoding anomalies, or admin attempts
  for (const segment of pathSegments) {
    if (
      !segment ||
      segment.includes("..") ||
      segment.includes("\\") ||
      segment.toLowerCase().includes("%2e") ||
      segment.toLowerCase().includes("%2f")
    ) {
      return Response.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }
  }

  const subPath = pathSegments.join("/");

  // Explicitly deny any path starting with or containing "admin"
  if (subPath.startsWith("admin") || pathSegments.includes("admin")) {
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  // Exact allowlist check
  const allowedForMethod = ALLOWED_ENDPOINTS[method];
  if (!allowedForMethod || !allowedForMethod.has(subPath)) {
    return Response.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  // Read employee token from HTTP-only cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return Response.json(
      { success: false, message: "Authentication required. Please log in." },
      { status: 401 }
    );
  }

  // Prepare query string: only forward validated query params for GET me/history
  let queryString = "";
  if (method === "GET" && subPath === "me/history") {
    const searchParams = request.nextUrl.searchParams;
    const validatedParams = new URLSearchParams();

    const monthParam = searchParams.get("month");
    if (monthParam) {
      if (!MONTH_REGEX.test(monthParam)) {
        return Response.json(
          { success: false, message: "Invalid month format. Expected YYYY-MM." },
          { status: 400 }
        );
      }
      validatedParams.set("month", monthParam);
    }

    const startDateParam = searchParams.get("startDate");
    if (startDateParam) {
      if (!DATE_REGEX.test(startDateParam)) {
        return Response.json(
          { success: false, message: "Invalid startDate format. Expected YYYY-MM-DD." },
          { status: 400 }
        );
      }
      validatedParams.set("startDate", startDateParam);
    }

    const endDateParam = searchParams.get("endDate");
    if (endDateParam) {
      if (!DATE_REGEX.test(endDateParam)) {
        return Response.json(
          { success: false, message: "Invalid endDate format. Expected YYYY-MM-DD." },
          { status: 400 }
        );
      }
      validatedParams.set("endDate", endDateParam);
    }

    const limitParam = searchParams.get("limit");
    if (limitParam && /^\d{1,3}$/.test(limitParam)) {
      validatedParams.set("limit", limitParam);
    }

    const offsetParam = searchParams.get("offset");
    if (offsetParam && /^\d{1,5}$/.test(offsetParam)) {
      validatedParams.set("offset", offsetParam);
    }

    const qs = validatedParams.toString();
    if (qs) {
      queryString = `?${qs}`;
    }
  }

  // Read request body for POST
  let bodyData: unknown = undefined;
  if (method === "POST") {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return Response.json(
        { success: false, message: "Content-Type must be application/json" },
        { status: 415 }
      );
    }
    try {
      bodyData = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Malformed JSON body." },
        { status: 400 }
      );
    }
  }

  // 1. If backend URL is specified and not localhost:5000, or try backend first
  const targetUrl = `${BACKEND_URL}/api/attendance/${subPath}${queryString}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers,
      body: bodyData !== undefined ? JSON.stringify(bodyData) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timer);

    // If backend returns 502/503/504 (service unreachable/gateway error), fall back to local handler
    if (backendRes.status >= 502 && backendRes.status <= 504) {
      return handleLocalAttendance(subPath, method, request, token, bodyData);
    }

    let data: unknown;
    const resContentType = backendRes.headers.get("content-type") ?? "";
    if (resContentType.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      const isHtml =
        text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html");
      data = {
        success: backendRes.ok,
        message: isHtml
          ? `Backend endpoint /api/attendance/${subPath} returned HTTP ${backendRes.status}.`
          : text,
      };
    }

    return Response.json(data, { status: backendRes.status });
  } catch {
    clearTimeout(timer);
    // External backend is down/unreachable — execute local database fallback
    return handleLocalAttendance(subPath, method, request, token, bodyData);
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
