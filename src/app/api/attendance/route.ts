import { NextRequest, NextResponse } from "next/server";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { attendanceBus } from "@/lib/attendance-bus";

export const dynamic = "force-dynamic";

// WebAuthn Relying Party Settings
const rpName = process.env.WEBAUTHN_RP_NAME || "TechBigSolutions Attendance";
const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
const expectedOrigin = process.env.WEBAUTHN_ORIGIN || "http://localhost:3000";

// Office Location & Geofence
const OFFICE_LAT = parseFloat(process.env.OFFICE_LAT || "12.9716");
const OFFICE_LNG = parseFloat(process.env.OFFICE_LNG || "77.5946");
const OFFICE_RADIUS_METERS = parseFloat(process.env.OFFICE_RADIUS_METERS || "1000");

// In-memory challenge store (shared across requests in module scope)
const globalStore = globalThis as unknown as {
  __webauthn_challenges__?: Map<string, { challenge: string; employeeId: string; expiresAt: number }>;
};
if (!globalStore.__webauthn_challenges__) {
  globalStore.__webauthn_challenges__ = new Map();
}
const challengeStore = globalStore.__webauthn_challenges__;

function cleanExpiredChallenges() {
  const now = Date.now();
  for (const [key, value] of challengeStore.entries()) {
    if (value.expiresAt < now) challengeStore.delete(key);
  }
}

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getKolkataDateString(d: Date = new Date()): string {
  // Asia/Kolkata is UTC + 5:30
  const kolkataMs = d.getTime() + 5.5 * 3600 * 1000;
  return new Date(kolkataMs).toISOString().slice(0, 10);
}

function determineStatus(d: Date = new Date()): "PRESENT" | "LATE" {
  const kolkataTimeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  const [hours, mins] = kolkataTimeStr.split(":").map(Number);
  const currentTotal = hours * 60 + mins;
  const cutoffMinutes = 9 * 60 + 40; // 09:30 + 10 min grace = 09:40

  return currentTotal > cutoffMinutes ? "LATE" : "PRESENT";
}

