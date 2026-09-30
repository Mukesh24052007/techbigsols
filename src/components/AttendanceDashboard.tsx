"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import MarkAttendance, { useLiveCheckins } from "./MarkAttendance";
import { RefreshCw } from "lucide-react";

type Status = "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
type Row = {
  id: string;
  name: string;
  department: string;
  checkIn: string | null;
  method: string | null;
  status: Status;
};

const tm = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const hourIST = (iso: string) =>
  Number(
    new Date(iso).toLocaleString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    })
  );

const badge: Record<Status, string> = {
  PRESENT: "bg-green-100 text-green-700",
  LATE: "bg-amber-100 text-amber-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-blue-100 text-blue-700",
};

const label: Record<Status, string> = {
  PRESENT: "Present",
  LATE: "Late",
  ABSENT: "Absent",
  LEAVE: "On leave",
};

export default function AttendanceDashboard({ initialTab = "live" }: { initialTab?: "live" | "mark" }) {
  const [tab, setTab] = useState<"live" | "mark">(initialTab);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const events = useLiveCheckins(); // SSE real-time check-in stream

  const load = useCallback(async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("tbs_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const r = await fetch("/api/attendance/today", {
        cache: "no-store",
        credentials: "include",
        headers,
      });
      if (r.ok) {
        const data = await r.json();
        setRows(data.rows || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[0] as {
        employeeId: string;
        checkIn: string;
        method: string;
        status: Status;
      };
      if (latest?.employeeId) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === latest.employeeId
              ? {
                  ...r,
                  checkIn: latest.checkIn,
                  method: latest.method || "Biometric",
                  status: latest.status,
                }
              : r
          )
        );
      }
    }
    load();
  }, [load, events]);

  const stats = useMemo(
    () => ({
      present: rows.filter((r) => r.status === "PRESENT" || r.status === "LATE").length,
      late: rows.filter((r) => r.status === "LATE").length,
      absent: rows.filter((r) => r.status === "ABSENT").length,
      leave: rows.filter((r) => r.status === "LEAVE").length,
    }),
    [rows]
  );

  const feed = useMemo(
    () =>
      rows
        .filter((r) => r.checkIn)
        .sort((a, b) => (b.checkIn ?? "").localeCompare(a.checkIn ?? "")),
    [rows]
  );

  const hours = [8, 9, 10, 11, 12, 13];
  const counts = hours.map(
    (h) => rows.filter((r) => r.checkIn && hourIST(r.checkIn) === h).length
  );
  const max = Math.max(1, ...counts);

  const Card = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1100px] text-sm text-slate-900">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Attendance
          </h1>
          <p className="mt-1 text-slate-500 flex items-center">
            <span className="mr-2 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            Live · biometric check-ins tracked in real time
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["live", "mark"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
                tab === t
                  ? "bg-[#0a4bb3] text-white shadow-sm shadow-[#0a4bb3]/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t === "live" ? "Live Board" : "Mark Attendance"}
            </button>
          ))}
        </div>
      </div>

      {tab === "mark" ? (
        <MarkAttendance />
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["Present", stats.present, "text-green-600"],
              ["Late", stats.late, "text-amber-600"],
              ["Not checked in", stats.absent, "text-red-600"],
              ["On leave", stats.leave, "text-[#0a4bb3]"],
            ].map(([l, v, c]) => (
              <Card key={l as string}>
                <div className="font-medium text-slate-500 text-xs uppercase tracking-wider">
                  {l}
                </div>
                <div className={`mt-2 text-[32px] font-bold tracking-tight ${c}`}>
                  {v}
                </div>
              </Card>
            ))}
          </div>

          {/* Feed + Bar Chart */}
          <div className="mb-5 grid gap-5 lg:grid-cols-[1.45fr_1fr]">
            {/* Live Check-ins Feed */}
            <Card>
              <div className="mb-3.5 flex items-center justify-between font-semibold text-slate-800">
                <span>Live check-ins</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-ping" />
                  LIVE
                </span>
              </div>
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 pr-1">
                {feed.length === 0 && (
                  <p className="py-12 text-center text-slate-400">
                    No check-ins yet today.
                  </p>
                )}
                {feed.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-[11px] font-bold text-[#0a4bb3]">
                      {initials(r.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <b className="block font-semibold text-slate-800 truncate">
                        {r.name}
                      </b>
                      <span className="text-xs text-slate-500">
                        {r.department} · {r.method || "Face"} verified · Office geo-fence ✓
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <b className="text-slate-800 text-sm font-semibold">
                        {tm(r.checkIn!)}
                      </b>
                      <br />
                      <span
                        className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge[r.status]}`}
                      >
                        {r.status === "LATE" ? "Late" : "On time"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Check-ins by hour chart */}
            <Card className="flex flex-col justify-between">
              <div>
                <div className="mb-4 font-semibold text-slate-800">
                  Check-ins by hour
                </div>
                <div className="flex h-[140px] items-end gap-3 pt-4">
                  {counts.map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center text-center text-[10px] text-slate-500"
                    >
                      <div className="text-[10px] font-semibold text-slate-400 mb-1">
                        {c > 0 ? c : ""}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-[#0a4bb3] transition-all duration-300"
                        style={{
                          height: `${Math.max(4, (c / max) * 100)}px`,
                        }}
                      />
                      <span className="mt-2 font-medium">
                        {hours[i] > 12 ? hours[i] - 12 : hours[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
                Shift starts 9:30 AM · 10 min grace
              </p>
            </Card>
          </div>

          {/* Today's Register Table */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-base">
                Today&apos;s register
              </span>
              <button
                type="button"
                onClick={() => void load()}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {["Employee", "Dept", "Check-in", "Method", "Status"].map(
                      (h) => (
                        <th key={h} className="p-3">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-slate-800">
                        {r.name}
                      </td>
                      <td className="p-3 text-slate-600">{r.department}</td>
                      <td className="p-3 font-medium text-slate-700">
                        {r.checkIn ? tm(r.checkIn) : "—"}
                      </td>
                      <td className="p-3 text-slate-500">{r.method ?? "—"}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge[r.status]}`}
                        >
                          {label[r.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
