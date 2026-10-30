"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  adminAttendanceApi,
  type AdminDailyLogRecord,
  type AdminDailyLogsQuery,
} from "@/lib/api/adminAttendanceApi";
import { AdminManualOverrideModal } from "@/components/admin/AdminManualOverrideModal";
import {
  CalendarDays,
  RefreshCw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminDailyLogsPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [officeFilter, setOfficeFilter] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const limit = 25;

  const [records, setRecords] = useState<AdminDailyLogRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Override Modal state
  const [overrideTarget, setOverrideTarget] = useState<{
    userId: string;
    fullname: string;
    attendanceDate: string;
    currentStatus: string;
  } | null>(null);

  // Load Daily Logs on demand
  const loadDailyLogs = useCallback(async (query: AdminDailyLogsQuery) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await adminAttendanceApi.getDailyLogs(query);
      if (res.success && res.data) {
        setRecords(res.data.records || []);
        setTotalRecords(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load daily attendance logs.";
      setErrorMessage(msg);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch when filters or page change
  useEffect(() => {
    let active = true;

    void adminAttendanceApi
      .getDailyLogs({
        date: selectedDate,
        status: statusFilter || undefined,
        officeId: officeFilter,
        page,
        limit,
      })
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setRecords(res.data.records || []);
          setTotalRecords(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Failed to load daily attendance logs.";
        setErrorMessage(msg);
        setRecords([]);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, statusFilter, officeFilter, page]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setPage(1);
    setIsLoading(true);
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    setIsLoading(true);
  };

  const handleOverrideSuccess = () => {
    void loadDailyLogs({
      date: selectedDate,
      status: statusFilter || undefined,
      officeId: officeFilter,
      page,
      limit,
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Title & Action Bar ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Daily Attendance Logs</h1>
            <p className="text-xs text-slate-500">
              Auditable employee presence records with administrative overrides
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            void loadDailyLogs({
              date: selectedDate,
              status: statusFilter || undefined,
              officeId: officeFilter,
              page,
              limit,
            });
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#f39200]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Filters Toolbar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-wrap items-center gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="daily-date-picker" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Date:
          </label>
          <div className="relative">
            <input
              id="daily-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f39200]/30 cursor-pointer"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="daily-status-filter" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Status:
          </label>
          <select
            id="daily-status-filter"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f39200]/30 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>

        {/* Office Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="daily-office-filter" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Office:
          </label>
          <select
            id="daily-office-filter"
            value={officeFilter}
            onChange={(e) => {
              setOfficeFilter(Number(e.target.value));
              setPage(1);
              setIsLoading(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f39200]/30 cursor-pointer"
          >
            <option value={1}>Headquarters (Main)</option>
          </select>
        </div>

        {/* Record count indicator */}
        <div className="ml-auto text-xs text-slate-400 font-medium">
          Showing {records.length} of {totalRecords} records
        </div>
      </div>

      {/* ─── Error Notification ───────────────────────────────────────────── */}
      {errorMessage && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ─── Records Table Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Loading state */}
        {isLoading && (
          <div className="p-12 flex flex-col items-center justify-center min-h-[280px]">
            <RefreshCw className="w-7 h-7 text-[#004aad] animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading daily attendance records…</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !errorMessage && records.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[280px]">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Attendance Records Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              No employee attendance entries recorded for date {selectedDate} with current filters.
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !errorMessage && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Check-In</th>
                  <th className="py-3.5 px-4">Check-Out</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Worked Hours</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee Info */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                          {r.fullname?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{r.fullname}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{r.user_id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {r.attendance_date}
                    </td>

                    {/* Check In */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {r.check_in_at ? formatTime(r.check_in_at) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Check Out */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {r.check_out_at ? formatTime(r.check_out_at) : <span className="text-slate-300">—</span>}
                    </td>

                    {/* Status with Override Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={r.status} />
                        {r.is_manual_override && (
                          <span
                            title={`Reason: ${r.override_reason || "Admin override"} (By Admin #${r.override_by || "—"})`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-semibold cursor-help"
                          >
                            <ShieldAlert className="w-3 h-3 text-purple-600" />
                            Overridden
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Worked Hours */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                      {r.worked_minutes > 0 ? (
                        `${Math.floor(r.worked_minutes / 60)}h ${r.worked_minutes % 60}m`
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setOverrideTarget({
                            userId: r.user_id,
                            fullname: r.fullname,
                            attendanceDate: r.attendance_date,
                            currentStatus: r.status,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                        <span>Override</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Pagination Bar ──────────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Manual Override Modal ────────────────────────────────────────── */}
      <AdminManualOverrideModal
        isOpen={Boolean(overrideTarget)}
        target={overrideTarget}
        onClose={() => setOverrideTarget(null)}
        onSuccess={handleOverrideSuccess}
      />
    </div>
  );
}

/** Formats UTC server timestamp to local 12-hour string */
function formatTime(str: string): string {
  try {
    const d = new Date(str.replace(" ", "T") + (str.includes("Z") ? "" : "Z"));
    if (isNaN(d.getTime())) return str;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return str;
  }
}

/** Status Badge */
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
  if (norm === "ABSENT") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Absent
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
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {status || "Unknown"}
    </span>
  );
}
