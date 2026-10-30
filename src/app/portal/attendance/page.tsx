"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { RefreshCw, QrCode, ScanFace } from "lucide-react";

// Existing Face ID + GPS attendance module (kept completely isolated and untouched)
const EmployeeAttendanceModule = dynamic(
  () =>
    import("@/components/portal/EmployeeAttendanceModule").then(
      (mod) => mod.EmployeeAttendanceModule
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <RefreshCw className="w-8 h-8 text-[#f39200] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Loading Face ID Attendance Module…
        </p>
      </div>
    ),
  }
);

// Attendance 2.0 QR attendance module
const EmployeeQrAttendanceModule = dynamic(
  () =>
    import("@/components/portal/EmployeeQrAttendanceModule").then(
      (mod) => mod.EmployeeQrAttendanceModule
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[350px]">
        <RefreshCw className="w-8 h-8 text-[#f39200] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Loading QR Attendance Module…
        </p>
      </div>
    ),
  }
);

type AttendanceSystemMode = "qr" | "face_gps";

export default function PortalAttendancePage() {
  const [mode, setMode] = useState<AttendanceSystemMode>("qr");

  return (
    <div className="py-4 space-y-6">
      {/* System Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Attendance Method:
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Attendance Method"
          className="flex p-1 bg-slate-100 rounded-xl"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "qr"}
            onClick={() => setMode("qr")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === "qr"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <QrCode className="w-4 h-4 text-[#f39200]" />
            <span>QR Attendance</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              2.0
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "face_gps"}
            onClick={() => setMode("face_gps")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              mode === "face_gps"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ScanFace className="w-4 h-4 text-blue-600" />
            <span>Face ID &amp; GPS</span>
          </button>
        </div>
      </div>

      {/* Render selected module */}
      {mode === "qr" ? (
        <EmployeeQrAttendanceModule />
      ) : (
        <EmployeeAttendanceModule />
      )}
    </div>
  );
}
