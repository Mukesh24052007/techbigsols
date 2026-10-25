/**
 * Typed client for Employee Attendance API and Admin Face Enrolment.
 *
 * Employee calls go through Next.js proxy (/api/attendance-proxy) which forwards
 * the HTTP-only tbs_user_token cookie to the Express backend.
 *
 * Admin face-enrolment and office configuration calls go through the Next.js admin proxy
 * (/api/admin-attendance-proxy) which validates the admin Bearer token and provides
 * seamless fallback to local Prisma DB if the external backend is unavailable.
 */

import { TOKEN_KEY } from "@/lib/axios";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OfficeConfig {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  radius_m: number;
  accuracy_max_m?: number;
  shift_start: string;
  shift_end: string;
  grace_minutes: number;
  heartbeat_seconds: number;
  outside_tolerance_minutes?: number;
  short_outing_allowance_minutes?: number;
  reverify_count?: number;
  employeeCount?: number;
}

export interface AdminOffice extends OfficeConfig {
  id: number | string;
  employeeCount?: number;
}

export interface AdminEmployeeProfile {
  userId: string;
  fullname: string;
  email?: string;
  department?: string | null;
  designation?: string | null;
  office?: { id: number | string; name: string } | null;
  faceEnrolled: boolean;
  hasPhoto: boolean;
  enrolSource?: "PHOTO" | "LIVE" | string | null;
  consentGiven: boolean;
  consentAt?: string | null;
  faceEnrolledAt?: string | null;
}

