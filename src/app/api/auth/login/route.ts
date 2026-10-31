import { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";

const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || "admin@gmail.com";
const DEV_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD || "AdminPassword123!";
const DEV_TOKEN = process.env.ADMIN_DEV_TOKEN || process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || "dev-secret-change-me";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { email = "", password = "" } = body;

  // 1. Try external backend
  try {
    const result = await backendFetch("/api/auth/login", {
      method: "POST",
      body,
    });
    if (result.ok) {
      return Response.json(result.data, { status: result.status });
    }
  } catch {
    // Fall back to local
  }

  // 2. Local fallback
  if (
    email.toLowerCase().trim() === DEV_EMAIL.toLowerCase().trim() &&
    password === DEV_PASSWORD
  ) {
    return Response.json({
      token: DEV_TOKEN,
      admin: {
        id: "dev-admin",
        email: DEV_EMAIL,
        name: "Dev Admin",
        role: "admin",
      },
    });
  }

  return Response.json(
    { message: "Invalid credentials. Please try again." },
    { status: 401 }
  );
}

