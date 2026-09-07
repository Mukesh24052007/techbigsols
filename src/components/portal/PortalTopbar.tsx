"use client";

import React from "react";
import { Menu } from "lucide-react";

interface PortalTopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function PortalTopbar({ title, onMenuClick }: PortalTopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="text-lg font-semibold text-slate-800 flex-1 truncate">{title}</h1>
      <div className="text-xs text-slate-400 hidden sm:block">TechBigSolutions Portal</div>
    </header>
  );
}
