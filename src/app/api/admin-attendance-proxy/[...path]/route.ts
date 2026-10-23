/**
 * /api/admin-attendance-proxy/[...path]
 *
 * 🔒 Admin JWT. Proxies admin attendance requests to the Express backend.
 *
 * Verifies the admin token locally first (supporting dev token and JWT),
 * then attempts to proxy to the Express backend.
 * If the backend is unreachable or rejects authentication (401/403),
 * it seamlessly falls back to the local Prisma database.
 */

import type { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/api/backend";
import { verifyAdminToken } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";

const TIMEOUT_MS = 15_000;

function isAllowedPath(method: string, subPath: string): boolean {
  if (method === "GET" && subPath === "employees") return true;
  if (method === "GET" && /^employees\/[^/]+\/photo$/.test(subPath)) return true;
  if (method === "POST" && /^employees\/[^/]+\/face$/.test(subPath)) return true;
  if (method === "POST" && /^employees\/[^/]+\/photo$/.test(subPath)) return true;
  if (method === "DELETE" && /^employees\/[^/]+\/face$/.test(subPath)) return true;
  if (method === "GET" && subPath === "offices") return true;
  if (method === "POST" && subPath === "offices") return true;
  if (method === "PUT" && /^offices\/[^/]+$/.test(subPath)) return true;
  if (method === "DELETE" && /^offices\/[^/]+$/.test(subPath)) return true;

  return false;
}

function shouldFallback(status: number): boolean {
  return status === 401 || status === 403 || status === 404 || (status >= 500 && status <= 504);
}

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const method = request.method.toUpperCase();
  const { path: pathSegments = [] } = await params;

  // Path validation: reject traversal
  for (const segment of pathSegments) {
    if (
      !segment ||
      segment.includes("..") ||
      segment.includes("\\") ||
      segment.toLowerCase().includes("%2e") ||
      segment.toLowerCase().includes("%2f")
    ) {
      return Response.json({ success: false, message: "Not found" }, { status: 404 });
    }
  }

  const subPath = pathSegments.join("/");

  if (!isAllowedPath(method, subPath)) {
    return Response.json({ success: false, message: "Not found" }, { status: 404 });
  }

  // Verify admin token locally
  const authorization = request.headers.get("authorization");
  const auth = await verifyAdminToken(authorization);
  if (!auth.ok) {
    return auth.response;
  }

  // Read request body for POST/PUT
  let bodyData: unknown = undefined;
  if (method === "POST" || method === "PUT") {
    try {
      bodyData = await request.json();
    } catch {
      return Response.json({ success: false, message: "Malformed JSON body." }, { status: 400 });
    }
  }

  const targetUrl = `${BACKEND_URL}/api/attendance/admin/${subPath}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authorization) headers["Authorization"] = authorization;

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

    // For photo GET (binary), pass through directly if ok
    if (method === "GET" && subPath.endsWith("/photo") && backendRes.ok) {
      const blob = await backendRes.blob();
      return new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": backendRes.headers.get("content-type") || "image/jpeg",
          "Cache-Control": "no-cache",
        },
      });
    }

    if (!backendRes.ok && shouldFallback(backendRes.status)) {
      return await handleLocalFallback(method, subPath, bodyData);
    }

    const ct = backendRes.headers.get("content-type") ?? "";
    let data: unknown;
    if (ct.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      const isHtml = text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html");
      data = {
        success: backendRes.ok,
        message: isHtml ? `Backend returned HTTP ${backendRes.status}.` : text,
      };
    }

    return Response.json(data, { status: backendRes.status });
  } catch {
    clearTimeout(timer);
    return await handleLocalFallback(method, subPath, bodyData);
  }
}

/** Route requests to local Prisma fallback */
async function handleLocalFallback(method: string, subPath: string, bodyData: unknown) {
  // GET employees
  if (method === "GET" && subPath === "employees") {
    return await getEmployeesFromLocalDB();
  }

  // GET employees/:userId/photo
  const photoMatch = subPath.match(/^employees\/([^/]+)\/photo$/);
  if (method === "GET" && photoMatch) {
    return await getEmployeePhotoFromLocalDB(photoMatch[1]);
  }

  // POST employees/:userId/photo
  if (method === "POST" && photoMatch) {
    return await enrolEmployeePhotoLocalDB(photoMatch[1], bodyData as {
      photo?: string;
      descriptors?: number[][];
      consentAttested?: boolean;
    });
  }

  // POST employees/:userId/face
  const faceMatch = subPath.match(/^employees\/([^/]+)\/face$/);
  if (method === "POST" && faceMatch) {
    return await enrolEmployeeFaceLocalDB(faceMatch[1], bodyData as { descriptors?: number[][] });
  }

  // DELETE employees/:userId/face
  if (method === "DELETE" && faceMatch) {
    return await deleteEmployeeFaceLocalDB(faceMatch[1]);
  }

  // GET offices
  if (method === "GET" && subPath === "offices") {
    return await getOfficesFromLocalDB();
  }

  // POST offices
  if (method === "POST" && subPath === "offices") {
    return await createOfficeLocalDB(bodyData as Record<string, unknown>);
  }

  // PUT offices/:id
  const officeMatch = subPath.match(/^offices\/([^/]+)$/);
  if (method === "PUT" && officeMatch) {
    return await updateOfficeLocalDB(officeMatch[1], bodyData as Record<string, unknown>);
  }

  // DELETE offices/:id
  if (method === "DELETE" && officeMatch) {
    return await deleteOfficeLocalDB(officeMatch[1]);
  }

  return Response.json({ success: false, message: "Service unavailable." }, { status: 502 });
}

/** Fallback: list employees from local Prisma DB */
async function getEmployeesFromLocalDB() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        faceTemplates: { select: { id: true, version: true, createdAt: true } },
        portalUser: { select: { id: true, fullname: true, email: true } },
        consents: { where: { consentType: "FACE_ENROLMENT" } },
      },
      orderBy: { name: "asc" },
    });

    const formatted = employees.map((e) => ({
      userId: e.userId || e.id,
      fullname: e.portalUser?.fullname || e.name,
      email: e.portalUser?.email || e.email,
      department: e.department,
      designation: e.designation,
      faceEnrolled: e.faceTemplates.length > 0,
      hasPhoto: Boolean(e.avatar),
      enrolSource: e.faceTemplates.length > 0 ? "LIVE" : null,
      consentGiven: e.consents.length > 0,
      consentAt: e.consents[0]?.consentedAt?.toISOString() || null,
      faceEnrolledAt: e.faceTemplates[0]?.createdAt?.toISOString() || null,
    }));

    return Response.json({ success: true, data: { employees: formatted } });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB employees error:", err);
    return Response.json({ success: false, message: "Failed to fetch employees." }, { status: 500 });
  }
}

/** Fallback: get employee photo from local Prisma DB */
async function getEmployeePhotoFromLocalDB(userId: string) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
    });

    if (!employee || !employee.avatar) {
      return Response.json({ success: false, message: "Photo not found." }, { status: 404 });
    }

    let base64Data = employee.avatar;
    let contentType = "image/jpeg";
    if (base64Data.startsWith("data:")) {
      const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contentType = match[1];
        base64Data = match[2];
      }
    }

    const buffer = Buffer.from(base64Data, "base64");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB photo error:", err);
    return Response.json({ success: false, message: "Failed to load photo." }, { status: 500 });
  }
}

/** Fallback: enrol photo and face descriptors locally */
async function enrolEmployeePhotoLocalDB(
  userId: string,
  body: { photo?: string; descriptors?: number[][]; consentAttested?: boolean }
) {
  try {
    let employee = await prisma.employee.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
    });

    if (!employee) {
      const portalUser = await prisma.portalUser.findUnique({ where: { id: userId } });
      if (portalUser) {
        employee = await prisma.employee.create({
          data: {
            id: userId,
            userId: userId,
            name: portalUser.fullname,
            email: portalUser.email,
            department: "General",
          },
        });
      }
    }

    if (!employee) {
      return Response.json({ success: false, message: "Employee not found." }, { status: 404 });
    }

    if (body.photo) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { avatar: body.photo },
      });
    }

    if (body.descriptors && body.descriptors.length > 0) {
      await prisma.faceTemplate.deleteMany({ where: { employeeId: employee.id } });
      await prisma.faceTemplate.create({
        data: {
          employeeId: employee.id,
          encryptedEmbedding: JSON.stringify(body.descriptors[0]),
          version: 1,
        },
      });
    }

    if (body.consentAttested) {
      await prisma.consentRecord.upsert({
        where: { employeeId_consentType: { employeeId: employee.id, consentType: "FACE_ENROLMENT" } },
        update: { consentedAt: new Date() },
        create: {
          id: `consent-${employee.id}-face`,
          employeeId: employee.id,
          consentType: "FACE_ENROLMENT",
          consentedAt: new Date(),
        },
      });
    }

    return Response.json({
      success: true,
      message: "Photo and face template enrolled successfully.",
      data: {
        userId,
        enrolledAt: new Date().toISOString(),
        enrolSource: "PHOTO",
        hasPhoto: true,
        templateUpdated: true,
      },
    });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB enrol photo error:", err);
    return Response.json({ success: false, message: "Failed to save photo." }, { status: 500 });
  }
}

/** Fallback: enrol live face descriptor */
async function enrolEmployeeFaceLocalDB(userId: string, body: { descriptors?: number[][] }) {
  try {
    let employee = await prisma.employee.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
    });

    if (!employee) {
      const portalUser = await prisma.portalUser.findUnique({ where: { id: userId } });
      if (portalUser) {
        employee = await prisma.employee.create({
          data: {
            id: userId,
            userId: userId,
            name: portalUser.fullname,
            email: portalUser.email,
            department: "General",
          },
        });
      }
    }

    if (!employee) {
      return Response.json({ success: false, message: "Employee not found." }, { status: 404 });
    }

    if (!body.descriptors || body.descriptors.length === 0) {
      return Response.json({ success: false, message: "Descriptors required." }, { status: 400 });
    }

    await prisma.faceTemplate.deleteMany({ where: { employeeId: employee.id } });
    await prisma.faceTemplate.create({
      data: {
        employeeId: employee.id,
        encryptedEmbedding: JSON.stringify(body.descriptors[0]),
        version: 1,
      },
    });

    return Response.json({ success: true, message: "Face enrolled successfully!" });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB enrol face error:", err);
    return Response.json({ success: false, message: "Failed to save face enrolment." }, { status: 500 });
  }
}

/** Fallback: delete face template */
async function deleteEmployeeFaceLocalDB(userId: string) {
  try {
    const employee = await prisma.employee.findFirst({
      where: { OR: [{ userId }, { id: userId }] },
    });

    if (employee) {
      await prisma.faceTemplate.deleteMany({ where: { employeeId: employee.id } });
      await prisma.employee.update({
        where: { id: employee.id },
        data: { avatar: null },
      });
    }

    return Response.json({ success: true, message: "Face enrolment removed." });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB delete face error:", err);
    return Response.json({ success: false, message: "Failed to remove face." }, { status: 500 });
  }
}

/** Fallback: list offices from local Prisma DB */
async function getOfficesFromLocalDB() {
  try {
    const offices = await prisma.officeLocation.findMany({
      orderBy: { createdAt: "asc" },
    });

    const formatted = offices.map((o) => ({
      id: o.id,
      name: o.name,
      lat: o.lat,
      lng: o.lng,
      radius_m: o.radiusMeters,
      shift_start: o.shiftStart,
      shift_end: o.shiftEnd,
      grace_minutes: o.graceMinutes,
      heartbeat_seconds: o.heartbeatIntervalSeconds,
      outside_tolerance_minutes: o.leftPremisesToleranceMinutes,
    }));

    return Response.json({ success: true, data: { offices: formatted } });
  } catch (err) {
    console.error("[admin-attendance-proxy] local DB offices error:", err);
    return Response.json({ success: false, message: "Failed to fetch offices." }, { status: 500 });
  }
}

/** Fallback: create office in local Prisma DB */
async function createOfficeLocalDB(body: Record<string, unknown>) {
  try {
    const office = await prisma.officeLocation.create({
      data: {
        name: String(body.name ?? "Office"),
        lat: Number(body.lat ?? 0),
        lng: Number(body.lng ?? 0),
        radiusMeters: Number(body.radius_m ?? 150),
        shiftStart: String(body.shift_start ?? "09:30"),
        shiftEnd: String(body.shift_end ?? "18:30"),
        graceMinutes: Number(body.grace_minutes ?? 10),
        heartbeatIntervalSeconds: Number(body.heartbeat_seconds ?? 60),
        leftPremisesToleranceMinutes: Number(body.outside_tolerance_minutes ?? 10),
      },
    });

    return Response.json({
      success: true,
      message: "Office created successfully.",
      data: {
        office: {
          id: office.id,
          name: office.name,
          lat: office.lat,
          lng: office.lng,
          radius_m: office.radiusMeters,
          shift_start: office.shiftStart,
          shift_end: office.shiftEnd,
          grace_minutes: office.graceMinutes,
          heartbeat_seconds: office.heartbeatIntervalSeconds,
          outside_tolerance_minutes: office.leftPremisesToleranceMinutes,
        },
      },
    });
  } catch (err) {
    console.error("[admin-attendance-proxy] create office error:", err);
    return Response.json({ success: false, message: "Failed to create office." }, { status: 500 });
  }
}

/** Fallback: update office in local Prisma DB */
async function updateOfficeLocalDB(id: string, body: Record<string, unknown>) {
  try {
    const office = await prisma.officeLocation.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name) } : {}),
        ...(body.lat !== undefined ? { lat: Number(body.lat) } : {}),
        ...(body.lng !== undefined ? { lng: Number(body.lng) } : {}),
        ...(body.radius_m !== undefined ? { radiusMeters: Number(body.radius_m) } : {}),
        ...(body.shift_start !== undefined ? { shiftStart: String(body.shift_start) } : {}),
        ...(body.shift_end !== undefined ? { shiftEnd: String(body.shift_end) } : {}),
        ...(body.grace_minutes !== undefined ? { graceMinutes: Number(body.grace_minutes) } : {}),
        ...(body.heartbeat_seconds !== undefined ? { heartbeatIntervalSeconds: Number(body.heartbeat_seconds) } : {}),
        ...(body.outside_tolerance_minutes !== undefined ? { leftPremisesToleranceMinutes: Number(body.outside_tolerance_minutes) } : {}),
      },
    });

    return Response.json({
      success: true,
      message: "Office updated successfully.",
      data: {
        office: {
          id: office.id,
          name: office.name,
          lat: office.lat,
          lng: office.lng,
          radius_m: office.radiusMeters,
          shift_start: office.shiftStart,
          shift_end: office.shiftEnd,
          grace_minutes: office.graceMinutes,
          heartbeat_seconds: office.heartbeatIntervalSeconds,
          outside_tolerance_minutes: office.leftPremisesToleranceMinutes,
        },
      },
    });
  } catch (err) {
    console.error("[admin-attendance-proxy] update office error:", err);
    return Response.json({ success: false, message: "Failed to update office." }, { status: 500 });
  }
}

/** Fallback: delete office in local Prisma DB */
async function deleteOfficeLocalDB(id: string) {
  try {
    await prisma.officeLocation.delete({ where: { id } });
    return Response.json({ success: true, message: "Office deleted successfully." });
  } catch (err) {
    console.error("[admin-attendance-proxy] delete office error:", err);
    return Response.json({ success: false, message: "Failed to delete office." }, { status: 500 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