export interface AttendanceStatusResponse {
  success: boolean;
  consented: boolean;
  faceEnrolled: boolean;
  office?: OfficeConfig;
  reverifyRequired?: boolean;
  reverifyPending?: boolean;
  todayRecord?: {
    id: string;
    checkInTime: string;
    checkOutTime?: string | null;
    status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";
    presenceState?: "INSIDE" | "OUTSIDE";
    reverifyPending?: boolean;
    reverifyRequired?: boolean;
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
  fixTimestamp?: number;
}

export interface HeartbeatPayload {
  lat: number;
  lng: number;
  accuracy: number;
  fixTimestamp?: number;
}

export interface CheckOutPayload {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface HeartbeatResponse {
  success: boolean;
  presenceState: "INSIDE" | "OUTSIDE";
  reverifyPending?: boolean;
  reverifyRequired?: boolean;
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

// ── Helper for proxy fetch (Employee Attendance) ──────────────────────────────

async function proxyFetch<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(`/api/attendance-proxy/${path}`, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (res) break;
    } catch (err) {
      lastError = err;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 350));
      }
    }
  }

  if (!res) {
    console.warn(`[proxyFetch] Network notice for /api/attendance-proxy/${path}:`, lastError);
    throw new Error("Temporary network glitch. Please try again.");
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
    const raw = await proxyFetch<{
      success: boolean;
      data?: {
        office?: OfficeConfig;
        faceEnrolled?: boolean;
        consentGiven?: boolean;
        consented?: boolean;
        reverifyRequired?: boolean;
        reverifyPending?: boolean;
        todayRecord?: AttendanceStatusResponse["todayRecord"];
      };
      office?: OfficeConfig;
      faceEnrolled?: boolean;
      consentGiven?: boolean;
      consented?: boolean;
      reverifyRequired?: boolean;
      reverifyPending?: boolean;
      todayRecord?: AttendanceStatusResponse["todayRecord"];
      message?: string;
    }>("me/status");

    const payload = raw.data ?? raw;
    return {
      success: raw.success ?? true,
      consented: Boolean(payload.consentGiven ?? payload.consented),
      faceEnrolled: Boolean(payload.faceEnrolled),
      reverifyRequired: Boolean(payload.reverifyRequired ?? payload.todayRecord?.reverifyRequired),
      reverifyPending: Boolean(payload.reverifyPending ?? payload.todayRecord?.reverifyPending),
      office: payload.office,
      todayRecord: payload.todayRecord,
      message: raw.message,
    };
  },

  async submitConsent(): Promise<{ success: boolean; message?: string }> {
    return proxyFetch<{ success: boolean; message?: string }>("me/consent", {
      method: "POST",
      body: {},
    });
  },

  async requestChallenge(params?: {
    purpose?: "checkin" | "reverify";
    lat?: number;
    lng?: number;
    accuracy?: number;
    fixTimestamp?: number;
  }): Promise<ChallengeResponse> {
    const raw = await proxyFetch<{
      success: boolean;
      data?: {
        challengeId?: string;
        action?: ChallengeResponse["action"];
        expiresAt?: string;
      };
      challengeId?: string;
      action?: ChallengeResponse["action"];
      expiresAt?: string;
      message?: string;
    }>("challenge", {
      method: "POST",
      body: {
        purpose: params?.purpose ?? "checkin",
        lat: params?.lat,
        lng: params?.lng,
        accuracy: params?.accuracy,
        fixTimestamp: params?.fixTimestamp,
      },
    });

    const payload = raw.data ?? raw;
    return {
      success: raw.success ?? true,
      challengeId: payload.challengeId ?? "",
      action: payload.action ?? "BLINK_TWICE",
      expiresAt: payload.expiresAt ?? "",
      message: raw.message,
    };
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

  async checkOut(payload: CheckOutPayload): Promise<{ success: boolean; message?: string }> {
    return proxyFetch("check-out", {
      method: "POST",
      body: {
        lat: payload.lat,
        lng: payload.lng,
        accuracy: payload.accuracy,
      },
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

// ── Helper for admin proxy fetch ─────────────────────────────────────────────

async function adminProxyFetch<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {}
): Promise<T> {
  const { method = "GET", body } = options;
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const devToken = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || "dev-secret-change-me";
  const effectiveToken = token || devToken;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (effectiveToken) {
    headers["Authorization"] = `Bearer ${effectiveToken}`;
  }

  let res: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      res = await fetch(`/api/admin-attendance-proxy/${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      break;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (!res) {
    console.warn(`[adminProxyFetch] Network notice for /api/admin-attendance-proxy/${path}:`, lastError);
    throw new Error("Network connection error. Please check your connection.");
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    // Malformed or non-JSON response
  }

  if (res.status === 401) {
    if (typeof window !== "undefined" && !effectiveToken) {
      window.location.href = "/admin/login";
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

// ── Admin Face Enrolment API ─────────────────────────────────────────────────

export const adminFaceApi = {
  async enrolFace(
    userId: string,
    descriptors: number[][]
  ): Promise<{ success: boolean; message?: string }> {
    return adminProxyFetch<{ success: boolean; message?: string }>(
      `employees/${userId}/face`,
      { method: "POST", body: { descriptors } }
    );
  },

  async deleteFace(
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    return adminProxyFetch<{ success: boolean; message?: string }>(
      `employees/${userId}/face`,
      { method: "DELETE" }
    );
  },

  async enrolPhoto(
    userId: string,
    payload: {
      photo: string;
      descriptors: number[][];
      consentAttested: boolean;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    data?: {
      userId?: string;
      enrolledAt?: string;
      enrolSource?: string;
      hasPhoto?: boolean;
      templateUpdated?: boolean;
    };
  }> {
    return adminProxyFetch<{
      success: boolean;
      message?: string;
      data?: {
        userId?: string;
        enrolledAt?: string;
        enrolSource?: string;
        hasPhoto?: boolean;
        templateUpdated?: boolean;
      };
    }>(`employees/${userId}/photo`, { method: "POST", body: payload });
  },

  async getPhotoBlob(userId: string): Promise<Blob> {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`/api/admin-attendance-proxy/employees/${userId}/photo`, {
      headers,
    });
    if (!res.ok) {
      throw new Error("Photo not found.");
    }
    return await res.blob();
  },

  async getEmployees(): Promise<{ employees: AdminEmployeeProfile[] }> {
    const res = await adminProxyFetch<{ success: boolean; data: { employees: AdminEmployeeProfile[] } }>(
      "employees"
    );
    return res.data;
  },
};

// ── Admin Office Settings API ────────────────────────────────────────────────

export const adminOfficeApi = {
  async getOffices(): Promise<{ offices: AdminOffice[] }> {
    const res = await adminProxyFetch<{ success: boolean; data: { offices: AdminOffice[] } }>(
      "offices"
    );
    return res.data;
  },

  async createOffice(payload: Partial<AdminOffice>): Promise<{ office: AdminOffice; message?: string }> {
    const res = await adminProxyFetch<{ success: boolean; message?: string; data: { office: AdminOffice } }>(
      "offices",
      { method: "POST", body: payload }
    );
    return { office: res.data.office, message: res.message };
  },

  async updateOffice(
    id: number | string,
    payload: Partial<AdminOffice>
  ): Promise<{ office: AdminOffice; message?: string }> {
    const res = await adminProxyFetch<{ success: boolean; message?: string; data: { office: AdminOffice } }>(
      `offices/${id}`,
      { method: "PUT", body: payload }
    );
    return { office: res.data.office, message: res.message };
  },

  async deleteOffice(id: number | string): Promise<{ success: boolean; message?: string }> {
    return adminProxyFetch<{ success: boolean; message?: string }>(
      `offices/${id}`,
      { method: "DELETE" }
    );
  },
};
