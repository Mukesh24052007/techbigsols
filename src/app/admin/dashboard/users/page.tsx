"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { TOKEN_KEY } from "@/lib/axios";
import { MODULE_KEYS, MODULE_LABELS, type ModuleKey, type PortalUserPublic, type ModulePermissions } from "@/types";
import { UserPlus, Trash2, ShieldCheck, ShieldOff, RefreshCw, X, Eye, EyeOff, CheckSquare, Square } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// Exact strings the backend expects/returns in moduleAccess[]
const BACKEND_MODULE_LABELS: Record<ModuleKey, string> = {
  attendance: "Attendance",
  assetMaster: "Asset master",
  productMaster: "Product master",
  employeeMaster: "Employee master",
  payrollSheet: "Payroll sheet",
  accountsModule: "Accounts module",
  inventoryReport: "Inventory report",
  profitAndLoss: "Profit and loss",
  balanceSheet: "Balance sheet",
  trialBalance: "Trial balance",
};

// ── Create User Modal ────────────────────────────────────────────────────

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateUserModal({ onClose, onCreated }: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [permissions, setPermissions] = useState<ModulePermissions>(
    Object.fromEntries(MODULE_KEYS.map((k) => [k, false])) as ModulePermissions
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const toggle = (key: ModuleKey) =>
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));

  const selectAll = () =>
    setPermissions(Object.fromEntries(MODULE_KEYS.map((k) => [k, true])) as ModulePermissions);

  const clearAll = () =>
    setPermissions(Object.fromEntries(MODULE_KEYS.map((k) => [k, false])) as ModulePermissions);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          fullname: name.trim(),
          email: email.trim(),
          password,
          moduleAccess: MODULE_KEYS.filter((k) => permissions[k]).map((k) => BACKEND_MODULE_LABELS[k]),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create user.");
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Create New User</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body + footer wrapped in one form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label htmlFor="u-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                id="u-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004aad]/30 focus:border-[#004aad] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="u-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="u-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@techbigsolutions.in"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004aad]/30 focus:border-[#004aad] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="u-password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="u-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#004aad]/30 focus:border-[#004aad] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Module Access */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Module Access
                </span>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-xs text-[#004aad] hover:underline">
                    Select all
                  </button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={clearAll} className="text-xs text-slate-400 hover:underline">
                    Clear all
                  </button>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {MODULE_KEYS.map((key) => (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(key)}
                    onKeyDown={(e) => (e.key === " " || e.key === "Enter") && toggle(key)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                  >
                    {permissions[key] ? (
                      <CheckSquare className="w-5 h-5 text-[#004aad] flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="text-sm text-slate-700">{MODULE_LABELS[key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#004aad] hover:bg-[#0056cc] disabled:opacity-60 text-white transition-all shadow-md shadow-[#004aad]/20"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────

export default function UserMasterPage() {
  const { isAuthenticated } = useAdminAuth();
  const [users, setUsers] = useState<PortalUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setUsers(data.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) void fetchUsers();
  }, [isAuthenticated, fetchUsers]);

  const toggleActive = async (user: PortalUserPublic) => {
    setTogglingId(user.user_id);
    try {
      await fetch(`/api/admin/users/${user.user_id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      await fetchUsers();
    } finally {
      setTogglingId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? `Failed to delete user (${res.status}).`);
        return;
      }
      // Optimistically remove from local state — avoids a full reload spinner
      setUsers((prev) => prev.filter((u) => u.user_id !== id));
    } catch {
      setError("Network error — could not delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Master</h2>
          <p className="text-slate-500 mt-1">Create and manage portal user accounts and their module access.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchUsers()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#004aad] hover:bg-[#0056cc] text-white transition-all shadow-md shadow-[#004aad]/20"
          >
            <UserPlus className="w-4 h-4" />
            New User
          </button>
        </div>
      </div>

      {/* Delete error banner */}
      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-600 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table / Empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin w-7 h-7 text-[#004aad]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
          <p className="text-slate-400 font-medium">No users yet.</p>
          <p className="text-slate-300 text-sm mt-1">Click "New User" to create the first portal user.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Modules</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, idx) => (
                <tr key={u.user_id ?? `user-row-${idx}`} className="hover:bg-slate-50 transition-colors">
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#004aad]/10 border border-[#004aad]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#004aad] text-xs font-bold">
                          {u.fullname?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800 truncate">{u.fullname}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        <p className="text-[10px] font-mono text-slate-300 mt-0.5">{u.user_id}</p>
                      </div>
                    </div>
                  </td>
                  {/* Modules */}
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(u.moduleAccess ?? []).slice(0, 4).map((label, i) => (
                        <span key={`${u.user_id}-mod-${i}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#004aad]/8 text-[#004aad]">
                          {label}
                        </span>
                      ))}
                      {(u.moduleAccess?.length ?? 0) > 4 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                          +{(u.moduleAccess?.length ?? 0) - 4} more
                        </span>
                      )}
                      {(u.moduleAccess?.length ?? 0) === 0 && (
                        <span className="text-xs text-slate-300">No access</span>
                      )}
                    </div>
                  </td>
                  {/* Created */}
                  <td className="px-5 py-4 text-slate-400 text-xs hidden md:table-cell">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void toggleActive(u)}
                      disabled={togglingId === u.user_id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {togglingId === u.user_id ? (
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : u.is_active ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <ShieldOff className="w-3 h-3" />
                      )}
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => void deleteUser(u.user_id)}
                      disabled={deletingId === u.user_id}
                      className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-50"
                      aria-label={`Delete ${u.fullname}`}
                    >
                      {deletingId === u.user_id ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CreateUserModal onClose={() => setShowModal(false)} onCreated={fetchUsers} />
      )}
    </div>
  );
}
