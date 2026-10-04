import type { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/api/backend";

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
  ]),
};

const COOKIE_NAME = "tbs_user_token";
const TIMEOUT_MS = 15_000;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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

  // Prepare query string: only forward validated `month` for GET me/history
  let queryString = "";
  if (method === "GET" && subPath === "me/history") {
    const monthParam = request.nextUrl.searchParams.get("month");
    if (monthParam) {
      if (!MONTH_REGEX.test(monthParam)) {
        return Response.json(
          { success: false, message: "Invalid month format. Expected YYYY-MM." },
          { status: 400 }
        );
      }
      queryString = `?month=${encodeURIComponent(monthParam)}`;
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

    let data: unknown;
    const resContentType = backendRes.headers.get("content-type") ?? "";
    if (resContentType.includes("application/json")) {
      data = await backendRes.json();
    } else {
      const text = await backendRes.text();
      data = { success: backendRes.ok, message: text };
    }

    return Response.json(data, { status: backendRes.status });
  } catch (err: unknown) {
    clearTimeout(timer);

    if (err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"))) {
      return Response.json(
        { success: false, message: "Server took too long, please try again" },
        { status: 504 }
      );
    }

    return Response.json(
      { success: false, message: "Backend service unreachable" },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
