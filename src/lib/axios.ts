import axios from "axios";

export const TOKEN_KEY = "tbs_admin_token";

/**
 * Shared Axios client for all API calls (products, admin attendance, etc.).
 *
 * In browser: uses relative URL ("") when connecting to Next.js routes or when
 * NEXT_PUBLIC_API_BASE_URL points to localhost:5000 (avoiding ECONNREFUSED when
 * external backend is not running).
 * Automatically attaches Admin JWT from localStorage on every mutating call.
 */

const rawBaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) || "";

const BACKEND_URL =
  typeof window !== "undefined" && (rawBaseUrl.includes("localhost:5000") || !rawBaseUrl)
    ? ""
    : rawBaseUrl || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Attach JWT on every request if present
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to login — but only for protected routes.
// Skip redirect for the login endpoint itself so the UI can show the error.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginEndpoint = error.config?.url?.includes("/api/auth/login");
    if (
      error.response?.status === 401 &&
      !isLoginEndpoint &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);
