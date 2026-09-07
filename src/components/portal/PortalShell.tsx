"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserAuth } from "@/context/UserAuthContext";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { MODULE_LABELS, MODULE_KEYS, type ModuleKey } from "@/types";

function getPageTitle(pathname: string): string {
  // Check module routes
  for (const key of MODULE_KEYS) {
    if (pathname === `/portal/${key}`) return MODULE_LABELS[key];
  }
  return "Dashboard";
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/user/login");
      return;
    }
    // Check module-level permission for /portal/[module] routes
    const moduleMatch = pathname.match(/^\/portal\/([^/]+)$/);
    if (moduleMatch) {
      const key = moduleMatch[1] as ModuleKey;
      if (MODULE_KEYS.includes(key) && user?.permissions?.[key] !== true) {
        router.replace("/portal");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05142b] flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-[#f39200]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <PortalSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <PortalTopbar title={getPageTitle(pathname)} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
