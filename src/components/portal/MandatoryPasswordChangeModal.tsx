"use client";

import React, { useState } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import { KeyRound, Eye, EyeOff, AlertCircle, CheckCircle2, Lock, LogOut } from "lucide-react";

export function MandatoryPasswordChangeModal() {
  const { user, refreshSession, logout } = useUserAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Client-side validation matching backend policy
    if (!currentPassword) {
      setError("Please enter your current temporary password.");
      return;
    }
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters in length.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Submit exclusively to the proxy route (HTTP-only cookie auth, no client-supplied userId)
      const res = await fetch("/api/auth/user/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to change password. Please check your current password.");
        setIsSubmitting(false);
        return;
      }

      // 3. Password changed successfully on backend. Re-verify with backend /api/auth/user/me
      setSuccessMsg(data.message || "Password changed successfully! Unlocking your account…");

      const updatedSession = await refreshSession();
      if (updatedSession?.mustChangePassword) {
        // Fallback guard: backend still reports mustChangePassword
        setError("Password was updated, but the backend requires re-validation. Please wait a moment.");
        setIsSubmitting(false);
      }
      // If mustChangePassword is now false, PortalShell will automatically re-render and unblock portal!
    } catch {
      setError("A network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Top decorative accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#004aad] via-[#f39200] to-[#004aad]" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#f39200]/10 border border-[#f39200]/25 flex items-center justify-center text-[#f39200] mb-3 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Mandatory Password Change
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Welcome, <span className="font-semibold text-slate-700">{user?.name || "Employee"}</span>! For security, you must set a new permanent password before accessing the portal.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div
              role="status"
              className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start gap-2.5 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Current Password */}
            <div>
              <label
                htmlFor="current-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Current Temporary Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#f39200] focus:ring-2 focus:ring-[#f39200]/20 disabled:opacity-60 transition-all pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showCurrent ? "Hide current password" : "Show current password"}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                New Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#f39200] focus:ring-2 focus:ring-[#f39200]/20 disabled:opacity-60 transition-all pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Re-type new password"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#f39200] focus:ring-2 focus:ring-[#f39200]/20 disabled:opacity-60 transition-all pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Policy Notes */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-slate-600">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password requirements:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                <li>At least 8 characters long</li>
                <li>Must differ from your current temporary password</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#f39200] hover:bg-[#e08500] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-4 py-3 text-sm transition-all shadow-md shadow-[#f39200]/20 mt-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Updating password…
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Set New Password & Continue
                </>
              )}
            </button>
          </form>

          {/* Logout option */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={() => void logout()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out and change later</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
