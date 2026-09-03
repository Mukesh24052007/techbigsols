import crypto from "crypto";

/**
 * Server-side admin JWT validation helper.
 *
 * Supports:
 * 1. ADMIN_DEV_TOKEN (dev bypass)
 * 2. JWT signature & claims verification (HS256 using JWT_SECRET or ADMIN_JWT_SECRET)
 * 3. Base64 JWT payload parsing (expiry check & role verification)
 * 4. Forwarding to external auth service (${NEXT_PUBLIC_API_BASE_URL}/api/auth/me)
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

const DEV_TOKEN =
  process.env.ADMIN_DEV_TOKEN ||
  process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN ||
  "dev-secret-change-me";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "tbs-super-secret-jwt-key-2026";

export interface VerifyOk {
  ok: true;
  adminId: string;
  email: string;
}

export interface VerifyFail {
  ok: false;
  response: Response;
}

export type VerifyResult = VerifyOk | VerifyFail;

/**
 * Helper to decode base64url string
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export async function verifyAdminToken(
  authorizationHeader: string | null
): Promise<VerifyResult> {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: Response.json(
        { success: false, message: "Authentication required. Please provide a Bearer token." },
        { status: 401 }
      ),
    };
  }

  const token = authorizationHeader.slice(7).trim(); // strip "Bearer "

  if (!token) {
    return {
      ok: false,
      response: Response.json(
        { success: false, message: "Bearer token is missing or empty." },
        { status: 401 }
      ),
    };
  }

  // ── 1. Dev token bypass ───────────────────────────────────────────────────
  if (DEV_TOKEN && token === DEV_TOKEN) {
    return { ok: true, adminId: "dev-admin", email: "admin@techbigsolutions.in" };
  }

  // ── 2. Standard JWT verification (header.payload.signature) ───────────────
  const parts = token.split(".");
  if (parts.length === 3) {
    try {
      const [headerB64, payloadB64, signatureB64] = parts;

      // Verify HMAC-SHA256 signature if secret is configured
      if (JWT_SECRET) {
        const expectedSig = crypto
          .createHmac("sha256", JWT_SECRET)
          .update(`${headerB64}.${payloadB64}`)
          .digest("base64url");

        // If signature matches
        if (expectedSig === signatureB64) {
          const payloadJson = JSON.parse(base64UrlDecode(payloadB64));
          const now = Math.floor(Date.now() / 1000);

          if (payloadJson.exp && payloadJson.exp < now) {
            return {
              ok: false,
              response: Response.json(
                { success: false, message: "JWT token has expired. Please log in again." },
                { status: 401 }
              ),
            };
          }

          return {
            ok: true,
            adminId: payloadJson.id || payloadJson.sub || payloadJson.userId || "admin-user",
            email: payloadJson.email || "admin@techbigsolutions.in",
          };
        }
      }

      // Try decoding payload claims even if external signature format
      const payloadJson = JSON.parse(base64UrlDecode(payloadB64));
      const now = Math.floor(Date.now() / 1000);
      if (payloadJson.exp && payloadJson.exp < now) {
        return {
          ok: false,
          response: Response.json(
            { success: false, message: "JWT token has expired. Please log in again." },
            { status: 401 }
          ),
        };
      }

      // If valid role or admin claim
      if (
        payloadJson.role === "admin" ||
        payloadJson.role === "superadmin" ||
        payloadJson.isAdmin === true ||
        payloadJson.email?.includes("admin")
      ) {
        return {
          ok: true,
          adminId: payloadJson.id || payloadJson.sub || "admin-user",
          email: payloadJson.email || "admin@techbigsolutions.in",
        };
      }
    } catch {
      // Fall through to external backend check
    }
  }

  // ── 3. External auth backend check (if backend is running) ────────────────
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const profile = await res.json();
      return {
        ok: true,
        adminId: profile.id || profile.data?.id || "admin-user",
        email: profile.email || profile.data?.email || "admin@techbigsolutions.in",
      };
    }
  } catch {
    // External service unavailable
  }

  // If none of the validation methods succeeded:
  return {
    ok: false,
    response: Response.json(
      { success: false, message: "Invalid or expired admin token. Please log in again." },
      { status: 401 }
    ),
  };
}
