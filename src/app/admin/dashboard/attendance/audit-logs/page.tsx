"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  adminAttendanceApi,
  type AdminAuditLogEntry,
  type AdminAuditLogsQuery,
} from "@/lib/api/adminAttendanceApi";
import {
  ShieldCheck,
  RefreshCw,
  Filter,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCode2,
  X,
  Clock,
  Layers,
  ArrowRight,
  Shield,
} from "lucide-react";

// Helper accessors to gracefully support both camelCase and snake_case backend payloads
function getActorId(log: AdminAuditLogEntry): number | undefined {
  return log.actorAdminId ?? log.actor_admin_id;
}

function getActorName(log: AdminAuditLogEntry): string | null {
  return log.actorName ?? log.actor_name ?? null;
}

function getActorEmail(log: AdminAuditLogEntry): string | null {
  return log.actorEmail ?? log.actor_email ?? null;
}

function getEntityType(log: AdminAuditLogEntry): string {
  return log.entityType ?? log.entity_type ?? "unknown";
}

function getEntityId(log: AdminAuditLogEntry): string {
  const val = log.entityId ?? log.entity_id;
  return val !== undefined && val !== null ? String(val) : "—";
}

function getCreatedAt(log: AdminAuditLogEntry): string {
  return log.createdAt ?? log.created_at ?? "";
}

function getBeforeSnapshot(log: AdminAuditLogEntry): Record<string, unknown> | null {
  return log.before ?? log.before_json ?? null;
}

function getAfterSnapshot(log: AdminAuditLogEntry): Record<string, unknown> | null {
  return log.after ?? log.after_json ?? null;
}

function extractReason(log: AdminAuditLogEntry): string | null {
  const after = getAfterSnapshot(log);
  if (after && typeof after === "object") {
    if (typeof after.reason === "string" && after.reason.trim()) {
      return after.reason.trim();
    }
    if (typeof after.override_reason === "string" && after.override_reason.trim()) {
      return after.override_reason.trim();
    }
  }
  const before = getBeforeSnapshot(log);
  if (before && typeof before === "object") {
    if (typeof before.reason === "string" && before.reason.trim()) {
      return before.reason.trim();
    }
    if (typeof before.override_reason === "string" && before.override_reason.trim()) {
      return before.override_reason.trim();
    }
  }
  return null;
}

function formatAuditTimestamp(isoString: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  } catch {
    return isoString;
  }
}

// Action styling badge
function renderActionBadge(action: string) {
  const normalized = action.toUpperCase();
  if (normalized.includes("OVERRIDE")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {action}
      </span>
    );
  }
  if (normalized.includes("QR")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {action}
      </span>
    );
  }
  if (normalized.includes("FACE")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        {action}
      </span>
    );
  }
  if (normalized.includes("REGULARIZATION")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
        {action}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {action}
    </span>
  );
}

