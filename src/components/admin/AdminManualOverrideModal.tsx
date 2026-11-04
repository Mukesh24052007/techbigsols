"use client";

import React, { useState } from "react";
import {
  adminAttendanceApi,
  type AdminManualOverridePayload,
} from "@/lib/api/adminAttendanceApi";
import {
  ShieldAlert,
  AlertCircle,
  X,
  User,
  Calendar,
  Clock,
  RotateCw,
} from "lucide-react";

export interface AdminManualOverrideTarget {
  userId: string;
  fullname: string;
  attendanceDate: string;
  currentStatus: string;
}

interface AdminManualOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  target: AdminManualOverrideTarget | null;
}

interface AdminManualOverrideDialogProps {
  target: AdminManualOverrideTarget;
  onClose: () => void;
  onSuccess: () => void;
}

function AdminManualOverrideDialog({
  target,
  onClose,
  onSuccess,
}: AdminManualOverrideDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<"PRESENT" | "ABSENT">(() =>
    target.currentStatus === "PRESENT" ? "ABSENT" : "PRESENT"
  );
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  const trimmedReason = reason.trim();
  const maxReasonLength = 255;
  const remainingChars = maxReasonLength - reason.length;

  const validateForm = (): boolean => {
    setErrorMsg(null);
    if (!trimmedReason) {
      setErrorMsg("A justification reason is mandatory for manual override.");
      return false;
    }
    if (trimmedReason.length > maxReasonLength) {
      setErrorMsg(`Reason must not exceed ${maxReasonLength} characters.`);
      return false;
    }
    if (selectedStatus !== "PRESENT" && selectedStatus !== "ABSENT") {
      setErrorMsg("Status must be either PRESENT or ABSENT.");
      return false;
    }
    return true;
  };

  const handleInitialProceed = () => {
    if (validateForm()) {
      setShowConfirmStep(true);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateForm()) {
      setShowConfirmStep(false);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: AdminManualOverridePayload = {
      userId: target.userId,
      attendanceDate: target.attendanceDate,
      status: selectedStatus,
      reason: trimmedReason,
    };

    try {
      const res = await adminAttendanceApi.submitManualOverride(payload);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to apply manual override.");
        setShowConfirmStep(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply manual override.";
      setErrorMsg(msg);
      setShowConfirmStep(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="override-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 id="override-modal-title" className="text-base font-bold text-slate-900">
                Manual Attendance Override
              </h3>
              <p className="text-xs text-slate-500">
                Administrative adjustment with mandatory audit trail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Target Details Card */}
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" /> Employee:
            </span>
            <span className="font-bold text-slate-800">
              {target.fullname} ({target.userId})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Business Date:
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {target.attendanceDate}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Current Status:
            </span>
            <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-200 text-slate-700">
              {target.currentStatus}
            </span>
          </div>
        </div>

        {/* Form Body or Confirmation Stage */}
        {!showConfirmStep ? (
          <div className="mt-5 space-y-4">
            {/* Status Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                New Attendance Status (Select one):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedStatus("PRESENT")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedStatus === "PRESENT"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium"
                  }`}
                >
                  PRESENT
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStatus("ABSENT")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedStatus === "ABSENT"
                      ? "border-rose-500 bg-rose-50 text-rose-800 font-bold ring-2 ring-rose-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-medium"
                  }`}
                >
                  ABSENT
                </button>
              </div>
            </div>

            {/* Mandatory Reason */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="override-reason"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider"
                >
                  Justification Reason <span className="text-rose-500">*</span>:
                </label>
                <span
                  className={`text-[11px] ${
                    remainingChars < 20 ? "text-rose-600 font-bold" : "text-slate-400"
                  }`}
                >
                  {remainingChars} chars remaining
                </span>
              </div>
              <textarea
                id="override-reason"
                rows={3}
                maxLength={maxReasonLength}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the operational reason for this adjustment (e.g. On-duty client visit, power outage, biometric hardware failure)"
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#f39200]/30 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Mandatory for audit trail compliance. Note: Punch timestamps are preserved per system policy.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInitialProceed}
                disabled={!trimmedReason}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-md shadow-purple-900/20 disabled:opacity-50"
              >
                Review Override
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="mt-5 space-y-4 animate-in fade-in">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <p className="text-xs font-bold text-amber-900 mb-1">
                Please Confirm Manual Override
              </p>
              <p className="text-xs text-amber-800 leading-relaxed">
                You are setting <strong className="font-bold">{target.fullname}</strong> to{" "}
                <span className="font-extrabold uppercase">{selectedStatus}</span> on{" "}
                <span className="font-mono font-semibold">{target.attendanceDate}</span>.
              </p>
              <div className="mt-2.5 pt-2 border-t border-amber-200/80 text-xs text-amber-900">
                <span className="font-semibold">Recorded Reason:</span> &ldquo;{trimmedReason}&rdquo;
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This action will permanently log your administrator ID, the before-and-after state snapshot, and your justification reason in the system audit trail.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmStep(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => void handleFinalSubmit()}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-all shadow-md shadow-purple-900/20 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                <span>{isSubmitting ? "Applying Override…" : "Confirm & Apply"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminManualOverrideModal({
  isOpen,
  onClose,
  onSuccess,
  target,
}: AdminManualOverrideModalProps) {
  if (!isOpen || !target) return null;

  return (
    <AdminManualOverrideDialog
      key={`${target.userId}-${target.attendanceDate}`}
      target={target}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
