import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.max(1, Number(searchParams.get("limit") || 20));

  // 1. Try external backend
  try {
    const query = searchParams.toString();
    const result = await backendFetch(`/api/attendance/admin/audit-logs?${query}`, {
      method: "GET",
      authorization,
    });
    if (result.ok) {
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Local fallback
  try {
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedLogs = logs.map((l, idx) => {
      let afterJson: Record<string, unknown> | null = null;
      if (l.details) {
        try {
          afterJson = JSON.parse(l.details);
        } catch {
          afterJson = { note: l.details, reason: l.details };
        }
      }

      return {
        id: (page - 1) * limit + idx + 1,
        actor_name: l.performedBy || "Admin",
        actor_email: "admin@techbigsolutions.in",
        action: l.action,
        entity_type: l.target.split(",")[0]?.split(":")[0] || "attendance",
        entity_id: l.target.split(",")[0]?.split(":")[1] || l.target,
        before_json: null,
        after_json: afterJson,
        created_at: l.createdAt.toISOString(),
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return Response.json({
      success: true,
      data: {
        total,
        page,
        limit,
        totalPages,
        logs: formattedLogs,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load audit logs.";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}

