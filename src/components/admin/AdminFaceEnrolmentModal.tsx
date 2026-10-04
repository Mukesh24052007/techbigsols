"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { adminFaceApi } from "@/lib/attendanceApi";
import { loadFaceApiModels, detectSingleFace } from "@/lib/faceClient";
import {
  Camera,
  X,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
  ScanFace,
  Shield,
  Sparkles,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

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
      const msg = err instanceof Error ? err.message : "Camera access denied or failed to initialize.";
      setErrorMsg(msg);
    }
  };

  // Capture descriptor on user click or detection
  const captureSample = async () => {
    if (!videoRef.current || submitting) return;

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
        // Automatically save when all 5 samples are captured
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
      stopCamera();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save face enrolment.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFace = async () => {
    if (!confirm(`Delete face biometric enrolment for ${employee.fullname}?`)) return;

    setDeleting(true);
    setErrorMsg(null);
    try {
      const res = await adminFaceApi.deleteFace(employee.user_id);
      setSuccessMsg(res.message || "Face profile deleted.");
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
            onClick={() => {
              stopCamera();
              onClose();
            }}
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
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
              <Camera className="w-8 h-8 text-[#0a4bb3]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Capture 5 Multi-Angle Descriptors</p>
              <p className="text-xs text-white/50 max-w-xs mx-auto mt-1">
                The employee must look straight, tilt and turn slightly to generate an accurate biometric template.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-[#0a4bb3] hover:bg-[#083b8f] transition-all shadow-lg shadow-[#0a4bb3]/30"
              >
                Start Camera Enrolment
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
                  Sample {samples.length + 1} of {DESIRED_SAMPLES}: {STEP_HINTS[currentStep] || "Hold steady"}
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
