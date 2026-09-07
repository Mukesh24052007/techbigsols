"use client";

import React from "react";
import Link from "next/link";
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

export default function PortalDashboard() {
  const { user } = useUserAuth();

  const allowedModules = MODULE_KEYS.filter(
    (key) => user?.permissions?.[key] === true
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name ?? "User"}
        </h2>
        <p className="text-slate-500 mt-1">
          {allowedModules.length > 0
            ? `You have access to ${allowedModules.length} module${allowedModules.length !== 1 ? "s" : ""}.`
            : "You currently have no modules assigned. Contact your administrator."}
        </p>
      </div>

      {/* Module cards */}
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
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 group-hover:text-[#f39200] transition-colors">
                  {MODULE_LABELS[key]}
                </h3>
                <p className="text-sm text-slate-500 mt-1">View module →</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No modules have been assigned to your account yet.</p>
        </div>
      )}
    </div>
  );
}
