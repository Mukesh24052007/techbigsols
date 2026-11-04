"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  adminAttendanceApi,
  type AdminQrActiveData,
  type AdminQrSessionData,
} from "@/lib/api/adminAttendanceApi";
import {
  QrCode,
  LogIn,
  LogOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  RotateCw,
  Sparkles,
} from "lucide-react";

type QrAction = "CHECK_IN" | "CHECK_OUT";

interface OfficeOption {
  id: number;
  name: string;
}

export function AdminQrDisplay() {
  const [action, setAction] = useState<QrAction>("CHECK_IN");
  const [officeId, setOfficeId] = useState<number>(1);
  const offices: OfficeOption[] = [
    { id: 1, name: "Headquarters (Main)" },
  ];

  // Session state
  const [session, setSession] = useState<AdminQrActiveData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Expiry countdown state
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const kioskContainerRef = useRef<HTMLDivElement | null>(null);

  // Rotation modal state
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [rotationReason, setRotationReason] = useState("");
  const [rotationValidity, setRotationValidity] = useState(15);
  const [rotationError, setRotationError] = useState<string | null>(null);

  // 1. Recover Active QR Session from backend (manual action)
  const refreshActiveSession = useCallback(async () => {
    setIsLoading(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const res = await adminAttendanceApi.getActiveQrSession({
        action,
        officeId,
      });

      if (res.data?.active && res.data.qrToken) {
        setSession(res.data);
        setIsExpired(false);

        if (res.data.expiresAt) {
          const expMs = new Date(res.data.expiresAt.replace(" ", "T") + (res.data.expiresAt.includes("Z") ? "" : "Z")).getTime();
          const rem = Math.max(0, Math.floor((expMs - Date.now()) / 1000));
          setSecondsRemaining(rem);
          setIsExpired(rem <= 0);
        } else if (res.data.secondsRemaining != null) {
          setSecondsRemaining(res.data.secondsRemaining);
          setIsExpired(res.data.secondsRemaining <= 0);
        }
      } else {
        setSession(res.data || { active: false });
        setSecondsRemaining(0);
        setIsExpired(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load active QR session.";
      setErrorBanner(msg);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [action, officeId]);

  // On mount and when action/officeId changes: recover active session via promise without setState in effect body
  useEffect(() => {
    let active = true;

    void adminAttendanceApi
      .getActiveQrSession({ action, officeId })
      .then((res) => {
        if (!active) return;
        if (res.data?.active && res.data.qrToken) {
          setSession(res.data);
          if (res.data.expiresAt) {
            const expMs = new Date(res.data.expiresAt.replace(" ", "T") + (res.data.expiresAt.includes("Z") ? "" : "Z")).getTime();
            const rem = Math.max(0, Math.floor((expMs - Date.now()) / 1000));
            setSecondsRemaining(rem);
            setIsExpired(rem <= 0);
          } else if (res.data.secondsRemaining != null) {
            setSecondsRemaining(res.data.secondsRemaining);
            setIsExpired(res.data.secondsRemaining <= 0);
          }
        } else {
          setSession(res.data || { active: false });
          setSecondsRemaining(0);
          setIsExpired(true);
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : "Failed to load active QR session.";
        setErrorBanner(msg);
        setSession(null);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [action, officeId]);

  // 2. Countdown Timer: derives remaining time from server expiresAt
  useEffect(() => {
    if (!session?.active || !session.expiresAt) return;

    const timer = setInterval(() => {
      const expDate = new Date(session.expiresAt!.replace(" ", "T") + (session.expiresAt!.includes("Z") ? "" : "Z"));
      const rem = Math.max(0, Math.floor((expDate.getTime() - Date.now()) / 1000));
      setSecondsRemaining(rem);

      if (rem <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.active, session?.expiresAt]);

  // 3. Fullscreen Event Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (kioskContainerRef.current?.requestFullscreen) {
          await kioskContainerRef.current.requestFullscreen();
        } else {
          setErrorBanner("Fullscreen mode is not supported on this browser.");
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      setErrorBanner("Could not enter fullscreen mode.");
    }
  };

  // 4. Generate Initial QR Session
  const handleGenerate = async (validityMinutes = 15) => {
    setIsGenerating(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const res = await adminAttendanceApi.generateQrSession({
        action,
        officeId,
        validityMinutes,
        allowRotation: false,
      });

      if (res.success && res.data) {
        const d: AdminQrSessionData = res.data;
        setSession({
          active: true,
          sessionId: d.sessionId,
          qrToken: d.qrToken,
          action: d.action,
          attendanceDate: d.attendanceDate,
          officeId: d.officeId,
          expiresAt: d.expiresAt,
          secondsRemaining: d.secondsRemaining,
          generationSeq: d.generationSeq,
        });
        setIsExpired(false);
        setSecondsRemaining(d.secondsRemaining || validityMinutes * 60);
        setSuccessBanner(res.message || "QR Code session generated successfully.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate QR session.";
      // Check for single gen limit (409)
      if (msg.includes("already been generated today") || msg.includes("SINGLE_GEN_LIMIT") || msg.includes("rotation")) {
        setShowRotationModal(true);
        setRotationError(null);
      } else {
        setErrorBanner(msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 5. Rotate Session with Mandatory Reason
  const handleRotateSubmit = async () => {
    const trimmedReason = rotationReason.trim();
    if (!trimmedReason || trimmedReason.length < 5) {
      setRotationError("A valid justification reason of at least 5 characters is required.");
      return;
    }

    setIsGenerating(true);
    setRotationError(null);

    try {
      const res = await adminAttendanceApi.generateQrSession({
        action,
        officeId,
        validityMinutes: rotationValidity,
        allowRotation: true,
        rotationReason: trimmedReason,
      });

      if (res.success && res.data) {
        const d: AdminQrSessionData = res.data;
        setSession({
          active: true,
          sessionId: d.sessionId,
          qrToken: d.qrToken,
          action: d.action,
          attendanceDate: d.attendanceDate,
          officeId: d.officeId,
          expiresAt: d.expiresAt,
          secondsRemaining: d.secondsRemaining,
          generationSeq: d.generationSeq,
        });
        setIsExpired(false);
        setSecondsRemaining(d.secondsRemaining || rotationValidity * 60);
        setShowRotationModal(false);
        setRotationReason("");
        setSuccessBanner(res.message || "QR session rotated successfully.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to rotate QR session.";
      setRotationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Format countdown mm:ss
  const formatCountdown = (totalSeconds: number | null): string => {
    if (totalSeconds == null || totalSeconds <= 0) return "00:00";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      ref={kioskContainerRef}
      className={`space-y-6 ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-[#031530] p-6 sm:p-10 flex flex-col justify-between overflow-y-auto"
          : ""
      }`}
    >
      {/* ─── Control Header ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Title and Action Tabs */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex p-1 bg-slate-100 rounded-xl" role="tablist" aria-label="QR Action Selection">
            <button
              type="button"
              role="tab"
              aria-selected={action === "CHECK_IN"}
              onClick={() => {
                setAction("CHECK_IN");
                setIsLoading(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                action === "CHECK_IN"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Check-In Display</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={action === "CHECK_OUT"}
              onClick={() => {
                setAction("CHECK_OUT");
                setIsLoading(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                action === "CHECK_OUT"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>Check-Out Display</span>
            </button>
          </div>

          {/* Office selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 font-medium">Office:</span>
            <select
              aria-label="Select Office"
              value={officeId}
              onChange={(e) => {
                setOfficeId(Number(e.target.value));
                setIsLoading(true);
              }}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              {offices.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void refreshActiveSession()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            aria-label="Reload active session"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#f39200]" : ""}`} />
            <span>Sync / Recover</span>
          </button>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen Kiosk Mode"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? "Exit Kiosk" : "Kiosk Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* ─── Notification Banners ─────────────────────────────────────────── */}
      {successBanner && (
        <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div role="alert" className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorBanner}</span>
        </div>
      )}

      {/* ─── Main Kiosk Display Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div
          className={`absolute -top-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${
            action === "CHECK_IN" ? "bg-emerald-500" : "bg-blue-500"
          }`}
        />

        {/* Action Badge & Office Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              action === "CHECK_IN"
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-blue-100 text-blue-800 border border-blue-300"
            }`}
          >
            {action === "CHECK_IN" ? "Official Office Check-In" : "Official Office Check-Out"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Office #{officeId}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          TechBigSolutions Attendance Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
          Open the Employee Portal on your phone, choose QR Attendance, and scan the dynamic code below.
        </p>

        {/* ─── Active QR Frame ────────────────────────────────────────────── */}
        {isLoading && (
          <div className="w-72 h-72 sm:w-80 sm:h-80 my-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
            <RefreshCw className="w-10 h-10 text-[#f39200] animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Checking active QR session…</p>
          </div>
        )}

        {!isLoading && session?.active && !isExpired && session.qrToken && (
          <div className="my-8 flex flex-col items-center animate-in zoom-in-95 duration-200">
            {/* High-contrast QR Container */}
            <div className="p-4 sm:p-5 bg-white rounded-3xl shadow-xl border-4 border-slate-900 flex items-center justify-center">
              <QRCodeSVG
                value={session.qrToken}
                size={260}
                level="H"
                includeMargin={false}
                className="rounded-xl"
              />
            </div>

            {/* Live Countdown Chip */}
            <div
              className={`mt-6 px-5 py-2.5 rounded-full flex items-center gap-2.5 font-bold shadow-md text-sm ${
                (secondsRemaining ?? 0) <= 60
                  ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse"
                  : (secondsRemaining ?? 0) <= 180
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Valid for: {formatCountdown(secondsRemaining)}</span>
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-400">
              {session.attendanceDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {session.attendanceDate}
                </span>
              )}
              {session.generationSeq && (
                <span>Session Seq: #{session.generationSeq}</span>
              )}
              {session.sessionId && (
                <span>ID: #{session.sessionId}</span>
              )}
            </div>
          </div>
        )}

        {/* ─── Expired State ──────────────────────────────────────────────── */}
        {!isLoading && session?.active && isExpired && (
          <div className="w-72 sm:w-80 p-8 my-8 rounded-3xl bg-amber-50 border-2 border-amber-200 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 mb-3 shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-amber-900">QR Session Expired</h3>
            <p className="text-xs text-amber-700 mt-1 max-w-xs leading-relaxed">
              The validity period for this code has expired. Submissions using this code will be rejected by the backend.
            </p>
            <button
              type="button"
              onClick={() => setShowRotationModal(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-900/20"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate / Renew QR</span>
            </button>
          </div>
        )}

        {/* ─── Not Generated State ────────────────────────────────────────── */}
        {!isLoading && (!session || !session.active) && (
          <div className="w-72 sm:w-80 p-8 my-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Active Session</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              No QR code has been generated for {action === "CHECK_IN" ? "Check-In" : "Check-Out"} on today&apos;s date.
            </p>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => void handleGenerate(15)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#004aad] hover:bg-[#003d8f] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate 15m QR Code</span>
            </button>
          </div>
        )}

        {/* ─── Security Notice & Manual Rotate Trigger ────────────────────── */}
        <div className="w-full max-w-md pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Display only inside authorized office perimeter</span>
          {session?.active && !isExpired && (
            <button
              type="button"
              onClick={() => setShowRotationModal(true)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 underline decoration-slate-300 underline-offset-4"
            >
              <RotateCw className="w-3 h-3" />
              <span>Admin Rotate</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Administrative Rotation Modal ─────────────────────────────────── */}
      {showRotationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rotation-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <RotateCw className="w-5 h-5" />
              </div>
              <div>
                <h3 id="rotation-title" className="text-base font-bold text-slate-900">
                  Rotate QR Session
                </h3>
                <p className="text-xs text-slate-500">
                  Audited Administrative Renewal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              The backend enforces a single-generation-per-day rule. Rotating generates a new QR token and invalidates all previous tokens for this business date.
            </p>

            {rotationError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{rotationError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Validity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Validity Duration:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setRotationValidity(mins)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        rotationValidity === mins
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Reason Field */}
              <div>
                <label htmlFor="rotation-reason-input" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Reason for Rotation (Mandatory):
                </label>
                <textarea
                  id="rotation-reason-input"
                  rows={3}
                  value={rotationReason}
                  onChange={(e) => setRotationReason(e.target.value)}
                  placeholder="e.g. Code expired, office reopened for afternoon shift, display terminal rebooted"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f39200]/30 resize-none"
                />
                <span className="text-[11px] text-slate-400">
                  Minimum 5 characters required by server policy.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowRotationModal(false);
                  setRotationError(null);
                }}
                disabled={isGenerating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleRotateSubmit()}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md shadow-amber-900/20 disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                <span>{isGenerating ? "Rotating…" : "Confirm & Rotate"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
