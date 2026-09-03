"use client";

import React from "react";
import { Menu, Bell } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface AdminTopbarProps {
  title: string;
  onMenuClick: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminTopbar({ title, onMenuClick }: AdminTopbarProps) {
  const { admin } = useAdminAuth();
  const initials = admin?.name ? getInitials(admin.name) : "A";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-slate-200/80 shadow-sm flex-shrink-0">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-brand-blue hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h1>
      </div>

      {/* Right: notification bell + avatar */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <div
          className="w-8 h-8 rounded-full bg-[#004aad] flex items-center justify-center text-white text-xs font-bold shadow-sm"
          title={admin?.name ?? "Admin"}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
