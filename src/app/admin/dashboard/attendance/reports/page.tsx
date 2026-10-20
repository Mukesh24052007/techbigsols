import React from "react";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Attendance Reports — Admin Panel | TechBigSolutions",
  description: "View and export employee monthly attendance reports.",
};

export default function AttendanceReportsPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-[#0a4bb3]/10 text-[#0a4bb3] rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Attendance Reports</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Attendance reports and muster roll exports coming soon.
        </p>
      </div>
    </div>
  );
}
