/**
 * Server-side backend fetch helper.
 *
 * Used by Next.js API route handlers to proxy requests to the external
 * backend (NEXT_PUBLIC_API_BASE_URL / localhost:5000).
 *
 * Never imported on the client — server-only.
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface BackendOptions {
  method?: HttpMethod;
  /** Forward an Authorization header from the incoming request */
  authorization?: string | null;
  /** Forward a Cookie header (for site-user JWT cookie) */
  cookie?: string | null;
  body?: unknown;
}

export interface BackendResult {
  status: number;
  ok: boolean;
  data: unknown;
  /** Raw headers so callers can forward Set-Cookie etc. */
  headers: Headers;
}

/**
 * Fetch a backend endpoint and return status + parsed JSON + raw headers.
 * Never throws — all errors are returned as { ok: false, status, data }.
 */
export async function backendFetch(
  path: string,
  options: BackendOptions = {}
): Promise<BackendResult> {
  const { method = "GET", authorization, cookie, body } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authorization) headers["Authorization"] = authorization;
  if (cookie) headers["Cookie"] = cookie;

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    let data: unknown;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return { status: res.status, ok: res.ok, data, headers: res.headers };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Backend unreachable.";
    return {
      status: 502,
      ok: false,
      data: { success: false, message },
      headers: new Headers(),
    };
  }
}
