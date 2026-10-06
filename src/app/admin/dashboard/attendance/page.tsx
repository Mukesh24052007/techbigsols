"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { TOKEN_KEY } from "@/lib/axios";
import {
  CalendarCheck,
  ScanFace,
  RefreshCw,
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  Palmtree,
  Radio,
  UserCheck,
  UserX,
} from "lucide-react";

const EmployeeAttendanceModule = dynamic(
  () =>
    import("@/components/portal/EmployeeAttendanceModule").then(
      (m) => m.EmployeeAttendanceModule
    ),
  { ssr: false }
);

/* ── Types ────────────────────────────────────────────────────────── */

interface EmployeeAttendanceStatus {
  user_id: string;
  fullname: string;
  email: string;
  department?: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE" | "NOT_CHECKED_IN";
  presenceState?: "INSIDE" | "OUTSIDE" | null;
  workedMinutes?: number;
}

interface LiveBoardData {
  employees: EmployeeAttendanceStatus[];
  officeConfig?: {
    name: string;
    shift_start: string;
    grace_minutes: number;
  };
}

/* ── Component ────────────────────────────────────────────────────── */

export default function AdminAttendancePage() {
  const { isAuthenticated } = useAdminAuth();
  const [data, setData] = useState<LiveBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"liveboard" | "markattendance">("liveboard");

  const fetchLiveBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
      const res = await fetch("/api/admin/attendance/live-board", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        setData(json.data ?? json);
      } else {
        // Fallback: fetch users list and build mock live board
        const usersRes = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const users = (usersData.data ?? []) as Array<{
            user_id: string;
            fullname: string;
            email: string;
            moduleAccess?: string[];
          }>;
          const attendanceUsers = users.filter((u) =>
            Array.isArray(u.moduleAccess) &&
            u.moduleAccess.some((m: string) => m.toLowerCase().includes("attendance"))
          );
          setData({
            employees: attendanceUsers.map((u) => ({
              user_id: u.user_id,
              fullname: u.fullname,
              email: u.email,
              department: "—",
              status: "NOT_CHECKED_IN" as const,
              presenceState: null,
              workedMinutes: 0,
            })),
            officeConfig: {
              name: "Main Office",
              shift_start: "09:30",
              grace_minutes: 10,
            },
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchLiveBoard();
    }
  }, [isAuthenticated, fetchLiveBoard]);

  // Compute stats
  const employees = data?.employees ?? [];
  const inOffice = employees.filter(
    (e) => e.presenceState === "INSIDE" && e.status !== "ON_LEAVE"
  ).length;
  const outside = employees.filter(
    (e) => e.presenceState === "OUTSIDE"
  ).length;
  const lateCount = employees.filter((e) => e.status === "LATE").length;
  const notCheckedIn = employees.filter(
    (e) => e.status === "NOT_CHECKED_IN" || e.status === "ABSENT"
  ).length;
  const onLeave = employees.filter((e) => e.status === "ON_LEAVE").length;

  // Check-ins by hour
  const hourBuckets: Record<number, number> = {};
  for (const e of employees) {
    if (e.checkInTime) {
      const h = new Date(e.checkInTime).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    }
  }
  const shiftHour = data?.officeConfig?.shift_start
    ? parseInt(data.officeConfig.shift_start.split(":")[0])
    : 9;
  const hourRange = Array.from({ length: 6 }, (_, i) => shiftHour - 1 + i);
  const maxCheckins = Math.max(1, ...Object.values(hourBuckets));

  // Live events
  const liveEvents = employees
    .filter((e) => e.checkInTime)
    .sort((a, b) => {
      const tA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const tB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return tB - tA;
    })
    .slice(0, 8);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse" />
            Live · face ID check-ins with GPS tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("liveboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "liveboard"
                ? "bg-[#0a4bb3] text-white shadow-md shadow-[#0a4bb3]/20"
                : "text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Live Board
          </button>
          <button
            onClick={() => setActiveTab("markattendance")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "markattendance"
                ? "bg-[#0a4bb3] text-white shadow-md shadow-[#0a4bb3]/20"
                : "text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Mark Attendance
          </button>
          <Link
            href="/admin/dashboard/attendance/enrol"
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ScanFace className="w-3.5 h-3.5 text-[#0a4bb3]" />
            <span>Face Enrolment</span>
          </Link>
        </div>
      </div>

      {activeTab === "markattendance" ? (
        <div className="py-2">
          <EmployeeAttendanceModule />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={UserCheck}
          label="In Office"
          value={inOffice}
          color="emerald"
          dot
        />
        <StatCard
          icon={MapPin}
          label="Outside"
          value={outside}
          color="rose"
          dot
        />
        <StatCard
          icon={Clock}
          label="Late"
          value={lateCount}
          color="amber"
          dot
        />
        <StatCard
          icon={UserX}
          label="Not Checked In"
          value={notCheckedIn}
          color="slate"
        />
        <StatCard
          icon={Palmtree}
          label="On Leave"
          value={onLeave}
          color="blue"
        />
      </div>

      {/* Live Events + Check-ins by Hour */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Events */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Live events</h3>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Radio className="w-3 h-3" />
              LIVE
            </span>
          </div>
          {liveEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No check-ins yet today.</p>
          ) : (
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {liveEvents.map((e) => (
                <div
                  key={e.user_id}
                  className="flex items-center gap-3 text-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0a4bb3]/10 text-[#0a4bb3] flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {e.fullname[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-800 truncate block">
                      {e.fullname}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {e.checkInTime
                      ? new Date(e.checkInTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      e.status === "LATE"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {e.status === "LATE" ? "Late" : "On Time"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Check-ins by Hour */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Check-ins by hour</h3>
          <div className="flex items-end gap-2 h-[140px] mt-4 mb-2">
            {hourRange.map((h) => {
              const count = hourBuckets[h] || 0;
              const pct = Math.max(4, (count / maxCheckins) * 100);
              const isPast = h <= new Date().getHours();
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                    <div
                      className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                        isPast ? "bg-[#0a4bb3]" : "bg-slate-200"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {h > 12 ? h - 12 : h}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Shift starts {data?.officeConfig?.shift_start ?? "9:30"} AM ·{" "}
            {data?.officeConfig?.grace_minutes ?? 10} min grace
          </p>
        </div>
      </div>

      {/* Today's Register Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-slate-800">Today&apos;s register</h3>
          <button
            onClick={fetchLiveBoard}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 mb-4">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-[#0a4bb3]" />
            <p className="text-xs">Loading live board…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Employee</th>
                  <th className="pb-3">Dept</th>
                  <th className="pb-3">Check-in</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Hours Inside</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => {
                  let statusBadge = "bg-rose-50 text-rose-700 border-rose-200";
                  let statusLabel = "Absent";
                  if (e.status === "PRESENT") {
                    statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    statusLabel = "Present";
                  } else if (e.status === "LATE") {
                    statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                    statusLabel = "Late";
                  } else if (e.status === "ON_LEAVE") {
                    statusBadge = "bg-blue-50 text-blue-700 border-blue-200";
                    statusLabel = "On Leave";
                  }

                  const hoursInside = e.workedMinutes
                    ? `${Math.floor(e.workedMinutes / 60)}h ${e.workedMinutes % 60}m`
                    : "0h";

                  return (
                    <tr key={e.user_id} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0a4bb3]/10 text-[#0a4bb3] flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {e.fullname[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 text-sm block">{e.fullname}</span>
                            <span className="text-[10px] text-slate-400">{e.user_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 text-sm">{e.department || "—"}</td>
                      <td className="py-3 text-slate-600 text-sm">
                        {e.checkInTime
                          ? new Date(e.checkInTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="py-3">
                        {e.presenceState === "INSIDE" ? (
                          <span className="text-xs font-medium text-emerald-600">Inside</span>
                        ) : e.presenceState === "OUTSIDE" ? (
                          <span className="text-xs font-medium text-rose-500">Outside</span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600 text-sm">{hoursInside}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                      No employees with attendance access found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  dot,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  dot?: boolean;
}) {
  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", icon: "text-rose-500" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-500" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", icon: "text-slate-400" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500" },
  };

  const c = colorClasses[color] ?? colorClasses.slate;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${c.icon}`} />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text", "bg")} animate-pulse`} />
        )}
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}
