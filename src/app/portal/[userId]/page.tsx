"use client";

import React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";
import { MODULE_LABELS, MODULE_KEYS, type ModuleKey } from "@/types";
import {
  CalendarCheck,
  Package,
  BoxesIcon,
  Users,
  DollarSign,
  BookOpen,
  ClipboardList,
  TrendingUp,
  FileText,
  BarChart3,
  ShieldCheck,
  Mail,
  Hash,
} from "lucide-react";

const MODULE_ICONS: Record<ModuleKey, React.ElementType> = {
  attendance: CalendarCheck,
  assetMaster: BoxesIcon,
  productMaster: Package,
  employeeMaster: Users,
  payrollSheet: DollarSign,
  accountsModule: BookOpen,
  inventoryReport: ClipboardList,
  profitAndLoss: TrendingUp,
  balanceSheet: FileText,
  trialBalance: BarChart3,
};

const MODULE_COLORS: Record<ModuleKey, string> = {
  attendance: "bg-blue-500/10 text-blue-600 border-blue-200",
  assetMaster: "bg-purple-500/10 text-purple-600 border-purple-200",
  productMaster: "bg-green-500/10 text-green-600 border-green-200",
  employeeMaster: "bg-orange-500/10 text-orange-600 border-orange-200",
  payrollSheet: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
  accountsModule: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
  inventoryReport: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  profitAndLoss: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  balanceSheet: "bg-rose-500/10 text-rose-600 border-rose-200",
  trialBalance: "bg-slate-500/10 text-slate-600 border-slate-200",
};

export default function UserDashboard() {
  const params = useParams();
  const userId = params?.userId as string | undefined;
  const { user, isLoading } = useUserAuth();

  // While the session is still being fetched, show a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-7 h-7 text-[#f39200]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  // Guard: the userId in the URL must match the logged-in user's id
  if (!user || userId !== user.userId) {
    notFound();
  }

  const allowedModules = MODULE_KEYS.filter((key) => user.permissions?.[key] === true);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Profile card ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-[#f39200]/15 border border-[#f39200]/30 flex items-center justify-center flex-shrink-0">
          <span className="text-[#f39200] text-2xl font-black">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-slate-800 truncate">{user.name}</h2>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              {user.userId}
            </span>
          </div>
        </div>

        {/* Module count badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f39200]/10 border border-[#f39200]/25 rounded-xl flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#f39200]" />
          <span className="text-sm font-semibold text-[#f39200]">
            {allowedModules.length} module{allowedModules.length !== 1 ? "s" : ""} assigned
          </span>
        </div>
      </div>

      {/* ── Module grid ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Your Modules
        </h3>

        {allowedModules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allowedModules.map((key) => {
              const Icon = MODULE_ICONS[key];
              const colorClass = MODULE_COLORS[key];
              return (
                <Link
                  key={key}
                  href={`/portal/${key}`}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-150"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorClass}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 group-hover:text-[#f39200] transition-colors">
                    {MODULE_LABELS[key]}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">Open module →</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              No modules have been assigned to your account yet.
            </p>
            <p className="text-slate-300 text-xs mt-1">
              Contact your administrator to request access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
