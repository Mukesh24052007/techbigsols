import { NextRequest } from "next/server";
import { generateQrSession, registerExternalQrSession } from "@/lib/attendance/qr-sessions";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  let body: {
    action?: "CHECK_IN" | "CHECK_OUT";
    officeId?: number;
    validityMinutes?: number;
    allowRotation?: boolean;
    rotationReason?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action || "CHECK_IN";
  const officeId = Number(body.officeId || 1);
  const validityMinutes = Number(body.validityMinutes || 15);
  const allowRotation = Boolean(body.allowRotation);
  const rotationReason = body.rotationReason ? String(body.rotationReason).trim() : undefined;

  // 1. Try external backend
  try {
    const result = await backendFetch("/api/attendance/admin/qr/generate", {
      method: "POST",
      authorization,
      body,
    });
    if (result.ok) {
      try {
        const payload = result.data as Record<string, unknown>;
        const data = (payload.data ?? payload) as Record<string, unknown>;
        if (typeof data.qrToken === "string") {
          registerExternalQrSession({
            sessionId: typeof data.sessionId === "number" ? data.sessionId : undefined,
            qrToken: data.qrToken,
            action: (data.action as "CHECK_IN" | "CHECK_OUT") || action,
            officeId: typeof data.officeId === "number" ? data.officeId : officeId,
            expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : undefined,
            validityMinutes,
            generationSeq: typeof data.generationSeq === "number" ? data.generationSeq : undefined,
          });
        }
      } catch {
        // Best effort
      }
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Local generation
  const res = generateQrSession({
    action,
    officeId,
    validityMinutes,
    allowRotation,
    rotationReason,
  });

  if (!res.success || !res.session) {
    return Response.json(
      {
        success: false,
        message: res.error || "Failed to generate QR session.",
        code: res.code,
      },
      { status: res.code === "SINGLE_GEN_LIMIT" ? 409 : 400 }
    );
  }

  const s = res.session;

  // Record audit log if rotation
  if (allowRotation && rotationReason) {
    try {
      await prisma.auditLog.create({
        data: {
          action: "QR_SESSION_ROTATED",
          target: `office:${officeId}, action:${action}`,
          details: JSON.stringify({
            reason: rotationReason,
            sessionId: s.sessionId,
            seq: s.generationSeq,
          }),
          performedBy: "Admin",
          ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
        },
      });
    } catch {
      // Best-effort
    }
  }

  return Response.json({
    success: true,
    message: allowRotation
      ? "QR session successfully rotated with recorded justification."
      : "QR Code session generated successfully.",
    data: {
      sessionId: s.sessionId,
      qrToken: s.qrToken,
      action: s.action,
      attendanceDate: s.attendanceDate,
      officeId: s.officeId,
      expiresAt: s.expiresAt,
      secondsRemaining: s.secondsRemaining,
      generationSeq: s.generationSeq,
      rotated: allowRotation,
    },
  });
}
