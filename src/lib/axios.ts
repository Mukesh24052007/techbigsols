import axios from "axios";

export const TOKEN_KEY = "tbs_admin_token";

/**
 * Shared Axios client for all product API calls (GET, POST, PUT, DELETE).
 *
 * baseURL always points to the external backend (NEXT_PUBLIC_API_BASE_URL).
 * Automatically attaches Admin JWT from localStorage on every mutating call.
 */

const BACKEND_URL =
  (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000";

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
