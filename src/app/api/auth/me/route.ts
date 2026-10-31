import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || "admin@gmail.com";
const DEV_TOKEN = process.env.ADMIN_DEV_TOKEN || process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || "dev-secret-change-me";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");

  // 1. Try external backend
  try {
    const result = await backendFetch("/api/auth/me", {
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
  if (token && (token === DEV_TOKEN || token === "dev-secret-change-me")) {
    return Response.json({
      id: "dev-admin",
      email: DEV_EMAIL,
      name: "Dev Admin",
      role: "admin",
    });
  }

  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

