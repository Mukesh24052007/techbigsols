"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  employeeAttendanceApi,
  type AttendanceRecordItem,
  type QrCheckInResponse,
  type QrCheckOutResponse,
  type AttendanceStatusResponse,
} from "@/lib/attendanceApi";
import { EmployeeQrScanner } from "./EmployeeQrScanner";
import {
  QrCode,
  LogIn,
  LogOut,
  History,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

type AttendanceMode = "scan" | "history";
type AttendanceAction = "CHECK_IN" | "CHECK_OUT";

export function EmployeeQrAttendanceModule() {
  const [activeTab, setActiveTab] = useState<AttendanceMode>("scan");
  const [selectedAction, setSelectedAction] = useState<AttendanceAction>("CHECK_IN");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status & Feedback banners
  const [successBanner, setSuccessBanner] = useState<{
    action: AttendanceAction;
    message: string;
    date?: string;
    time?: string;
    workedMinutes?: number;
    status?: string;
  } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Today status
  const [todayStatus, setTodayStatus] = useState<AttendanceStatusResponse["todayRecord"] | null>(null);

  // History State
  const [historyMonth, setHistoryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [historyRecords, setHistoryRecords] = useState<Array<AttendanceRecordItem & { is_manual_override?: boolean }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // 1. Refresh Today Status helper
  const refreshStatus = useCallback(async () => {
    try {
      const res = await employeeAttendanceApi.getStatus();
      if (res.todayRecord) {
        setTodayStatus(res.todayRecord);
        if (res.todayRecord.checkInTime && !res.todayRecord.checkOutTime) {
          setSelectedAction("CHECK_OUT");
        }
      }
    } catch {
      // Best-effort status load
    }
  }, []);

  useEffect(() => {
    let active = true;
    void employeeAttendanceApi.getStatus().then((res) => {
      if (active && res.todayRecord) {
        setTodayStatus(res.todayRecord);
        if (res.todayRecord.checkInTime && !res.todayRecord.checkOutTime) {
          setSelectedAction("CHECK_OUT");
        }
      }
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // 2. Load History Data on demand
  const loadHistoryData = useCallback(async (month: string) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await employeeAttendanceApi.getHistory(month);
      const list = (res.records ?? res.data ?? []) as Array<AttendanceRecordItem & { is_manual_override?: boolean }>;
      setHistoryRecords(list);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load attendance history.";
      setHistoryError(msg);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "history") return;
    let active = true;

    void employeeAttendanceApi.getHistory(historyMonth).then((res) => {
      if (!active) return;
      const list = (res.records ?? res.data ?? []) as Array<AttendanceRecordItem & { is_manual_override?: boolean }>;
      setHistoryRecords(list);
    }).catch((err: unknown) => {
      if (!active) return;
      const msg = err instanceof Error ? err.message : "Failed to load attendance history.";
      setHistoryError(msg);
    });

    return () => {
      active = false;
    };
  }, [activeTab, historyMonth]);

  const handleTabChange = (tab: AttendanceMode) => {
    setActiveTab(tab);
    if (tab === "history") {
      void loadHistoryData(historyMonth);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHistoryMonth(val);
    void loadHistoryData(val);
  };

  // 3. Handle Scanned QR Token Submission
  const handleTokenScanned = async (qrToken: string) => {
    setIsSubmitting(true);
    setSuccessBanner(null);
    setErrorBanner(null);

    try {
      if (selectedAction === "CHECK_IN") {
        const res: QrCheckInResponse = await employeeAttendanceApi.qrCheckIn({
          qrToken,
        });

        if (res.success) {
          setSuccessBanner({
            action: "CHECK_IN",
            message: res.message || "Check-In recorded successfully.",
            date: res.data?.attendanceDate,
            time: res.data?.checkInAt ? formatServerTime(res.data.checkInAt) : undefined,
            status: res.data?.status || "PRESENT",
          });
          void refreshStatus();
        } else {
          setErrorBanner(res.message || "Check-In failed. Please try scanning again.");
        }
      } else {
        const res: QrCheckOutResponse = await employeeAttendanceApi.qrCheckOut({
          qrToken,
        });

        if (res.success) {
          setSuccessBanner({
            action: "CHECK_OUT",
            message: res.message || "Check-Out recorded successfully.",
            date: res.data?.attendanceDate,
            time: res.data?.checkOutAt ? formatServerTime(res.data.checkOutAt) : undefined,
            workedMinutes: res.data?.workedMinutes,
            status: res.data?.status,
          });
          void refreshStatus();
        } else {
          setErrorBanner(res.message || "Check-Out failed. Please try scanning again.");
        }
      }
    } catch (err: unknown) {
      let errorMsg = "An error occurred while submitting attendance.";
      if (err instanceof Error) {
        errorMsg = err.message;
      }
      // Provide actionable guidance on specific error conditions
      if (errorMsg.includes("Duplicate Check-In")) {
        errorMsg = "You have already recorded your check-in for today.";
      } else if (errorMsg.includes("no active Check-In found")) {
        errorMsg = "Check-Out rejected: You have not checked in for today yet.";
      } else if (errorMsg.includes("Duplicate Check-Out")) {
        errorMsg = "You have already checked out for today.";
      } else if (errorMsg.includes("QR Code Expired") || errorMsg.includes("EXPIRED_QR")) {
        errorMsg = "The scanned QR code has expired. Please scan the refreshed code from the office display.";
      } else if (errorMsg.includes("ACTION_MISMATCH") || errorMsg.includes("expected")) {
        errorMsg = `The scanned code does not match ${selectedAction === "CHECK_IN" ? "Check-In" : "Check-Out"}. Please select the matching action or scan the correct display.`;
      } else if (errorMsg.includes("Server took too long") || errorMsg.includes("504") || errorMsg.includes("Network")) {
        errorMsg = "Network timeout. Please check your internet connection or inspect your Attendance History before retrying.";
      }
      setErrorBanner(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Module Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f39200] to-[#ffab3d] text-white flex items-center justify-center shadow-md shadow-[#f39200]/20 flex-shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">QR Attendance 2.0</h2>
            <p className="text-xs text-slate-500">
              Scan the dynamic office display to mark daily presence
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-xl" role="tablist" aria-label="Attendance views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "scan"}
            onClick={() => handleTabChange("scan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "scan"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            onClick={() => handleTabChange("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "history"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            <span>My History</span>
          </button>
        </div>
      </div>

      {/* ─── SCAN VIEW ──────────────────────────────────────────────────────── */}
      {activeTab === "scan" && (
        <div className="space-y-6">
          {/* Action Selector: Check In vs Check Out */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSelectedAction("CHECK_IN");
                setSuccessBanner(null);
                setErrorBanner(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedAction === "CHECK_IN"
                  ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedAction === "CHECK_IN"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                </div>
                {selectedAction === "CHECK_IN" && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800">Check In</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark your office arrival
              </p>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setSelectedAction("CHECK_OUT");
                setSuccessBanner(null);
                setErrorBanner(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedAction === "CHECK_OUT"
                  ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    selectedAction === "CHECK_OUT"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                </div>
                {selectedAction === "CHECK_OUT" && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-800">Check Out</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark end of work session
              </p>
            </button>
          </div>

          {/* Today's Record Summary Widget */}
          {todayStatus && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Today&apos;s Status
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-slate-800">
                      {todayStatus.status}
                    </span>
                    {todayStatus.checkInTime && (
                      <span className="text-xs text-slate-500">
                        In: {formatServerTime(todayStatus.checkInTime)}
                      </span>
                    )}
                    {todayStatus.checkOutTime && (
                      <span className="text-xs text-slate-500">
                        Out: {formatServerTime(todayStatus.checkOutTime)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {todayStatus.workedMinutes != null && todayStatus.workedMinutes > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Logged Time</p>
                  <p className="text-sm font-bold text-slate-700">
                    {Math.floor(todayStatus.workedMinutes / 60)}h {todayStatus.workedMinutes % 60}m
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Success Notification Banner */}
          {successBanner && (
            <div
              role="status"
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 text-emerald-900 shadow-sm animate-in fade-in"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-emerald-800">
                  {successBanner.action === "CHECK_IN" ? "Check-In Confirmed" : "Check-Out Confirmed"}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">{successBanner.message}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-emerald-800">
                  {successBanner.date && <span>Date: {successBanner.date}</span>}
                  {successBanner.time && <span>Time: {successBanner.time}</span>}
                  {successBanner.workedMinutes != null && (
                    <span>
                      Duration: {Math.floor(successBanner.workedMinutes / 60)}h {successBanner.workedMinutes % 60}m
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Notification Banner */}
          {errorBanner && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3.5 text-rose-900 shadow-sm animate-in fade-in"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-rose-800">Attendance Submission Issue</p>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorBanner}</p>
              </div>
            </div>
          )}

          {/* Scanner Component */}
          <EmployeeQrScanner
            action={selectedAction}
            isSubmitting={isSubmitting}
            onScanSuccess={(token) => void handleTokenScanned(token)}
          />
        </div>
      )}

      {/* ─── HISTORY VIEW ───────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* History Header & Month Filter */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Attendance Records</h3>
              <p className="text-xs text-slate-500">
                Official presence timestamps verified by the system
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="history-month" className="text-xs font-medium text-slate-600">
                Month:
              </label>
              <input
                id="history-month"
                type="month"
                value={historyMonth}
                onChange={handleMonthChange}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f39200]/30"
              />
              <button
                type="button"
                onClick={() => void loadHistoryData(historyMonth)}
                disabled={historyLoading}
                aria-label="Refresh history"
                className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {historyError && (
            <div className="m-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{historyError}</span>
            </div>
          )}

          {/* Loading Skeleton */}
          {historyLoading && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[220px]">
              <RefreshCw className="w-6 h-6 text-[#f39200] animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading history…</p>
            </div>
          )}

          {/* Empty State */}
          {!historyLoading && !historyError && historyRecords.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[220px]">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No records found</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                There are no attendance records logged for {historyMonth}.
              </p>
            </div>
          )}

          {/* Records Table */}
          {!historyLoading && !historyError && historyRecords.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Worked Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {r.date || "—"}
                        {r.is_manual_override && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                            Adjusted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {r.checkInTime ? formatServerTime(r.checkInTime) : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {r.checkOutTime ? formatServerTime(r.checkOutTime) : "—"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {r.workedMinutes != null && r.workedMinutes > 0
                          ? `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Formats UTC server date-time string into readable 12-hour local time e.g. "09:30 AM" */
function formatServerTime(dateStr: string): string {
  try {
    const d = new Date(dateStr.replace(" ", "T") + (dateStr.includes("Z") ? "" : "Z"));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return dateStr;
  }
}

/** Accessible status badge component */
function StatusBadge({ status }: { status: string }) {
  const norm = (status || "").toUpperCase();
  if (norm === "PRESENT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Present
      </span>
    );
  }
  if (norm === "LATE") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Late
      </span>
    );
  }
  if (norm === "ABSENT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Absent
      </span>
    );
  }
  if (norm === "ON_LEAVE" || norm === "LEAVE") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        On Leave
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
      {status || "Unknown"}
    </span>
  );
}
