"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";
import { MODULE_LABELS, MODULE_KEYS, type ModuleKey } from "@/types";
import {
  LayoutDashboard,
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
  LogOut,
  X,
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

interface PortalSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function PortalSidebar({ mobileOpen, onClose }: PortalSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useUserAuth();

  const handleLogout = () => { void logout(); };

  const allowedModules = MODULE_KEYS.filter(
    (key) => user?.permissions?.[key] === true
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f39200] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">TBS</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">TechBigSolutions</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">User Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-white/40 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
          Menu
        </p>

        {/* Dashboard home */}
        <Link
          href="/portal"
          onClick={onClose}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            pathname === "/portal"
              ? "bg-[#f39200] text-white shadow-md shadow-[#f39200]/30"
              : "text-white/55 hover:text-white hover:bg-white/8"
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${pathname === "/portal" ? "text-white" : "text-white/40 group-hover:text-white/80"}`} />
          <span className="flex-1">Dashboard</span>
        </Link>

        {allowedModules.length > 0 && (
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mt-5 mb-3">
            My Modules
          </p>
        )}

        {allowedModules.map((key) => {
          const href = `/portal/${key}`;
          const isActive = pathname === href;
          const Icon = MODULE_ICONS[key];
          return (
            <Link
              key={key}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#f39200] text-white shadow-md shadow-[#f39200]/30"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"}`} />
              <span className="flex-1">{MODULE_LABELS[key]}</span>
            </Link>
          );
        })}

        {allowedModules.length === 0 && (
          <p className="text-white/25 text-xs px-3 mt-4">No modules assigned yet.</p>
        )}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-white/8 pt-4">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#f39200]/20 border border-[#f39200]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[#f39200] text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name ?? "User"}</p>
            <p className="text-white/35 text-xs truncate">{user?.email ?? ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#05142b] border-r border-white/8 flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
