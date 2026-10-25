"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminFaceApi } from "@/lib/attendanceApi";
import { loadFaceApiModels, detectSingleFace, validateAndProcessPhoto } from "@/lib/faceClient";
import {
  Camera,
  X,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
  ScanFace,
  Upload,
  User,
} from "lucide-react";

interface AdminFaceEnrolmentModalProps {
  employee: {
    user_id: string;
    fullname: string;
    email?: string;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

const DESIRED_SAMPLES = 5;
const STEP_HINTS = [
  "Look straight at the camera",
  "Turn slightly to the left",
  "Turn slightly to the right",
  "Tilt slightly upward",
  "Tilt slightly downward",
];

export function AdminFaceEnrolmentModal({
  employee,
  onClose,
  onSuccess,
}: AdminFaceEnrolmentModalProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [samples, setSamples] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [replacingPhoto, setReplacingPhoto] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  const [hasPhoto, setHasPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [enrolSource, setEnrolSource] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load employee profile & stored photo thumbnail if available
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadStoredPhotoAndInfo() {
      setLoadingPhoto(true);
      try {
        const empData = await adminFaceApi.getEmployees();
        const found = (empData?.employees || []).find((e) => e.userId === employee.user_id);

        if (active && found) {
          if (found.enrolSource) {
            setEnrolSource(found.enrolSource.toUpperCase() === "LIVE" ? "Live" : "Photo");
          }
          if (found.hasPhoto) {
            setHasPhoto(true);
            try {
              const blob = await adminFaceApi.getPhotoBlob(employee.user_id);
              if (active) {
                createdUrl = URL.createObjectURL(blob);
                setPhotoUrl(createdUrl);
              }
            } catch {
              // photo not found
            }
          }
        }
      } catch {
        // failed loading employee details
      } finally {
        if (active) setLoadingPhoto(false);
      }
    }

    void loadStoredPhotoAndInfo();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [employee.user_id]);

  // Clean up object URL when component unmounts or photoUrl changes
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleModalClose = useCallback(() => {
    stopCamera();
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      setPhotoUrl(null);
    }
    onClose();
  }, [stopCamera, photoUrl, onClose]);

  const startCamera = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSamples([]);
    setCurrentStep(0);
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
      let msg = "Camera access denied or failed to initialize.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.message.toLowerCase().includes("permission")) {
          msg = "Camera permission was denied. Please allow camera access in your browser's site settings (click the tune/shield icon in the address bar) and ensure Camera access is enabled in Windows Settings > Privacy & security > Camera.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          msg = "No webcam or camera device was found on your system. You can also enrol by uploading a photo using 'Replace photo'.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          msg = "Camera is currently in use by another application (e.g. Teams, Zoom, or another browser window). Please close it and try again.";
        } else {
          msg = err.message;
        }
      }
      setErrorMsg(msg);
    }
  };

  const captureSample = async () => {
    if (!videoRef.current || submitting) return;

    // If 5 samples already collected, retry submission
    if (samples.length >= DESIRED_SAMPLES) {
      await submitEnrolment(samples);
      return;
    }

    setErrorMsg(null);
    try {
      const detection = await detectSingleFace(videoRef.current);
      if (!detection) {
        setErrorMsg("No clear face detected in frame. Please reposition.");
        return;
      }

      const descriptorArr = Array.from(detection.descriptor);
      const newSamples = [...samples, descriptorArr];
      setSamples(newSamples);

      if (newSamples.length < DESIRED_SAMPLES) {
        setCurrentStep(newSamples.length);
      } else {
        await submitEnrolment(newSamples);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to capture face descriptor.";
      setErrorMsg(msg);
    }
  };

  const submitEnrolment = async (collectedSamples: number[][]) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await adminFaceApi.enrolFace(employee.user_id, collectedSamples);
      setSuccessMsg(res.message || "Face enrolled successfully!");
      setEnrolSource("Live");
      stopCamera();
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save face enrolment.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplacePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplacingPhoto(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await validateAndProcessPhoto(file);
      if (!result.valid || !result.descriptor || !result.base64Photo) {
        setErrorMsg(result.error || "Photo validation failed.");
        return;
      }

      const res = await adminFaceApi.enrolPhoto(employee.user_id, {
        photo: result.base64Photo,
        descriptors: [result.descriptor],
        consentAttested: true,
      });

      // Update thumbnail with newly validated image either way
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
      const newUrl = URL.createObjectURL(file);
      setPhotoUrl(newUrl);
      setHasPhoto(true);

      if (res?.data?.templateUpdated === false) {
        setSuccessMsg("Photo saved. The existing live-capture face template was kept.");
      } else {
        setEnrolSource("Photo");
        setSuccessMsg("Photo saved and face template updated.");
      }
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to replace photo.";
      setErrorMsg(msg);
    } finally {
      setReplacingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteFace = async () => {
    if (!confirm(`Delete face biometric enrolment for ${employee.fullname}?`)) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      const res = await adminFaceApi.deleteFace(employee.user_id);
      setSuccessMsg(res.message || "Face profile deleted.");
      setHasPhoto(false);
      setEnrolSource(null);
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
        setPhotoUrl(null);
      }
      stopCamera();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete face enrolment.";
      setErrorMsg(msg);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#031530] text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-white/10 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0a4bb3] rounded-xl flex items-center justify-center shadow-md shadow-[#0a4bb3]/30">
              <ScanFace className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Admin Face Enrolment</h3>
              <p className="text-xs text-white/50">{employee.fullname} ({employee.user_id})</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-white/40 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3 text-xs">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body */}
        {!cameraActive ? (
          <div className="py-2 space-y-6">
            {/* Stored Photo Thumbnail & Status */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {loadingPhoto ? (
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin text-white/40" />
                  </div>
                ) : hasPhoto && photoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photoUrl}
                    alt={employee.fullname}
                    className="w-16 h-16 rounded-xl object-cover border border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center text-white/30 border border-white/10">
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-white">Stored Verification Photo</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    {hasPhoto ? "Photo enrolled for biometrics" : "No photo uploaded"}
                  </p>
                  {enrolSource && (
                    <p className="text-[11px] text-blue-300 font-medium mt-1">
                      Enrolled via: <span className="text-white font-semibold">{enrolSource}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Replace Photo File Input */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleReplacePhotoFile}
                  className="hidden"
                  id="replace-photo-input"
                />
                <label
                  htmlFor="replace-photo-input"
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer transition-colors shadow-sm ${
                    replacingPhoto ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {replacingPhoto ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{replacingPhoto ? "Checking…" : "Replace photo"}</span>
                </label>
              </div>
            </div>

            {/* Improve accuracy with live capture */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                <Camera className="w-6 h-6 text-[#0a4bb3]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Multi-Angle Live Biometrics</p>
                <p className="text-xs text-white/50 max-w-xs mx-auto mt-0.5">
                  Capture 5 angles to build a high-precision biometric face template.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-[#0a4bb3] hover:bg-[#083b8f] transition-all shadow-lg shadow-[#0a4bb3]/30 text-xs sm:text-sm"
                >
                  Improve accuracy with live capture
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFace}
                  disabled={deleting}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Existing Face</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Viewport */}
            <div className="relative aspect-[4/3] bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Oval guide */}
              <div className="absolute inset-0 m-auto w-[65%] h-[78%] rounded-[50%] border-2 border-dashed border-[#0a4bb3] pointer-events-none" />

              {/* Angle Prompt */}
              <div className="absolute top-3 inset-x-4 flex justify-center">
                <span className="bg-black/80 backdrop-blur-md text-white text-[11px] px-3.5 py-1.5 rounded-full border border-white/10 font-semibold shadow">
                  {samples.length >= DESIRED_SAMPLES
                    ? `All ${DESIRED_SAMPLES} samples captured: Ready to enrol`
                    : `Sample ${samples.length + 1} of ${DESIRED_SAMPLES}: ${STEP_HINTS[currentStep] || "Hold steady"}`}
                </span>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 py-1">
              {Array.from({ length: DESIRED_SAMPLES }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx < samples.length
                      ? "bg-[#0a4bb3] ring-2 ring-[#0a4bb3]/40"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Capture Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureSample}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0a4bb3] hover:bg-[#083b8f] transition-all shadow-md shadow-[#0a4bb3]/30 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Enrolling…
                  </>
                ) : samples.length >= DESIRED_SAMPLES ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submit Enrolment ({DESIRED_SAMPLES}/{DESIRED_SAMPLES})
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    Capture Sample ({samples.length}/{DESIRED_SAMPLES})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
