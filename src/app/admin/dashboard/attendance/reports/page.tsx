"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { TOKEN_KEY } from "@/lib/axios";
import {
  Users,
  RefreshCw,
  Download,
  CalendarDays,
  Clock,
  MapPin,
  AlertTriangle,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

interface MusterRecord {
  user_id: string;
  fullname: string;
  email: string;
  department: string;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  totalWorkedHours: number;
}

type TabKey = "muster" | "latecomers" | "outside" | "violations";

/* ── Component ────────────────────────────────────────────────────── */

export default function AttendanceReportsPage() {
  const { isAuthenticated } = useAdminAuth();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [tab, setTab] = useState<TabKey>("muster");
  const [records, setRecords] = useState<MusterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
      const res = await fetch(
        `/api/admin/attendance/reports?month=${encodeURIComponent(month)}&tab=${tab}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setRecords(json.data ?? json.records ?? []);
      } else {
        // Fallback: fetch users and generate empty records
        const usersRes = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          const users = (usersJson.data ?? []) as Array<{
            user_id: string;
            fullname: string;
            email: string;
            moduleAccess?: string[];
          }>;
          const attendanceUsers = users.filter((u) =>
            Array.isArray(u.moduleAccess) &&
            u.moduleAccess.some((m: string) => m.toLowerCase().includes("attendance"))
          );
          setRecords(
            attendanceUsers.map((u) => ({
              user_id: u.user_id,
              fullname: u.fullname,
              email: u.email,
              department: "—",
              presentDays: 0,
              lateDays: 0,
              absentDays: getDaysInMonth(month),
              leaveDays: 0,
              totalWorkedHours: 0,
            }))
          );
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [month, tab]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchReport();
    }
  }, [isAuthenticated, fetchReport]);

  // Stats
  const totalEmployees = records.length;
  const avgPresentPct = totalEmployees > 0
    ? Math.round(
        (records.reduce((s, r) => s + r.presentDays, 0) /
          (totalEmployees * getDaysInMonth(month))) *
          100
      )
    : 0;
  const lateToday = records.filter((r) => r.lateDays > 0).length;
  const onLeave = records.filter((r) => r.leaveDays > 0).length;

  const handleExport = () => {
    const header = "Employee,Department,Present,Late,Absent,Leave,Worked Hrs";
    const rows = records.map(
      (r) =>
        `"${r.fullname}","${r.department}",${r.presentDays},${r.lateDays},${r.absentDays},${r.leaveDays},${r.totalWorkedHours}h`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "muster", label: "Muster Roll", icon: CalendarDays },
    { key: "latecomers", label: "Late-comers", icon: Clock },
    { key: "outside", label: "Outside Time", icon: MapPin },
    { key: "violations", label: "Violations", icon: AlertTriangle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monthly attendance reports with CSV export.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0a4bb3]/30"
          />
          <button
            onClick={fetchReport}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.key
                ? "bg-[#0a4bb3] text-white shadow-md shadow-[#0a4bb3]/20"
                : "text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Employees
          </p>
          <p className="text-2xl font-bold text-slate-800">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-[#0a4bb3] uppercase tracking-wider mb-1">
            Avg Present %
          </p>
          <p className="text-2xl font-bold text-[#0a4bb3]">{avgPresentPct}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
            Late Today
          </p>
          <p className="text-2xl font-bold text-amber-600">{lateToday}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            On Leave
          </p>
          <p className="text-2xl font-bold text-slate-600">{onLeave}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-[#0a4bb3]" />
            <p className="text-xs">Loading report data…</p>
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">
            No records found for {month}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Dept</th>
                  <th className="pb-3 text-center">Present</th>
                  <th className="pb-3 text-center">Late</th>
                  <th className="pb-3 text-center">Absent</th>
                  <th className="pb-3 text-center">Leave</th>
                  <th className="pb-3 text-right">Worked Hrs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.user_id} className="hover:bg-slate-50/50">
                    <td className="py-3">
                      <div>
                        <span className="font-medium text-slate-800 block">{r.fullname}</span>
                        <span className="text-[10px] text-slate-400">{r.user_id}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{r.department}</td>
                    <td className="py-3 text-center font-semibold text-emerald-600">{r.presentDays}</td>
                    <td className="py-3 text-center font-semibold text-amber-600">{r.lateDays}</td>
                    <td className="py-3 text-center font-semibold text-rose-500">{r.absentDays}</td>
                    <td className="py-3 text-center font-semibold text-blue-600">{r.leaveDays}</td>
                    <td className="py-3 text-right text-slate-600">{r.totalWorkedHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function getDaysInMonth(monthStr: string): number {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
