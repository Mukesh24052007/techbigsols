"use client";

import * as faceapi from "@vladmandic/face-api";

let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    const MODEL_PATH = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
    ]);
    modelsLoaded = true;
  })();

  return modelLoadingPromise;
}

export interface DetectionResult {
  descriptor: Float32Array;
  landmarks: faceapi.FaceLandmarks68;
  box: faceapi.Box;
  score: number;
}

export async function detectSingleFace(
  video: HTMLVideoElement
): Promise<DetectionResult | null> {
  if (!modelsLoaded) {
    await loadFaceApiModels();
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return {
    descriptor: detection.descriptor,
    landmarks: detection.landmarks,
    box: detection.detection.box,
    score: detection.detection.score,
  };
}

// ── Liveness Calculations ───────────────────────────────────────────────────

function dist(p1: faceapi.Point, p2: faceapi.Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Calculates Eye Aspect Ratio (EAR) for 6 eye landmark points.
 * Points ordered: [p0, p1, p2, p3, p4, p5]
 */
function eyeAspectRatio(points: faceapi.Point[]): number {
  const v1 = dist(points[1], points[5]);
  const v2 = dist(points[2], points[4]);
  const h = dist(points[0], points[3]);
  if (h === 0) return 0;
  return (v1 + v2) / (2.0 * h);
}

export function computeEAR(landmarks: faceapi.FaceLandmarks68): number {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const leftEAR = eyeAspectRatio(leftEye);
  const rightEAR = eyeAspectRatio(rightEye);
  return (leftEAR + rightEAR) / 2.0;
}

/**
 * Computes face yaw ratio: distance from nose tip (pt 30) to left jaw (pt 0)
 * divided by total distance across both sides.
 * ~0.5 when facing forward; < 0.38 when turned left; > 0.62 when turned right.
 */
export function computeYawRatio(landmarks: faceapi.FaceLandmarks68): number {
  const nose = landmarks.positions[30];
  const leftCheek = landmarks.positions[0];
  const rightCheek = landmarks.positions[16];

  const dLeft = dist(nose, leftCheek);
  const dRight = dist(nose, rightCheek);
  const total = dLeft + dRight;
  if (total === 0) return 0.5;
  return dLeft / total;
}

/**
 * Computes smile metric: ratio of mouth width (corners 48, 54) to outer eye distance (36, 45).
 */
export function computeSmileMetric(landmarks: faceapi.FaceLandmarks68): number {
  const mouthLeft = landmarks.positions[48];
  const mouthRight = landmarks.positions[54];
  const eyeLeft = landmarks.positions[36];
  const eyeRight = landmarks.positions[45];

  const mouthWidth = dist(mouthLeft, mouthRight);
  const eyeSpan = dist(eyeLeft, eyeRight);
  if (eyeSpan === 0) return 0;
  return mouthWidth / eyeSpan;
}

/**
 * Haversine formula to calculate distance between two GPS coordinates in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
