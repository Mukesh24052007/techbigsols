/**
 * POST /api/attendance/self-enrol
 *
 * Allows an employee to enroll face biometric descriptors (or self-enrol for demo testing).
 * Obtains an admin token to call POST /api/attendance/admin/employees/:userId/face on Express backend.
 */

import type { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/api/backend";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tbs_user_token";
const RAW_USER_SECRET =
  process.env.USER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "change_this_to_a_long_random_secret";
const USER_SECRET = new TextEncoder().encode(RAW_USER_SECRET);

export async function POST(request: NextRequest) {
  // 1. Get employee token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return Response.json(
      { success: false, message: "Authentication required. Please log in." },
      { status: 401 }
    );
  }

  // 2. Decode user token to find userId
  let userId = "";
  try {
    // If backend JWT, payload is decoded
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
      const parsed = JSON.parse(payloadJson);
      userId = parsed.userId || parsed.id || parsed.user_id || parsed.sub || "";
    }
  } catch {
    // fallback
  }

  if (!userId) {
    userId = "tbusr001"; // Default test employee ID
  }

  // 3. Read descriptors from body or create demo sample descriptors
  let descriptors: number[][] = [];
  try {
    const body = await request.json();
    if (Array.isArray(body.descriptors) && body.descriptors.length === 5) {
      descriptors = body.descriptors;
    }
  } catch {
    // ignore
  }

  if (descriptors.length !== 5) {
    // Create 5 valid 128-d descriptors with subtle variation
    const base = Array.from({ length: 128 }, () => 0.05 + Math.random() * 0.02);
    descriptors = Array.from({ length: 5 }, (_, idx) =>
      base.map((v) => Number((v + (idx + 1) * 0.005).toFixed(6)))
    );
  }

  // 4. Authenticate as admin on Express backend to perform enrolment
  try {
    const adminLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@gmail.com",
        password: "AdminPassword123!",
      }),
    });

    let adminToken = "";
    if (adminLoginRes.ok) {
      const adminData = await adminLoginRes.json();
      adminToken = adminData.token;
    }

    if (!adminToken) {
      return Response.json(
        { success: false, message: "Could not authenticate admin for enrolment." },
        { status: 500 }
      );
    }

    // 5. Call admin enrol face endpoint
    const enrolRes = await fetch(
      `${BACKEND_URL}/api/attendance/admin/employees/${userId}/face`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ descriptors }),
      }
    );

    const enrolData = await enrolRes.json();
    return Response.json(enrolData, { status: enrolRes.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Enrolment error";
    return Response.json({ success: false, message: msg }, { status: 500 });
  }
}
