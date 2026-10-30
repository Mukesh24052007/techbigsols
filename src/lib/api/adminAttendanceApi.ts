/**
 * Typed client service for Attendance 2.0 Admin APIs.
 *
 * All admin calls use the shared apiClient in src/lib/axios.ts with the admin
 * Bearer token (tbs_admin_token in localStorage). Never routes through the employee proxy.
 */

import { apiClient } from "@/lib/axios";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminQrGeneratePayload {
  action: "CHECK_IN" | "CHECK_OUT";
  officeId?: number;
  validityMinutes?: number;
  allowRotation?: boolean;
  rotationReason?: string;
}

export interface AdminQrSessionData {
  sessionId: number;
  qrToken: string;
  action: "CHECK_IN" | "CHECK_OUT";
  attendanceDate: string;
  officeId: number;
  expiresAt: string;
  secondsRemaining: number;
  generationSeq: number;
  rotated?: boolean;
  alreadyActive?: boolean;
}

export interface AdminQrGenerateResponse {
  success: boolean;
  message: string;
  data: AdminQrSessionData;
}

export interface AdminQrActiveData {
  active: boolean;
  sessionId?: number;
  qrToken?: string;
  action?: "CHECK_IN" | "CHECK_OUT";
  attendanceDate?: string;
  officeId?: number;
  expiresAt?: string;
  secondsRemaining?: number;
  generationSeq?: number;
  message?: string;
  expiredSessionId?: number;
}

export interface AdminQrActiveResponse {
  success: boolean;
  data: AdminQrActiveData;
}

export interface AdminDailyLogRecord {
  id: number;
  user_id: string;
  attendance_date: string;
  fullname: string;
  office_id: number;
  check_in_at: string | null;
  check_out_at: string | null;
  status: string;
  is_manual_override: boolean;
  override_reason: string | null;
  override_by: number | null;
  worked_minutes: number;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_in_accuracy: number | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_out_accuracy: number | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminDailyLogsData {
  date: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  records: AdminDailyLogRecord[];
}

export interface AdminDailyLogsResponse {
  success: boolean;
  data: AdminDailyLogsData;
}

export interface AdminDailyLogsQuery {
  date?: string;
  status?: string;
  officeId?: number;
  page?: number;
  limit?: number;
}

export interface AdminManualOverridePayload {
  userId: string;
  attendanceDate: string;
  status: "PRESENT" | "ABSENT";
  reason: string;
}

export interface AdminManualOverrideResponse {
  success: boolean;
  message: string;
  data?: {
    record: Record<string, unknown>;
    override: {
      isManualOverride: boolean;
      status: "PRESENT" | "ABSENT";
      reason: string;
      overrideBy: number;
      previousStatus: string | null;
    };
  };
}

export interface AdminAuditLogEntry {
  id: number;
  actorAdminId?: number;
  actor_admin_id?: number;
  actorName?: string | null;
  actor_name?: string | null;
  actorEmail?: string | null;
  actor_email?: string | null;
  action: string;
  entityType?: string;
  entity_type?: string;
  entityId?: number | string;
  entity_id?: number | string;
  before?: Record<string, unknown> | null;
  before_json?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  after_json?: Record<string, unknown> | null;
  createdAt?: string;
  created_at?: string;
}

export interface AdminAuditLogsData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  logs: AdminAuditLogEntry[];
}

export interface AdminAuditLogsResponse {
  success: boolean;
  data: AdminAuditLogsData;
}

export interface AdminAuditLogsQuery {
  entityType?: string;
  action?: string;
  actorAdminId?: number;
  page?: number;
  limit?: number;
}

// ── Admin Attendance Service ──────────────────────────────────────────────────

export const adminAttendanceApi = {
  /**
   * POST /api/attendance/admin/qr/generate
   * Generates or retrieves today's active QR session for an office.
   * If already generated, requires allowRotation = true and rotationReason.
   */
  async generateQrSession(
    payload: AdminQrGeneratePayload
  ): Promise<AdminQrGenerateResponse> {
    try {
      const res = await apiClient.post<AdminQrGenerateResponse>(
        "/api/attendance/admin/qr/generate",
        payload
      );
      return res.data;
    } catch (err: unknown) {
      throw extractApiError(err, "Failed to generate QR session.");
    }
  },

  /**
   * GET /api/attendance/admin/qr/active
   * Retrieves the currently active QR session token for display recovery.
   */
  async getActiveQrSession(query: {
    action: "CHECK_IN" | "CHECK_OUT";
    officeId?: number;
  }): Promise<AdminQrActiveResponse> {
    try {
      const res = await apiClient.get<AdminQrActiveResponse>(
        "/api/attendance/admin/qr/active",
        {
          params: {
            action: query.action,
            officeId: query.officeId ?? 1,
          },
        }
      );
      return res.data;
    } catch (err: unknown) {
      throw extractApiError(err, "Failed to load active QR session.");
    }
  },

  /**
   * GET /api/attendance/admin/daily-logs
   * Retrieves paginated daily attendance logs with optional status/office filters.
   */
  async getDailyLogs(
    query?: AdminDailyLogsQuery
  ): Promise<AdminDailyLogsResponse> {
    try {
      const res = await apiClient.get<AdminDailyLogsResponse>(
        "/api/attendance/admin/daily-logs",
        { params: query }
      );
      return res.data;
    } catch (err: unknown) {
      throw extractApiError(err, "Failed to load daily attendance logs.");
    }
  },

  /**
   * POST /api/attendance/admin/manual-override
   * Sets employee status to PRESENT or ABSENT with mandatory reason and writes audit log.
   */
  async submitManualOverride(
    payload: AdminManualOverridePayload
  ): Promise<AdminManualOverrideResponse> {
    try {
      const res = await apiClient.post<AdminManualOverrideResponse>(
        "/api/attendance/admin/manual-override",
        payload
      );
      return res.data;
    } catch (err: unknown) {
      throw extractApiError(err, "Failed to apply manual override.");
    }
  },

  /**
   * GET /api/attendance/admin/audit-logs
   * Retrieves paginated audit trail of attendance actions.
   */
  async getAuditLogs(
    query?: AdminAuditLogsQuery
  ): Promise<AdminAuditLogsResponse> {
    try {
      const res = await apiClient.get<AdminAuditLogsResponse>(
        "/api/attendance/admin/audit-logs",
        { params: query }
      );
      return res.data;
    } catch (err: unknown) {
      throw extractApiError(err, "Failed to load attendance audit logs.");
    }
  },
};

/** Helper to extract safe user-facing message from Axios error without logging sensitive payloads */
function extractApiError(err: unknown, defaultMessage: string): Error {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response
  ) {
    const errorData = (err.response as { data?: { message?: string } }).data;
    if (errorData?.message) {
      return new Error(errorData.message);
    }
  }
  if (err instanceof Error) {
    return new Error(err.message);
  }
  return new Error(defaultMessage);
}