// ── GET /api/attendance?action=enrol-options|auth-options&employeeId=...
export async function GET(req: NextRequest) {
  cleanExpiredChallenges();
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  let employeeId = searchParams.get("employeeId");

  // If not provided in query, infer from session
  const session = await getSessionUser(req);
  if (!employeeId && session) {
    const emp = await prisma.employee.findFirst({
      where: { OR: [{ id: session.id }, { userId: session.id }, { email: session.email }] },
    });
    if (emp) employeeId = emp.id;
  }

  // 1. Generate WebAuthn Registration Options
  if (action === "enrol-options") {
    if (!employeeId) {
      return NextResponse.json({ error: "employeeId required for enrolment" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { credentials: true },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(employee.id),
      userName: employee.email,
      userDisplayName: employee.name,
      attestationType: "none",
      excludeCredentials: employee.credentials.map((cred) => ({
        id: cred.id,
        transports: cred.transports ? JSON.parse(cred.transports) : ["internal"],
      })),
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
    });

    challengeStore.set(options.challenge, {
      challenge: options.challenge,
      employeeId: employee.id,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json(options);
  }

  // 2. Generate WebAuthn Authentication Options
  if (action === "auth-options") {
    let credentials: { id: string; transports: string | null }[] = [];
    if (employeeId) {
      credentials = await prisma.biometricCredential.findMany({
        where: { employeeId },
        select: { id: true, transports: true },
      });
    } else {
      credentials = await prisma.biometricCredential.findMany({
        select: { id: true, transports: true },
      });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: credentials.map((c) => ({
        id: c.id,
        type: "public-key" as const,
        transports: c.transports ? JSON.parse(c.transports) : ["internal"],
      })),
    });

    challengeStore.set(options.challenge, {
      challenge: options.challenge,
      employeeId: employeeId || "",
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json(options);
  }

  // List all employees for quick enrolment selection
  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, department: true, email: true },
  });

  return NextResponse.json({ employees });
}

// ── POST /api/attendance (Enrol Verify, Auth Verify, Direct Biometric Check-in)
export async function POST(req: NextRequest) {
  cleanExpiredChallenges();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "check-in");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // ── 1. Enrol Device (Verify Registration) ──────────────────────────────────
  if (action === "enrol-verify") {
    const registrationResponse = body.response as RegistrationResponseJSON;
    const challenge = String(body.challenge || "");

    const challengeData = challengeStore.get(challenge);
    if (!challengeData) {
      return NextResponse.json({ error: "Registration session expired. Please try again." }, { status: 400 });
    }
    challengeStore.delete(challenge);

    try {
      const verification = await verifyRegistrationResponse({
        response: registrationResponse,
        expectedChallenge: challengeData.challenge,
        expectedOrigin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return NextResponse.json({ error: "Verification failed." }, { status: 400 });
      }

      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      const employeeId = challengeData.employeeId;
      const publicKeyBase64 = Buffer.from(credential.publicKey).toString("base64url");

      await prisma.biometricCredential.create({
        data: {
          id: credential.id,
          employeeId,
          publicKey: publicKeyBase64,
          counter: BigInt(credential.counter),
          deviceType: credentialDeviceType,
          backedUp: credentialBackedUp,
          transports: JSON.stringify(registrationResponse.response.transports || ["internal"]),
        },
      });

      const emp = await prisma.employee.findUnique({ where: { id: employeeId } });

      return NextResponse.json({
        success: true,
        message: `Device successfully enrolled for ${emp?.name || "Employee"}!`,
        credentialId: credential.id,
        employee: emp,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Enrolment error";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // ── 2. Authenticate Device & Check-in (WebAuthn) ───────────────────────────
  if (action === "auth-verify") {
    const authResponse = body.response as AuthenticationResponseJSON;
    const challenge = String(body.challenge || "");

    const challengeData = challengeStore.get(challenge);
    if (!challengeData) {
      return NextResponse.json({ error: "Authentication challenge expired. Please retry." }, { status: 400 });
    }
    challengeStore.delete(challenge);

    const credential = await prisma.biometricCredential.findUnique({
      where: { id: authResponse.id },
      include: { employee: true },
    });

    if (!credential) {
      return NextResponse.json({
        error: "Unenrolled device. Please enrol this device first with 'First time? Enrol this device'.",
      }, { status: 400 });
    }

    try {
      const verification = await verifyAuthenticationResponse({
        response: authResponse,
        expectedChallenge: challengeData.challenge,
        expectedOrigin,
        expectedRPID: rpID,
        credential: {
          id: credential.id,
          publicKey: Buffer.from(credential.publicKey, "base64url"),
          counter: Number(credential.counter),
          transports: credential.transports ? JSON.parse(credential.transports) : ["internal"],
        },
        requireUserVerification: true,
      });

      if (!verification.verified) {
        return NextResponse.json({ error: "Biometric verification failed." }, { status: 400 });
      }

      // Update counter
      await prisma.biometricCredential.update({
        where: { id: credential.id },
        data: { counter: BigInt(verification.authenticationInfo.newCounter) },
      });

      // Proceed with attendance recording for credential.employeeId
      return recordEmployeeCheckIn({
        employee: credential.employee,
        credentialId: credential.id,
        method: "Biometric (WebAuthn)",
        lat: typeof body.lat === "number" ? body.lat : undefined,
        lng: typeof body.lng === "number" ? body.lng : undefined,
        ip,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Biometric authentication failed.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
  }

  // ── 3. Direct Biometric Check-in (Simulated or fallback with Face / Fingerprint) ───
  const employeeId = String(body.employeeId || "");
  const method = String(body.method || "Face");
  const lat = typeof body.lat === "number" ? body.lat : undefined;
  const lng = typeof body.lng === "number" ? body.lng : undefined;

  let employee = null;
  if (employeeId) {
    employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  } else {
    // Check logged-in session user
    const session = await getSessionUser(req);
    if (session) {
      employee = await prisma.employee.findFirst({
        where: { OR: [{ id: session.id }, { userId: session.id }, { email: session.email }] },
      });
    }
  }

  if (!employee) {
    // Fallback: select first employee or return error
    employee = await prisma.employee.findFirst({ orderBy: { name: "asc" } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found." }, { status: 404 });
    }
  }

  return recordEmployeeCheckIn({
    employee,
    credentialId: "biometric-template-01",
    method,
    lat,
    lng,
    ip,
  });
}

// ── Shared Helper to Enforce Attendance Business Rules ──────────────────────
async function recordEmployeeCheckIn({
  employee,
  credentialId,
  method,
  lat,
  lng,
  ip,
}: {
  employee: { id: string; name: string; department: string; email: string };
  credentialId?: string;
  method: string;
  lat?: number;
  lng?: number;
  ip: string;
}) {
  const now = new Date();
  const todayIST = getKolkataDateString(now);

  // 1. One check-in per employee per day
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: todayIST } },
  });

  if (existing) {
    const timeFormatted = existing.checkIn.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
    return NextResponse.json({
      error: `Attendance already marked today for ${employee.name} at ${timeFormatted}. Multiple check-ins on the same day are not allowed.`,
    }, { status: 400 });
  }

  // 2. Office Geofence verification
  let distanceMeters = 0;
  if (lat !== undefined && lng !== undefined) {
    distanceMeters = getDistanceMeters(lat, lng, OFFICE_LAT, OFFICE_LNG);
    if (distanceMeters > OFFICE_RADIUS_METERS) {
      return NextResponse.json({
        error: `Check-in rejected: Outside office geofence (${Math.round(distanceMeters)}m away, maximum allowed radius is ${OFFICE_RADIUS_METERS}m).`,
      }, { status: 403 });
    }
  } else {
    // Default inside office location for dev / testing
    distanceMeters = 15;
  }

  // 3. Late calculation (after 09:30 + 10 min grace)
  const status = determineStatus(now);

  // 4. Record attendance
  const record = await prisma.attendanceRecord.create({
    data: {
      employeeId: employee.id,
      date: todayIST,
      checkIn: now,
      method,
      status,
      credentialId: credentialId || null,
      ip,
      lat: lat ?? OFFICE_LAT,
      lng: lng ?? OFFICE_LNG,
      distanceMeters,
    },
  });

  // 5. Broadcast to live SSE board
  attendanceBus.emit("checkin", {
    id: record.id,
    employeeId: employee.id,
    name: employee.name,
    department: employee.department,
    checkIn: record.checkIn.toISOString(),
    method: record.method,
    status,
  });

  const checkInFormatted = record.checkIn.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return NextResponse.json({
    success: true,
    message: `${employee.name} marked ${status === "LATE" ? "late" : "present"} at ${checkInFormatted}`,
    status,
    checkInTime: checkInFormatted,
    employee: {
      id: employee.id,
      name: employee.name,
      department: employee.department,
    },
    record,
  });
}
