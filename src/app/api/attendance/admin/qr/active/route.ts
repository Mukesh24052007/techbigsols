import { NextRequest } from "next/server";
import { getActiveQrSession } from "@/lib/attendance/qr-sessions";
import { backendFetch } from "@/lib/api/backend";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const action = (searchParams.get("action") || "CHECK_IN") as "CHECK_IN" | "CHECK_OUT";
  const officeId = Number(searchParams.get("officeId") || 1);

  // 1. Try backend if configured and available
  try {
    const result = await backendFetch(`/api/attendance/admin/qr/active?action=${action}&officeId=${officeId}`, {
      method: "GET",
      authorization,
    });
    if (result.ok) {
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Fallback to local QR session store
  const { active, data } = getActiveQrSession(action, officeId);
  if (!active || !data) {
    return Response.json({
      success: true,
      data: { active: false },
    });
  }

  return Response.json({
    success: true,
    data: {
      active: true,
      sessionId: data.sessionId,
      qrToken: data.qrToken,
      action: data.action,
      attendanceDate: data.attendanceDate,
      officeId: data.officeId,
      expiresAt: data.expiresAt,
      secondsRemaining: data.secondsRemaining,
      generationSeq: data.generationSeq,
    },
  });
}

