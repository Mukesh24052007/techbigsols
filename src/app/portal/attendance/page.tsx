"use client";

import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

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
          Loading Attendance Module…
        </p>
      </div>
    ),
  }
);

export default function PortalAttendancePage() {
  return (
    <div className="py-4">
      <EmployeeAttendanceModule />
    </div>
  );
}
