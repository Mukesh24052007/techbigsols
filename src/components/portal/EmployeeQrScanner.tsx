"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

interface EmployeeQrScannerProps {
  onScanSuccess: (token: string) => void;
  isSubmitting?: boolean;
  action: "CHECK_IN" | "CHECK_OUT";
}

export function EmployeeQrScanner({
  onScanSuccess,
  isSubmitting = false,
  action,
}: EmployeeQrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container";
  const isMountedRef = useRef(true);
  const scanLockRef = useRef(false);

  // Stop scanning and release all media stream hardware tracks cleanly
  const stopScanning = useCallback(async () => {
    scanLockRef.current = false;
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // Silently handle if already stopped
      }
      scannerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  // Parse and extract token safely without logging or sending to external hosts
  const parseScannedText = (decodedText: string): string => {
    const trimmed = decodedText.trim();
    if (!trimmed) return "";

    // Check if JSON payload was encoded
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        if (typeof parsed.qrToken === "string" && parsed.qrToken.trim()) {
          return parsed.qrToken.trim();
        }
        if (typeof parsed.token === "string" && parsed.token.trim()) {
          return parsed.token.trim();
        }
      } catch {
        // Fall through to plain text
      }
    }

    // Check if a URL was encoded
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const url = new URL(trimmed);
        const tokenFromParam = url.searchParams.get("token") || url.searchParams.get("qrToken");
        if (tokenFromParam) return tokenFromParam.trim();
      } catch {
        // Fall through
      }
    }

    return trimmed;
  };

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Prevent multiple concurrent scans or triggering while submitting
      if (scanLockRef.current || isSubmitting || hasScanned) return;

      const extractedToken = parseScannedText(decodedText);
      if (!extractedToken) return;

      scanLockRef.current = true;
      setHasScanned(true);

      // Stop camera immediately to save battery and avoid re-reads
      await stopScanning();

      // Trigger callback with clean token
      onScanSuccess(extractedToken);
    },
    [isSubmitting, hasScanned, onScanSuccess, stopScanning]
  );

  const startScanning = async () => {
    setCameraError(null);
    setHasScanned(false);
    scanLockRef.current = false;

    // Check if mediaDevices is supported in the browser / protocol
    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      if (typeof window !== "undefined" && window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
        setCameraError("Camera access requires a secure HTTPS connection.");
      } else {
        setCameraError("Camera access is not supported on this browser or device.");
      }
      return;
    }

    try {
      // Ensure previous instance is stopped
      await stopScanning();

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      // Start camera preferring rear camera on mobile
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          void handleScanSuccess(decodedText);
        },
        () => {
          // Frame failed to detect QR — normal during viewfinder seeking
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      let msg = "Could not access camera. Please check device permissions.";
      if (err instanceof Error) {
        const errName = err.name.toLowerCase();
        if (errName.includes("notallowed") || errName.includes("permission")) {
          msg = "Camera permission was denied. Please allow camera access in browser settings to scan attendance QR codes.";
        } else if (errName.includes("notfound") || errName.includes("devicesnotfound")) {
          msg = "No compatible camera found on this device.";
        } else if (errName.includes("notreadable") || errName.includes("trackstart")) {
          msg = "Camera is currently in use by another application.";
        } else if (err.message) {
          msg = err.message;
        }
      }
      setCameraError(msg);
      setIsScanning(false);
    }
  };

  // Clean teardown on unmount or mode switch
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            void scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
            });
          } else {
            scannerRef.current.clear();
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Viewfinder Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              action === "CHECK_IN"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-blue-500/10 text-blue-600"
            }`}
          >
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              {action === "CHECK_IN" ? "Scan Check-In QR" : "Scan Check-Out QR"}
            </h3>
            <p className="text-xs text-slate-500">
              Point your camera at the office display screen
            </p>
          </div>
        </div>

        {isScanning && (
          <button
            type="button"
            onClick={() => void stopScanning()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            aria-label="Stop camera"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>Stop camera</span>
          </button>
        )}
      </div>

      {/* Viewfinder Body */}
      <div className="p-4 sm:p-6 flex flex-col items-center">
        {/* Error notification banner */}
        {cameraError && (
          <div
            role="alert"
            className="w-full mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs sm:text-sm"
          >
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Camera Access Error</p>
              <p className="mt-0.5 text-rose-700">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Viewfinder Container */}
        <div className="relative w-full max-w-sm aspect-square bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
          {/* HTML5 QR Code Mount Node */}
          <div
            id={scannerContainerId}
            className={`w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover ${
              isScanning ? "block" : "hidden"
            }`}
          />

          {/* Idle Placeholder */}
          {!isScanning && !isSubmitting && (
            <div className="flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-sm font-medium text-white/90 mb-1">
                Camera is currently idle
              </p>
              <p className="text-xs text-white/50 max-w-xs mb-5">
                Press the button below to activate your rear camera and scan the office QR code.
              </p>
              <button
                type="button"
                onClick={() => void startScanning()}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
                  action === "CHECK_IN"
                    ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30"
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Start scanning</span>
              </button>
            </div>
          )}

          {/* Submitting state overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <RefreshCw className="w-8 h-8 text-[#f39200] animate-spin mb-3" />
              <p className="text-sm font-semibold text-white">Verifying QR code…</p>
              <p className="text-xs text-white/60 mt-1">
                Submitting your attendance to the server
              </p>
            </div>
          )}

          {/* Active Scanning Overlay */}
          {isScanning && !isSubmitting && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Scan box frame */}
              <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* Corner reticles */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                {/* Laser scanline animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse mt-28 shadow-lg shadow-emerald-400" />
              </div>
              <p className="text-xs text-white/80 font-medium bg-black/60 px-3 py-1 rounded-full mt-4 backdrop-blur-sm">
                Align QR Code within the frame
              </p>
            </div>
          )}
        </div>

        {/* Viewfinder footer helper */}
        <p className="text-xs text-slate-500 mt-4 text-center max-w-sm">
          QR codes rotate and expire periodically. Ensure your device clock is accurate and hold the camera steady.
        </p>
      </div>
    </div>
  );
}
