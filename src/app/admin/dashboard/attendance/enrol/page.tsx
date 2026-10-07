"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { TOKEN_KEY } from "@/lib/axios";
import { type PortalUserPublic } from "@/types";
import { AdminFaceEnrolmentModal } from "@/components/admin/AdminFaceEnrolmentModal";
import {
  ScanFace,
  Search,
  RefreshCw,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";

export default function AdminEnrolFacePage() {
  const { isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState<PortalUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<PortalUserPublic | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
      const res = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchUsers();
    }
  }, [isAuthenticated, fetchUsers]);

  // Filter employees with Attendance module
  const attendanceUsers = users.filter((u) => {
    const hasAttendance =
      Array.isArray(u.moduleAccess) &&
      u.moduleAccess.some((m) => m.toLowerCase().includes("attendance"));
    const matchesSearch =
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    return hasAttendance && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Employee Face Enrolment
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enrol face biometric descriptors for employees with Attendance access.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees by name, email, or ID…"
          className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mb-2 text-[#0a4bb3]" />
            <p className="text-xs">Loading employees…</p>
          </div>
        ) : attendanceUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No employees found with Attendance access matching your query.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {attendanceUsers.map((u) => (
              <div
                key={u.user_id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#0a4bb3]/10 text-[#0a4bb3] flex items-center justify-center font-bold text-sm">
                    {u.fullname[0]?.toUpperCase() ?? "E"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{u.fullname}</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {u.user_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0a4bb3] hover:bg-[#083b8f] transition-all shadow-md shadow-[#0a4bb3]/20"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>Enrol / Manage Face</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for camera capture */}
      {selectedUser && (
        <AdminFaceEnrolmentModal
          employee={{
            user_id: selectedUser.user_id,
            fullname: selectedUser.fullname,
            email: selectedUser.email,
          }}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            void fetchUsers();
          }}
        />
      )}
    </div>
  );
}
