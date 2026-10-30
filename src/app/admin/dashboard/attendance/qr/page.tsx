"use client";

import React from "react";
import dynamic from "next/dynamic";
import { RefreshCw } from "lucide-react";

const AdminQrDisplay = dynamic(
  () =>
    import("@/components/admin/AdminQrDisplay").then(
      (mod) => mod.AdminQrDisplay
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#004aad] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Loading Attendance QR Display Terminal…
        </p>
      </div>
    ),
  }
);

export default function AdminAttendanceQrPage() {
  return (
    <div className="py-2">
      <AdminQrDisplay />
    </div>
  );
}
