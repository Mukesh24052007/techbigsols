import React from "react";
import Link from "next/link";
import { CalendarCheck, ScanFace } from "lucide-react";

export const metadata = {
  title: "Attendance Live Board — Admin Panel | TechBigSolutions",
  description: "Real-time employee attendance tracking and presence monitoring.",
};

export default function AdminAttendancePage() {
  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-[#0a4bb3]/10 text-[#0a4bb3] rounded-xl flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Attendance Live Board</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          The real-time attendance board with presence tracking is being connected to the Express backend.
        </p>

        <div className="flex justify-center">
          <Link
            href="/admin/dashboard/attendance/enrol"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0a4bb3] hover:bg-[#083b8f] shadow-md shadow-[#0a4bb3]/20 transition-all"
          >
            <ScanFace className="w-4 h-4" />
            <span>Go to Employee Face Enrolment</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
