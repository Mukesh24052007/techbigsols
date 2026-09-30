"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  CalendarCheck,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  subItems?: { label: string; href: string }[];
  requiresModule?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/dashboard/products", icon: Package },
  { label: "User Master", href: "/admin/dashboard/users", icon: Users },
  {
    label: "Attendance",
    href: "/admin/dashboard/attendance",
    icon: CalendarCheck,
    requiresModule: "Attendance",
    subItems: [
      { label: "Live Board", href: "/admin/dashboard/attendance" },
      { label: "Leave & Reports", href: "/admin/dashboard/attendance?tab=reports" },
    ],
  },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    void logout();
  };

  // Check if admin has access to module (Super Admins, Dev Admin, or specific moduleAccess)
  const hasModuleAccess = (requiredModule?: string) => {
    if (!requiredModule) return true;
    if (!admin) return true; // Fallback during initial load
    if (admin.role === "admin" || admin.id === "dev-admin") return true;

    // Check if admin object has moduleAccess array
    const accessList = (admin as unknown as { moduleAccess?: string[] }).moduleAccess;
    if (Array.isArray(accessList)) {
      return accessList.some(
        (m) => m.toLowerCase() === requiredModule.toLowerCase()
      );
    }
    return true;
  };

  const visibleNavItems = navItems.filter((item) =>
    hasModuleAccess(item.requiresModule)
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#031530]">
      {/* Logo / Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0a4bb3] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">TBS</span>
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">
              TechBigSolutions
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden text-white/40 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {visibleNavItems.map(({ label, href, icon: Icon, subItems }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin/dashboard" && pathname.startsWith(href));

          return (
            <div key={href} className="space-y-1">
              <Link
                href={href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#0a4bb3] text-white shadow-md shadow-[#0a4bb3]/30"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? "text-white"
                      : "text-white/40 group-hover:text-white/80"
                  }`}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                )}
              </Link>

              {/* Sub-items when active */}
              {subItems && isActive && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                  {subItems.map((sub) => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      onClick={onClose}
                      className="block px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150 group"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-[#031530] border-r border-white/8 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex flex-col w-72 bg-[#031530] h-full shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
