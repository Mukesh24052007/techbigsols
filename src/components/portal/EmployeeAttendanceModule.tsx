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
  Sparkles,
  History,
  Lock,
  Calendar,
  AlertCircle,
  Eye,
  Smile,
  MoveHorizontal,
} from "lucide-react";

function getFreshPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    });
  });
}

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
    fixTimestamp?: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [locationRejection, setLocationRejection] = useState<string | null>(null);

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
      if (data.reverifyRequired || data.reverifyPending) {
        setShowReverifyModal(true);
      }
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

  // Helper to acquire a fresh position and validate geofence limits
  const checkFreshLocation = useCallback(async () => {
    try {
      const pos = await getFreshPosition();
      const { latitude, longitude, accuracy } = pos.coords;
      const fixTimestamp = pos.timestamp;
      setGpsError(null);
      setGpsLocation({ lat: latitude, lng: longitude, accuracy, fixTimestamp });

      if (status?.office) {
        const dist = calculateDistanceMeters(
          latitude,
          longitude,
          Number(status.office.lat),
          Number(status.office.lng)
        );
        setDistanceMeters(dist);

        const radius = Number(status.office.radius_m) || 150;
        const configuredMaxAcc = Number(status.office.accuracy_max_m) || 200;
        const maxAcc = Math.max(configuredMaxAcc, dist <= radius ? 250 : 100);

        if (dist > radius) {
          setLocationRejection("Location verification failed: You are outside the authorized office premises.");
        } else if (accuracy > maxAcc) {
          setLocationRejection("GPS signal is too weak. Move near a window or an open area and try again.");
        } else {
          setLocationRejection(null);
        }
      }
      return pos;
    } catch (err: unknown) {
      let msg = "Unable to acquire GPS signal. Move near a window or enable Wi-Fi.";
      if (err instanceof GeolocationPositionError && err.code === 1) {
        msg = "Location permission denied. Please allow GPS access in browser settings.";
      }
      setGpsError(msg);
      setLocationRejection(msg);
      return null;
    }
  }, [status?.office]);

  // 3. Continuous GPS Watch
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null);
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsLocation({ lat: latitude, lng: longitude, accuracy, fixTimestamp: pos.timestamp });

        if (status?.office) {
          const dist = calculateDistanceMeters(
            latitude,
            longitude,
            Number(status.office.lat),
            Number(status.office.lng)
          );
          setDistanceMeters(dist);

          const radius = Number(status.office.radius_m) || 150;
          const configuredMaxAcc = Number(status.office.accuracy_max_m) || 200;
          const maxAcc = Math.max(configuredMaxAcc, dist <= radius ? 250 : 100);
          if (dist > radius) {
            setLocationRejection("Location verification failed: You are outside the authorized office premises.");
          } else if (accuracy > maxAcc) {
            setLocationRejection("GPS signal is too weak. Move near a window or an open area and try again.");
          } else {
            setLocationRejection(null);
          }
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
        maximumAge: 0,
        timeout: 15000,
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
        let lat = gpsLocation?.lat;
        let lng = gpsLocation?.lng;
        let accuracy = gpsLocation?.accuracy;
        let fixTimestamp = gpsLocation?.fixTimestamp ?? Date.now();

        try {
          const pos = await getFreshPosition();
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          accuracy = pos.coords.accuracy;
          fixTimestamp = pos.timestamp;
          setGpsLocation({ lat, lng, accuracy, fixTimestamp });
        } catch {
          // fallback to current coordinates
        }

        if (lat === undefined || lng === undefined || accuracy === undefined) return;
        try {
          const res = await employeeAttendanceApi.sendHeartbeat({
            lat,
            lng,
            accuracy,
            fixTimestamp,
          });

          if (res.reverifyRequired || res.reverifyPending) {
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
  const stopCamera = useCallback(() => {
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
  }, []);

  const startCamera = async () => {
    setErrorBanner(null);
    setLivenessStatusText("Requesting fresh GPS position…");

    // 1. Always request fresh position right before challenge
    let freshPos: GeolocationPosition | null = null;
    try {
      freshPos = await getFreshPosition();
    } catch (err: unknown) {
      const msg =
        err instanceof GeolocationPositionError && err.code === 1
          ? "Location permission denied. Please allow GPS access in browser settings."
          : "GPS signal is too weak. Move near a window or an open area and try again.";
      setGpsError(msg);
      setLocationRejection(msg);
      setErrorBanner(msg);
      return;
    }

    const { latitude, longitude, accuracy } = freshPos.coords;
    const fixTimestamp = freshPos.timestamp;
    setGpsLocation({ lat: latitude, lng: longitude, accuracy, fixTimestamp });

    if (status?.office) {
      const dist = calculateDistanceMeters(
        latitude,
        longitude,
        Number(status.office.lat),
        Number(status.office.lng)
      );
      setDistanceMeters(dist);

      const radius = Number(status.office.radius_m) || 150;
      const configuredMaxAcc = Number(status.office.accuracy_max_m) || 200;
      const maxAcc = Math.max(configuredMaxAcc, dist <= radius ? 250 : 100);

      if (dist > radius) {
        const msg = "Location verification failed: You are outside the authorized office premises.";
        setLocationRejection(msg);
        setErrorBanner(msg);
        return;
      }
      if (accuracy > maxAcc) {
        const msg = "GPS signal is too weak. Move near a window or an open area and try again.";
        setLocationRejection(msg);
        setErrorBanner(msg);
        return;
      }
    }

    // 2. Request challenge with fresh position
    try {
      const ch = await employeeAttendanceApi.requestChallenge({
        purpose: showReverifyModal ? "reverify" : "checkin",
        lat: latitude,
        lng: longitude,
        accuracy,
        fixTimestamp,
      });

      setLocationRejection(null);
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
      const msg = err instanceof Error ? err.message : "Failed to initiate verification.";
      setErrorBanner(msg);
      return;
    }

    // 3. Start Camera only after location challenge succeeds
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
    } catch (err: unknown) {
      stopCamera();
      let msg = "Camera access denied or models failed to load.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.message.toLowerCase().includes("permission")) {
          msg = "Camera permission was denied. Please allow camera access in your browser settings (address bar icon) and check Windows Camera privacy settings.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          msg = "No webcam or camera device was found on your system.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          msg = "Camera is currently in use by another application (e.g. Teams, Zoom, or another tab). Please close it and try again.";
        } else {
          msg = err.message;
        }
      }
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
      if (frameCounter % 2 === 0) {
        try {
          const res = await detectSingleFace(videoRef.current);
          if (res) {
            if (descriptorsCollected.length < 3 && frameCounter % 6 === 0) {
              descriptorsCollected.push(Array.from(res.descriptor));
              setCapturedDescriptors([...descriptorsCollected]);
            }

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
          // ignore frame detection error
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

      // Always request a fresh position right before check-in
      let freshPos: GeolocationPosition | null = null;
      try {
        freshPos = await getFreshPosition();
      } catch (posErr: unknown) {
        const msg =
          posErr instanceof GeolocationPositionError && posErr.code === 1
            ? "Location permission denied. Please allow GPS access in browser settings."
            : "GPS signal is too weak. Move near a window or an open area and try again.";
        setLocationRejection(msg);
        setErrorBanner(msg);
        stopCamera();
        setSubmittingCheckIn(false);
        return;
      }

      const effectiveLat = freshPos.coords.latitude;
      const effectiveLng = freshPos.coords.longitude;
      const effectiveAccuracy = freshPos.coords.accuracy;
      const effectiveFixTimestamp = freshPos.timestamp;

      setGpsLocation({
        lat: effectiveLat,
        lng: effectiveLng,
        accuracy: effectiveAccuracy,
        fixTimestamp: effectiveFixTimestamp,
      });

      if (status?.office) {
        const dist = calculateDistanceMeters(
          effectiveLat,
          effectiveLng,
          Number(status.office.lat),
          Number(status.office.lng)
        );
        setDistanceMeters(dist);
      }

      // Ensure 3 descriptors
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
            fixTimestamp: effectiveFixTimestamp,
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
            fixTimestamp: effectiveFixTimestamp,
          });
          stopCamera();
          await loadStatus();
          await loadHistory(historyMonth);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verification failed.";
        setErrorBanner(msg);
        setLocationRejection(msg);
        stopCamera();
      } finally {
        setSubmittingCheckIn(false);
      }
    };

    void performSubmission();
  }, [actionSuccess, challenge, submittingCheckIn, capturedDescriptors, showReverifyModal, stopCamera, loadStatus, loadHistory, historyMonth, status?.office]);

  // 8. Handle Check-Out
  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to mark Check-out for today?")) return;

    let freshPos: GeolocationPosition | null = null;
    try {
      freshPos = await getFreshPosition();
    } catch {
      // fallback
    }

    const effectiveLat = freshPos?.coords.latitude ?? gpsLocation?.lat ?? (status?.office ? Number(status.office.lat) : 0);
    const effectiveLng = freshPos?.coords.longitude ?? gpsLocation?.lng ?? (status?.office ? Number(status.office.lng) : 0);
    const effectiveAccuracy = freshPos?.coords.accuracy ?? gpsLocation?.accuracy ?? 10;
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

  // ── Render Helpers ──────────────────────────────────────────────────────────

  const radiusLimit = Number(status?.office?.radius_m) || 150;
  const isInsideRadius = distanceMeters !== null && distanceMeters <= radiusLimit;
  const configuredMaxAcc = Number(status?.office?.accuracy_max_m) || 200;
  const maxAccLimit = Math.max(configuredMaxAcc, isInsideRadius ? 250 : 100);
  const isGpsAccurate = gpsLocation ? gpsLocation.accuracy <= maxAccLimit : false;
  const canCheckIn = isInsideRadius && isGpsAccurate && !locationRejection;

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
          Your face has not been registered in the system yet. Please contact your administrator or HR department to complete face enrolment.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
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
                isInsideRadius && !locationRejection
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
                    isInsideRadius && !locationRejection ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {isInsideRadius
                    ? `Inside Office (${distanceMeters}m from center)`
                    : `Outside Office (${distanceMeters}m away, limit ${radiusLimit}m)`}
                </span>
                <span className="text-xs text-slate-500">
                  GPS Accuracy: ±{Math.round(gpsLocation?.accuracy ?? 0)}m
                  {!isGpsAccurate && ` (Required limit: ±${maxAccLimit}m)`}
                </span>
                <button
                  type="button"
                  onClick={() => void checkFreshLocation()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Location</span>
                </button>
              </div>
            ) : gpsError ? (
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-rose-600 font-medium">{gpsError}</span>
                <button
                  type="button"
                  onClick={() => void checkFreshLocation()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Location</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:items-end">
                <span className="text-xs text-slate-400">Acquiring GPS location...</span>
                <button
                  type="button"
                  onClick={() => void checkFreshLocation()}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a4bb3] hover:text-[#083d91] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Location</span>
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
                        : "bg-slate-300 shadow-none cursor-not-allowed opacity-60"
                    }`}
                  >
                    <Camera className="w-5 h-5" />
                    <span>Start Face Check-in</span>
                  </button>
                </div>

                {locationRejection && (
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 max-w-md w-full animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="flex-1">{locationRejection}</span>
                    <button
                      type="button"
                      onClick={() => void checkFreshLocation()}
                      className="underline hover:text-rose-900 text-[11px] font-bold whitespace-nowrap"
                    >
                      Refresh GPS
                    </button>
                  </div>
                )}

                {!locationRejection && !canCheckIn && (
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

            {/* Re-verification Required Banner */}
            {(status?.reverifyRequired || status?.reverifyPending || showReverifyModal) && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-900">
                      You were away from the office. Verify your face to resume tracking
                    </p>
                    <p className="text-xs font-semibold text-rose-600 mt-0.5">Not counted until verified</p>
                  </div>
                </div>
                {!showReverifyModal && (
                  <button
                    onClick={() => {
                      setShowReverifyModal(true);
                      void startCamera();
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
                  >
                    Verify Face Now
                  </button>
                )}
              </div>
            )}
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
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">{r.date}</td>
                      <td className="py-3 text-slate-600">
                        {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 text-slate-600">
                        {r.workedMinutes > 0 ? `${Math.floor(r.workedMinutes / 60)}h ${r.workedMinutes % 60}m` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeCls}`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">Re-verification Required</h3>
            <p className="text-sm text-slate-600 mb-2 font-medium">
              You were away from the office. Verify your face to resume tracking
            </p>
            <div className="inline-block px-3 py-1 bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold rounded-full mb-6">
              Not counted until verified
            </div>

            {!cameraActive ? (
              <div className="space-y-4">
                {locationRejection && (
                  <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs">
                    {locationRejection}
                  </div>
                )}
                <button
                  onClick={() => void startCamera()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f39200] hover:bg-[#e08500] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#f39200]/25 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  <span>Start Face Verification</span>
                </button>
              </div>
            ) : (
              <div className="max-w-sm mx-auto">
                <div className="relative aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div
                    className={`absolute inset-0 m-auto w-[70%] h-[75%] rounded-[50%] border-4 pointer-events-none transition-colors duration-300 ${
                      actionSuccess
                        ? "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                        : "border-[#f39200] shadow-[0_0_20px_rgba(243,146,0,0.4)]"
                    }`}
                  />
                  <div className="absolute top-3 inset-x-3 flex justify-center">
                    <div className="bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-lg text-center font-medium">
                      {livenessStatusText}
                    </div>
                  </div>
                  <div className="absolute bottom-3 inset-x-6">
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden backdrop-blur-sm">
                      <div
                        className="bg-[#f39200] h-full transition-all duration-200"
                        style={{ width: `${livenessProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Action: {challenge?.action?.replace("_", " ")}</span>
                  <button
                    onClick={stopCamera}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1 rounded border border-slate-200"
                  >
                    Pause Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
