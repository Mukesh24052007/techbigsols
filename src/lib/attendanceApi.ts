/**
 * Typed client for Employee Attendance API and Admin Face Enrolment.
 *
 * Employee calls go through Next.js proxy (/api/attendance-proxy) which forwards
 * the HTTP-only tbs_user_token cookie to the Express backend.
 *
 * Admin face-enrolment calls go directly to the external backend via the shared
 * apiClient in src/lib/axios.ts with the admin Bearer token.
 */

import { apiClient } from "@/lib/axios";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OfficeConfig {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  shift_start: string;
  shift_end: string;
  grace_minutes: number;
  heartbeat_seconds: number;
  max_gps_accuracy_m?: number;
}

export interface AttendanceStatusResponse {
  success: boolean;
  consented: boolean;
  faceEnrolled: boolean;
  office?: OfficeConfig;
  todayRecord?: {
    id: string;
    checkInTime: string;
    checkOutTime?: string | null;
    status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";
    presenceState?: "INSIDE" | "OUTSIDE";
    reverifyPending?: boolean;
    workedMinutes?: number;
  } | null;
  message?: string;
}

export interface ChallengeResponse {
  success: boolean;
  challengeId: string;
  action: "BLINK_TWICE" | "TURN_LEFT" | "TURN_RIGHT" | "SMILE";
  expiresAt: string;
  message?: string;
}

export interface CheckInPayload {
  challengeId: string;
  descriptors: number[][];
  lat: number;
  lng: number;
  accuracy: number;
}

export interface HeartbeatPayload {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface HeartbeatResponse {
  success: boolean;
  presenceState: "INSIDE" | "OUTSIDE";
  reverifyPending: boolean;
  message?: string;
}

export interface AttendanceRecordItem {
  id: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";
  workedMinutes: number;
  outsideMinutes?: number;
  notes?: string;
}

export interface HistoryResponse {
  success: boolean;
  records: AttendanceRecordItem[];
  summary?: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  };
  message?: string;
}

// ── Helper for proxy fetch ───────────────────────────────────────────────────

async function proxyFetch<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response;
  try {
    res = await fetch(`/api/attendance-proxy/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Network connection error. Please check your internet.");
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // Malformed or non-JSON response
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/user/login";
    }
    throw new Error((data.message as string) || "Session expired. Please log in.");
  }

  if (!res.ok) {
    const errorMsg =
      (data.message as string) ||
      `Request failed with status ${res.status}.`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// ── Employee API ─────────────────────────────────────────────────────────────

export const employeeAttendanceApi = {
  async getStatus(): Promise<AttendanceStatusResponse> {
    return proxyFetch<AttendanceStatusResponse>("me/status");
  },

  async submitConsent(): Promise<{ success: boolean; message?: string }> {
    return proxyFetch<{ success: boolean; message?: string }>("me/consent", {
      method: "POST",
      body: {},
    });
  },

  async requestChallenge(): Promise<ChallengeResponse> {
    return proxyFetch<ChallengeResponse>("challenge", {
      method: "POST",
      body: {},
    });
  },

  async checkIn(payload: CheckInPayload): Promise<{ success: boolean; message?: string; record?: unknown }> {
    return proxyFetch("check-in", {
      method: "POST",
      body: payload,
    });
  },

  async reverify(payload: CheckInPayload): Promise<{ success: boolean; message?: string }> {
    return proxyFetch("reverify", {
      method: "POST",
      body: payload,
    });
  },

  async sendHeartbeat(payload: HeartbeatPayload): Promise<HeartbeatResponse> {
    return proxyFetch<HeartbeatResponse>("heartbeat", {
      method: "POST",
      body: payload,
    });
  },

  async checkOut(payload: HeartbeatPayload): Promise<{ success: boolean; message?: string }> {
    return proxyFetch("check-out", {
      method: "POST",
      body: payload,
    });
  },

  async getHistory(month?: string): Promise<HistoryResponse> {
    const query = month ? `?month=${encodeURIComponent(month)}` : "";
    return proxyFetch<HistoryResponse>(`me/history${query}`);
  },

  async submitRegularization(payload: { date: string; reason: string }): Promise<{ success: boolean; message?: string }> {
    return proxyFetch("regularization", {
      method: "POST",
      body: payload,
    });
  },
};

// ── Admin Face Enrolment API ─────────────────────────────────────────────────

export const adminFaceApi = {
  async enrolFace(
    userId: string,
    descriptors: number[][]
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.post(`/api/attendance/admin/employees/${userId}/face`, {
        descriptors,
      });
      return res.data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const errorData = (err.response as { data?: { message?: string } }).data;
        throw new Error(errorData?.message || "Failed to enrol face.");
      }
      throw new Error("Network error connecting to backend.");
    }
  },

  async deleteFace(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await apiClient.delete(`/api/attendance/admin/employees/${userId}/face`);
      return res.data;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const errorData = (err.response as { data?: { message?: string } }).data;
        throw new Error(errorData?.message || "Failed to remove face.");
      }
      throw new Error("Network error connecting to backend.");
    }
  },
};