export default function AttendanceAuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [adminIdFilter, setAdminIdFilter] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);
  const [page, setPage] = useState<number>(1);

  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inspector modal state
  const [inspectTarget, setInspectTarget] = useState<AdminAuditLogEntry | null>(null);

  // Fetch audit logs
  const fetchLogs = useCallback(
    async (query: AdminAuditLogsQuery) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await adminAttendanceApi.getAuditLogs(query);
        if (res.success && res.data) {
          setLogs(res.data.logs || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load audit logs.";
        setErrorMessage(msg);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Effect to load data safely
  useEffect(() => {
    let active = true;

    const parsedAdminId = adminIdFilter.trim() ? Number(adminIdFilter.trim()) : undefined;

    void adminAttendanceApi
      .getAuditLogs({
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        actorAdminId: isNaN(Number(parsedAdminId)) ? undefined : parsedAdminId,
        page,
        limit,
      })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setLogs(res.data.logs || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Failed to load audit logs.";
        setErrorMessage(msg);
        setLogs([]);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [actionFilter, entityTypeFilter, adminIdFilter, page, limit]);

  const handleActionChange = (val: string) => {
    setActionFilter(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleEntityTypeChange = (val: string) => {
    setEntityTypeFilter(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleAdminIdChange = (val: string) => {
    setAdminIdFilter(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleManualRefresh = () => {
    const parsedAdminId = adminIdFilter.trim() ? Number(adminIdFilter.trim()) : undefined;
    void fetchLogs({
      action: actionFilter || undefined,
      entityType: entityTypeFilter || undefined,
      actorAdminId: isNaN(Number(parsedAdminId)) ? undefined : parsedAdminId,
      page,
      limit,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0a4bb3] to-[#2563eb] flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Attendance Audit Log Viewer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Read-Only Trail
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Cryptographically and transactionally tracked records of administrator manual overrides, QR rotations, and profile operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 pl-1 shrink-0">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filters:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
            {/* Action Filter */}
            <div>
              <label htmlFor="audit-action-filter" className="block text-xs font-medium text-slate-500 mb-1">Action</label>
              <select
                id="audit-action-filter"
                value={actionFilter}
                onChange={(e) => handleActionChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0a4bb3] focus:border-transparent font-medium text-slate-700"
              >
                <option value="">All Actions</option>
                <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE</option>
                <option value="QR_GENERATE">QR_GENERATE</option>
                <option value="QR_ROTATE">QR_ROTATE</option>
                <option value="enrol_face">enrol_face</option>
                <option value="delete_face">delete_face</option>
                <option value="regularization_approve">regularization_approve</option>
                <option value="regularization_reject">regularization_reject</option>
                <option value="leave_create">leave_create</option>
                <option value="leave_cancel">leave_cancel</option>
                <option value="record_patch">record_patch</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div>
              <label htmlFor="audit-entity-filter" className="block text-xs font-medium text-slate-500 mb-1">Entity Type</label>
              <select
                id="audit-entity-filter"
                value={entityTypeFilter}
                onChange={(e) => handleEntityTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0a4bb3] focus:border-transparent font-medium text-slate-700"
              >
                <option value="">All Entities</option>
                <option value="attendance_record">attendance_record</option>
                <option value="qr_session">qr_session</option>
                <option value="employee">employee</option>
                <option value="regularization">regularization</option>
                <option value="leave">leave</option>
                <option value="office">office</option>
                <option value="profile">profile</option>
              </select>
            </div>

            {/* Admin Actor ID Filter */}
            <div>
              <label htmlFor="audit-actor-filter" className="block text-xs font-medium text-slate-500 mb-1">Actor Admin ID</label>
              <input
                id="audit-actor-filter"
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={adminIdFilter}
                onChange={(e) => handleAdminIdChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0a4bb3] focus:border-transparent font-medium text-slate-700"
              />
            </div>

            {/* Limit Selector */}
            <div>
              <label htmlFor="audit-limit-filter" className="block text-xs font-medium text-slate-500 mb-1">Page Limit</label>
              <select
                id="audit-limit-filter"
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0a4bb3] focus:border-transparent font-medium text-slate-700"
              >
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900">Failed to Load Audit Logs</h4>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="text-xs font-semibold px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#0a4bb3] animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading audit trail records...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No Audit Records Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No audit log entries match the selected filters. Change or clear the filters to view other activity.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Timestamp (UTC)</th>
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Justification / Reason</th>
                  <th className="py-3.5 px-4 text-right">Snapshots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const reason = extractReason(log);
                  const actorId = getActorId(log);
                  const actorName = getActorName(log);
                  const actorEmail = getActorEmail(log);
                  const entityType = getEntityType(log);
                  const entityId = getEntityId(log);
                  const createdAt = getCreatedAt(log);
                  const before = getBeforeSnapshot(log);
                  const after = getAfterSnapshot(log);
                  const hasSnapshots = Boolean(before || after);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatAuditTimestamp(createdAt)}</span>
                        </div>
                      </td>

                      {/* Administrator */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {actorName || (actorId ? `Admin #${actorId}` : "System / Automated")}
                            </p>
                            {actorEmail && (
                              <p className="text-[11px] text-slate-400">{actorEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4">
                        {renderActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono font-medium border border-slate-200">
                            {entityType}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            #{entityId}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {reason ? (
                          <span
                            className="inline-block px-2.5 py-1 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-700 truncate max-w-[280px]"
                            title={reason}
                          >
                            &ldquo;{reason}&rdquo;
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Snapshots Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {hasSnapshots ? (
                          <button
                            onClick={() => setInspectTarget(log)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#0a4bb3] hover:text-white text-slate-700 transition-colors"
                            title="Inspect before/after states"
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 font-mono">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-medium">
          <div>
            Showing <span className="font-semibold text-slate-800">{logs.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{total}</span> total audit records
            (Page {page} of {totalPages})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-2 text-slate-400">|</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Inspector Modal */}
      {inspectTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Audit Entry #{inspectTarget.id} — State Snapshot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Action: <span className="font-semibold text-slate-700">{inspectTarget.action}</span> on{" "}
                    <span className="font-mono text-slate-700">{getEntityType(inspectTarget)} #{getEntityId(inspectTarget)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Meta strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Recorded At:</span>
                  <span className="font-semibold text-slate-700">
                    {formatAuditTimestamp(getCreatedAt(inspectTarget))}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Actor:</span>
                  <span className="font-semibold text-slate-700">
                    {getActorName(inspectTarget) || `Admin #${getActorId(inspectTarget) ?? "—"}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Recorded Reason:</span>
                  <span className="font-semibold text-slate-700">
                    {extractReason(inspectTarget) || "None provided"}
                  </span>
                </div>
              </div>

              {/* Side-by-side or stacked JSON snapshots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before State */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 text-amber-700">
                      <Layers className="w-3.5 h-3.5" />
                      Before State
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getBeforeSnapshot(inspectTarget) ? "Object Snapshot" : "Null / None"}
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800 max-h-72">
                    {getBeforeSnapshot(inspectTarget) ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(getBeforeSnapshot(inspectTarget), null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-500 italic font-sans text-xs">
                        No previous state recorded (newly initialized or initial creation).
                      </p>
                    )}
                  </div>
                </div>

                {/* After State */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5 text-blue-700">
                      <ArrowRight className="w-3.5 h-3.5" />
                      After State
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getAfterSnapshot(inspectTarget) ? "Object Snapshot" : "Null / None"}
                    </span>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 overflow-x-auto text-xs font-mono text-cyan-300 border border-slate-800 max-h-72">
                    {getAfterSnapshot(inspectTarget) ? (
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(getAfterSnapshot(inspectTarget), null, 2)}
                      </pre>
                    ) : (
                      <p className="text-slate-500 italic font-sans text-xs">
                        No after state recorded (deletion or no payload returned).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Immutable notice */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  This audit log entry is immutable. Changes cannot be reverted, modified, or expunged from this viewer.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setInspectTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
