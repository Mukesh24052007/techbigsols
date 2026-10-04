import React from "react";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Office Settings — Attendance | TechBigSolutions",
  description: "Configure office locations and radius settings.",
};

export default function OfficeSettingsPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-[#0a4bb3]/10 text-[#0a4bb3] rounded-xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Office Settings</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Office radius rules and configuration settings coming soon.
        </p>
      </div>
    </div>
  );
}
