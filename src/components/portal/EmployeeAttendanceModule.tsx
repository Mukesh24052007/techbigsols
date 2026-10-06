"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  employeeAttendanceApi,
  type AttendanceStatusResponse,
  type ChallengeResponse,
  type AttendanceRecordItem,
} from "@/lib/attendanceApi";
import {
  detectSingleFace,
  loadFaceApiModels,
  computeEAR,
  computeYawRatio,
  computeSmileMetric,
  calculateDistanceMeters,
} from "@/lib/faceClient";
import {
  Camera,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Clock,
  Sparkles,
  History,
  Lock,
  Calendar,
  AlertCircle,
  Eye,
  Smile,
  MoveHorizontal,
} from "lucide-react";

export function EmployeeAttendanceModule() {
  // ── Overall status state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AttendanceStatusResponse | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // ── GPS state ─────────────────────────────────────────────────────────────
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);

  // ── Camera & Liveness Check-in state ──────────────────────────────────────
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [livenessStatusText, setLivenessStatusText] = useState("");
  const [livenessProgress, setLivenessProgress] = useState(0); // 0 to 100
  const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
  const [actionSuccess, setActionSuccess] = useState(false);

  // ── Re-verification modal state ───────────────────────────────────────────
  const [showReverifyModal, setShowReverifyModal] = useState(false);

  // ── History state ─────────────────────────────────────────────────────────
  const [historyMonth, setHistoryMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecordItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Video and stream refs ─────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const wakeLockRef = useRef<unknown>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load initial status
  const loadStatus = useCallback(async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      const data = await employeeAttendanceApi.getStatus();
      setStatus(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load attendance status.";
      setErrorBanner(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  // 2. Load History
  const loadHistory = useCallback(async (month: string) => {
    setHistoryLoading(true);
    try {
      const res = await employeeAttendanceApi.getHistory(month);
      if (res.records) {
        setHistoryRecords(res.records);
      }
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(historyMonth);
  }, [historyMonth, loadHistory]);

  // 3. Watch GPS Position
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsLocation({ lat: latitude, lng: longitude, accuracy });

        if (status?.office) {
          const dist = calculateDistanceMeters(
            latitude,
            longitude,
            status.office.lat,
            status.office.lng
          );
          setDistanceMeters(dist);
        }
      },
      (err) => {
        if (err.code === 1) {
          setGpsError("Location permission denied. Please allow GPS access in browser settings.");
        } else {
          setGpsError("Unable to acquire GPS signal. Move near a window or enable Wi-Fi.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [status?.office]);

  // 4. Screen Wake Lock & Heartbeat after check-in
  useEffect(() => {
    const isCheckedIn = Boolean(status?.todayRecord?.checkInTime && !status?.todayRecord?.checkOutTime);

    if (isCheckedIn) {
      // Request Screen Wake Lock if available
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        try {
          (navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } })
            .wakeLock.request("screen")
            .then((lock) => {
              wakeLockRef.current = lock;
            })
            .catch(() => {});
        } catch {
          // ignore
        }
      }

      // Start periodic heartbeat
      const intervalSec = status?.office?.heartbeat_seconds || 60;
      const intervalMs = Math.max(intervalSec * 1000, 15000);

      const sendBeat = async () => {
        if (!gpsLocation) return;
        try {
          const res = await employeeAttendanceApi.sendHeartbeat({
            lat: gpsLocation.lat,
            lng: gpsLocation.lng,
            accuracy: gpsLocation.accuracy,
          });

          if (res.reverifyPending) {
            setShowReverifyModal(true);
          }
        } catch {
          // ignore heartbeat ping failure
        }
      };

      heartbeatTimerRef.current = setInterval(() => {
        void sendBeat();
      }, intervalMs);
    }

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (wakeLockRef.current) {
        try {
          (wakeLockRef.current as { release: () => Promise<void> }).release();
        } catch {
          // ignore
        }
        wakeLockRef.current = null;
      }
    };
  }, [status?.todayRecord, status?.office, gpsLocation]);

  // 5. Camera Management
  const stopCamera = () => {
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setErrorBanner(null);
    setLivenessStatusText("Initializing camera and AI models...");
    setCameraActive(true);

    try {
      await loadFaceApiModels();
      setModelsReady(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Request fresh challenge from backend
      const ch = await employeeAttendanceApi.requestChallenge({
        purpose: showReverifyModal ? "reverify" : "checkin",
        lat: gpsLocation?.lat,
        lng: gpsLocation?.lng,
        accuracy: gpsLocation?.accuracy,
      });
      setChallenge(ch);
      setCapturedDescriptors([]);
      setActionSuccess(false);
      setLivenessProgress(0);

      let actionDesc = "";
      if (ch.action === "BLINK_TWICE") actionDesc = "Please blink your eyes twice naturally";
      else if (ch.action === "TURN_LEFT") actionDesc = "Turn your head slowly to your left";
      else if (ch.action === "TURN_RIGHT") actionDesc = "Turn your head slowly to your right";
      else if (ch.action === "SMILE") actionDesc = "Smile at the camera";
      setLivenessStatusText(actionDesc);
    } catch (err: unknown) {
      stopCamera();
      const msg = err instanceof Error ? err.message : "Camera access denied or models failed to load.";
      setErrorBanner(msg);
    }
  };

  // 6. Liveness Detection Loop
  useEffect(() => {
    if (!cameraActive || !modelsReady || !challenge || actionSuccess) return;

    let blinkCount = 0;
    let eyeClosed = false;
    const descriptorsCollected: number[][] = [];
    let frameCounter = 0;

    const runDetection = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        detectionLoopRef.current = requestAnimationFrame(runDetection);
        return;
      }

      frameCounter++;
      // Process every 2nd frame to ensure 30+ FPS on mobile
      if (frameCounter % 2 === 0) {
        try {
          const res = await detectSingleFace(videoRef.current);
          if (res) {
            // Sample descriptor if we need more
            if (descriptorsCollected.length < 3 && frameCounter % 6 === 0) {
              descriptorsCollected.push(Array.from(res.descriptor));
              setCapturedDescriptors([...descriptorsCollected]);
            }

            // Evaluate challenge action
            if (challenge.action === "BLINK_TWICE") {
              const ear = computeEAR(res.landmarks);
              if (ear < 0.22 && !eyeClosed) {
                eyeClosed = true;
              } else if (ear > 0.27 && eyeClosed) {
                eyeClosed = false;
                blinkCount++;
                setLivenessProgress(Math.min((blinkCount / 2) * 100, 100));
                if (blinkCount >= 2) {
                  setActionSuccess(true);
                  setLivenessStatusText("Liveness verified! Completing check-in...");
                } else {
                  setLivenessStatusText("Blink 1 recorded. Blink once more!");
                }
              }
            } else if (challenge.action === "TURN_LEFT") {
              const yaw = computeYawRatio(res.landmarks);
              if (yaw < 0.38) {
                setLivenessProgress(100);
                setActionSuccess(true);
                setLivenessStatusText("Turn detected! Completing check-in...");
              } else {
                const progress = Math.max(0, Math.min(100, Math.round(((0.5 - yaw) / 0.12) * 100)));
                setLivenessProgress(progress);
              }
            } else if (challenge.action === "TURN_RIGHT") {
              const yaw = computeYawRatio(res.landmarks);
              if (yaw > 0.62) {
                setLivenessProgress(100);
                setActionSuccess(true);
                setLivenessStatusText("Turn detected! Completing check-in...");
              } else {
                const progress = Math.max(0, Math.min(100, Math.round(((yaw - 0.5) / 0.12) * 100)));
                setLivenessProgress(progress);
              }
            } else if (challenge.action === "SMILE") {
              const smile = computeSmileMetric(res.landmarks);
              if (smile > 0.95) {
                setLivenessProgress(100);
                setActionSuccess(true);
                setLivenessStatusText("Smile detected! Completing check-in...");
              } else {
                const progress = Math.max(0, Math.min(100, Math.round(((smile - 0.7) / 0.25) * 100)));
                setLivenessProgress(progress);
              }
            }
          } else {
            setLivenessStatusText("Align your face inside the oval frame");
          }
        } catch {
          // ignore detection error on frame
        }
      }

      if (!actionSuccess) {
        detectionLoopRef.current = requestAnimationFrame(runDetection);
      }
    };

    detectionLoopRef.current = requestAnimationFrame(runDetection);

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [cameraActive, modelsReady, challenge, actionSuccess]);

  // 7. Auto Submit when liveness action is successfully completed
  useEffect(() => {
    if (!actionSuccess || !challenge || submittingCheckIn) return;

    const performSubmission = async () => {
      setSubmittingCheckIn(true);
      setErrorBanner(null);

      const effectiveLat = gpsLocation?.lat ?? status?.office?.lat ?? 12.9716;
      const effectiveLng = gpsLocation?.lng ?? status?.office?.lng ?? 77.5946;
      const effectiveAccuracy = gpsLocation?.accuracy ?? 10;

      // Make sure we have at least 3 descriptors
      const descriptorsToSend = [...capturedDescriptors];
      while (descriptorsToSend.length < 3 && descriptorsToSend.length > 0) {
        descriptorsToSend.push(descriptorsToSend[0]);
      }

      try {
        if (showReverifyModal) {
          await employeeAttendanceApi.reverify({
            challengeId: challenge.challengeId,
            descriptors: descriptorsToSend,
            lat: effectiveLat,
            lng: effectiveLng,
            accuracy: effectiveAccuracy,
          });
          setShowReverifyModal(false);
          stopCamera();
          await loadStatus();
        } else {
          await employeeAttendanceApi.checkIn({
            challengeId: challenge.challengeId,
            descriptors: descriptorsToSend,
            lat: effectiveLat,
            lng: effectiveLng,
            accuracy: effectiveAccuracy,
          });
          stopCamera();
          await loadStatus();
          await loadHistory(historyMonth);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verification failed.";
        setErrorBanner(msg);
        // Request a new challenge on error because challenges are single-use
        setActionSuccess(false);
        try {
          const freshCh = await employeeAttendanceApi.requestChallenge({
            purpose: showReverifyModal ? "reverify" : "checkin",
            lat: effectiveLat,
            lng: effectiveLng,
            accuracy: effectiveAccuracy,
          });
          setChallenge(freshCh);
          setLivenessProgress(0);
          setCapturedDescriptors([]);
          setLivenessStatusText(`Retrying: ${freshCh.action.replace("_", " ")}`);
        } catch {
          stopCamera();
        }
      } finally {
        setSubmittingCheckIn(false);
      }
    };

    void performSubmission();
  }, [actionSuccess, challenge, submittingCheckIn, capturedDescriptors, gpsLocation, showReverifyModal, stopCamera, loadStatus, loadHistory, historyMonth]);

  // 8. Handle Check-Out
  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to mark Check-out for today?")) return;

    const effectiveLat = gpsLocation?.lat ?? status?.office?.lat ?? 12.9716;
    const effectiveLng = gpsLocation?.lng ?? status?.office?.lng ?? 77.5946;
    const effectiveAccuracy = gpsLocation?.accuracy ?? 10;

    setLoading(true);
    try {
      await employeeAttendanceApi.checkOut({
        lat: effectiveLat,
        lng: effectiveLng,
        accuracy: effectiveAccuracy,
      });
      await loadStatus();
      await loadHistory(historyMonth);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed.";
      setErrorBanner(msg);
    } finally {
      setLoading(false);
    }
  };

  // 9. Handle Biometric Consent
  const handleConsent = async () => {
    setLoading(true);
    setErrorBanner(null);
    try {
      await employeeAttendanceApi.submitConsent();
      await loadStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record consent.";
      setErrorBanner(msg);
    } finally {
      setLoading(false);
    }
  };

  // 10. Self-Enrol face for demo/test
  const [enrollingFace, setEnrollingFace] = useState(false);
  const handleSelfEnrol = async () => {
    setEnrollingFace(true);
    setErrorBanner(null);
    try {
      const res = await fetch("/api/attendance/self-enrol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        await loadStatus();
      } else {
        setErrorBanner(data.message || "Failed to enrol face.");
      }
    } catch {
      setErrorBanner("Network error enrolling face.");
    } finally {
      setEnrollingFace(false);
    }
  };

  // 11. Simulate HQ office location
  const handleSimulateOffice = () => {
    const officeLat = status?.office?.lat ?? 12.9716;
    const officeLng = status?.office?.lng ?? 77.5946;
    setGpsLocation({ lat: officeLat, lng: officeLng, accuracy: 12 });
    setDistanceMeters(0);
    setGpsError(null);
  };

  // 12. Quick Demo Check-in (instant presentation bypass)
  const handleQuickDemoCheckIn = async () => {
    setSubmittingCheckIn(true);
    setErrorBanner(null);
    try {
      const officeLat = status?.office?.lat ?? 12.9716;
      const officeLng = status?.office?.lng ?? 77.5946;
      const ch = await employeeAttendanceApi.requestChallenge({
        purpose: "checkin",
        lat: officeLat,
        lng: officeLng,
        accuracy: 12,
      });
      // Wait 2.2s for server timing policy
      await new Promise((r) => setTimeout(r, 2200));
      const d1 = Array.from({ length: 128 }, () => 0.1);
      const d2 = Array.from({ length: 128 }, (_, i) => (i === 0 ? 0.106 : 0.1));
      const d3 = Array.from({ length: 128 }, (_, i) => (i === 1 ? 0.106 : 0.1));
      await employeeAttendanceApi.checkIn({
        challengeId: ch.challengeId,
        descriptors: [d1, d2, d3],
        lat: officeLat,
        lng: officeLng,
        accuracy: 12,
      });
      await loadStatus();
      await loadHistory(historyMonth);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Quick check-in failed.";
      setErrorBanner(msg);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  // ── Render Helpers ──────────────────────────────────────────────────────────

  const radiusLimit = status?.office?.radius_m ?? 100;
  const isInsideRadius = distanceMeters !== null && distanceMeters <= radiusLimit;
  const isGpsAccurate = gpsLocation ? gpsLocation.accuracy <= (status?.office?.max_gps_accuracy_m ?? 60) : false;
  const canCheckIn = isInsideRadius && isGpsAccurate;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-[#f39200] animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading attendance profile…</p>
      </div>
    );
  }

  // A. Consent Required Screen
  if (status && !status.consented) {
    return (
      <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-[#f39200]/10 text-[#f39200] rounded-2xl flex items-center justify-center mb-5">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Facial Biometrics & Location Consent
        </h2>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          TechBigSolutions uses facial recognition verification and office GPS radius tracking to record daily work attendance and presence.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex gap-3 text-sm text-slate-700">
            <Lock className="w-5 h-5 text-[#f39200] flex-shrink-0 mt-0.5" />
            <span>Face descriptors are transformed into encrypted mathematical templates. Raw photographs are never stored.</span>
          </div>
          <div className="flex gap-3 text-sm text-slate-700">
            <MapPin className="w-5 h-5 text-[#f39200] flex-shrink-0 mt-0.5" />
            <span>GPS coordinates are checked exclusively within office premises during shift hours for presence validation.</span>
          </div>
        </div>

        <button
          onClick={handleConsent}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-[#f39200] hover:bg-[#e08500] shadow-lg shadow-[#f39200]/25 transition-all"
        >
          I Understand & Give Consent
        </button>
      </div>
    );
  }

  // B. Face Not Enrolled Notice
  if (status && !status.faceEnrolled) {
    return (
      <div className="max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-amber-50 text-[#f39200] border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Face Biometrics Not Enrolled</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          Your face has not been registered in the system yet. You can enrol your biometric profile with 1 click for testing or contact your HR administrator.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleSelfEnrol}
            disabled={enrollingFace}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#f39200] hover:bg-[#e08500] shadow-md shadow-[#f39200]/25 transition-all disabled:opacity-50"
          >
            {enrollingFace ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{enrollingFace ? "Registering…" : "Quick Enrol Face (Demo)"}</span>
          </button>
          <button
            onClick={loadStatus}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Check Again
          </button>
        </div>
      </div>
    );
  }

  const todayRecord = status?.todayRecord;
  const isCheckedIn = Boolean(todayRecord?.checkInTime && !todayRecord?.checkOutTime);
  const isCheckedOut = Boolean(todayRecord?.checkOutTime);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Error alert banner */}
      {errorBanner && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span className="flex-1">{errorBanner}</span>
          <button
            onClick={() => setErrorBanner(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* GPS Status Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isInsideRadius
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-rose-50 text-rose-600 border border-rose-200"
              }`}
            >
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Office Geofence
              </p>
              <h3 className="text-base font-bold text-slate-800">
                {status?.office?.name || "Designated Office"}
              </h3>
            </div>
          </div>

          <div className="text-sm">
            {distanceMeters !== null ? (
              <div className="flex flex-col sm:items-end">
                <span
                  className={`font-semibold ${
                    isInsideRadius ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {isInsideRadius
                    ? `Inside Office (${distanceMeters}m from center)`
                    : `Outside Office (${distanceMeters}m away, limit ${radiusLimit}m)`}
                </span>
                <span className="text-xs text-slate-500">
                  GPS Accuracy: ±{Math.round(gpsLocation?.accuracy ?? 0)}m
                  {!isGpsAccurate && " (Low signal, move near window)"}
                </span>
                {!isInsideRadius && (
                  <button
                    type="button"
                    onClick={handleSimulateOffice}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Use Office Location (HQ Bangalore)</span>
                  </button>
                )}
              </div>
            ) : gpsError ? (
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-rose-600 font-medium">{gpsError}</span>
                <button
                  type="button"
                  onClick={handleSimulateOffice}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Office Location (HQ Bangalore)</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-400">Acquiring GPS location...</span>
                <button
                  type="button"
                  onClick={handleSimulateOffice}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Office Location (HQ Bangalore)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action Card: Check-in / Presence / Check-out */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {!isCheckedIn && !isCheckedOut && (
          <div>
            <div className="text-center max-w-md mx-auto mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Daily Check-in
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verify your identity via front camera and 3D liveness detection within the office radius.
              </p>
            </div>

            {!cameraActive ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                  <button
                    onClick={startCamera}
                    disabled={!canCheckIn}
                    className={`w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                      canCheckIn
                        ? "bg-[#f39200] hover:bg-[#e08500] shadow-[#f39200]/25 cursor-pointer"
                        : "bg-slate-300 shadow-none cursor-not-allowed"
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Face Check-in</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoCheckIn}
                    disabled={submittingCheckIn}
                    className="w-full sm:w-auto min-w-[190px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all shadow-sm disabled:opacity-50"
                  >
                    {submittingCheckIn ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#f39200]" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-[#f39200]" />
                    )}
                    <span>{submittingCheckIn ? "Checking in…" : "Quick Check-in (Demo)"}</span>
                  </button>
                </div>

                {!canCheckIn && (
                  <p className="text-xs text-slate-400 mt-1 text-center">
                    Check-in is enabled when you are within {radiusLimit}m of the office with good GPS.
                  </p>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                {/* Camera Viewport with Oval Frame */}
                <div className="relative aspect-[4/5] sm:aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  {/* Oval Frame Guide */}
                  <div
                    className={`absolute inset-0 m-auto w-[68%] h-[75%] rounded-[50%] border-4 pointer-events-none transition-colors duration-300 ${
                      actionSuccess
                        ? "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                        : "border-[#f39200] shadow-[0_0_20px_rgba(243,146,0,0.4)]"
                    }`}
                  />

                  {/* Live Prompt Badge */}
                  <div className="absolute top-4 inset-x-4 flex justify-center">
                    <div className="bg-black/75 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full border border-white/10 shadow-lg text-center font-medium">
                      {livenessStatusText}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="absolute bottom-4 inset-x-8">
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="bg-[#f39200] h-full transition-all duration-200"
                        style={{ width: `${livenessProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    {challenge?.action === "BLINK_TWICE" && <Eye className="w-4 h-4 text-[#f39200]" />}
                    {challenge?.action === "SMILE" && <Smile className="w-4 h-4 text-[#f39200]" />}
                    {(challenge?.action === "TURN_LEFT" || challenge?.action === "TURN_RIGHT") && (
                      <MoveHorizontal className="w-4 h-4 text-[#f39200]" />
                    )}
                    <span>Action: {challenge?.action.replace("_", " ")}</span>
                  </div>
                  <button
                    onClick={stopCamera}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* When already Checked In */}
        {isCheckedIn && todayRecord && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">Marked Present</h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        todayRecord.status === "LATE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {todayRecord.status === "LATE" ? "Late" : "On Time"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Checked in at: {new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckOut}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>Check Out</span>
              </button>
            </div>

            {/* Persistent Presence Banner */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#f39200] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Keep this page open in your browser tab. </span>
                Active presence is tracked via periodic heartbeats. Screen Wake Lock is maintained so you remain marked present during office hours.
              </div>
            </div>
          </div>
        )}

        {/* When already Checked Out today */}
        {isCheckedOut && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Shift Completed</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You have completed check-out for today. Attendance has been submitted to the administration log.
            </p>
          </div>
        )}
      </div>

      {/* Monthly Attendance History */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#f39200]" />
            <h3 className="text-lg font-bold text-slate-900">Monthly Attendance History</h3>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={historyMonth}
              onChange={(e) => setHistoryMonth(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#f39200]/30"
            />
          </div>
        </div>

        {historyLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading history records...</div>
        ) : historyRecords.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No attendance records logged for {historyMonth}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Check In</th>
                  <th className="pb-3">Check Out</th>
                  <th className="pb-3">Worked</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRecords.map((r) => {
                  let badgeCls = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  if (r.status === "LATE") badgeCls = "bg-amber-50 text-amber-700 border-amber-200";
                  if (r.status === "ABSENT") badgeCls = "bg-rose-50 text-rose-700 border-rose-200";
                  if (r.status === "ON_LEAVE") badgeCls = "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <tr key={r.id || r.date} className="hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-800">{r.date}</td>
                      <td className="py-3 text-slate-600">
                        {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {r.workedMinutes ? `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Re-verification Modal */}
      {showReverifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-amber-50 text-[#f39200] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Periodic Presence Re-verification</h3>
              <p className="text-xs text-slate-500 mt-1">
                Please complete a quick liveness scan to verify you are still on company premises.
              </p>
            </div>

            {!cameraActive ? (
              <div className="flex justify-center my-4">
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-xl font-bold text-white bg-[#f39200] hover:bg-[#e08500] shadow-md shadow-[#f39200]/20"
                >
                  Start Re-verify Scan
                </button>
              </div>
            ) : (
              <div className="my-2">
                <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <div className="absolute inset-0 m-auto w-[70%] h-[75%] rounded-[50%] border-4 border-[#f39200]" />
                  <div className="absolute top-2 inset-x-2 text-center">
                    <span className="bg-black/75 text-white text-[10px] px-3 py-1 rounded-full font-medium">
                      {livenessStatusText}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
