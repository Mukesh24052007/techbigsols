import crypto from "crypto";

export interface QrSession {
  sessionId: number;
  qrToken: string;
  action: "CHECK_IN" | "CHECK_OUT";
  attendanceDate: string; // YYYY-MM-DD
  officeId: number;
  createdAt: number; // epoch ms
  expiresAt: string; // ISO / YYYY-MM-DD HH:mm:ss
  expiresAtMs: number;
  secondsRemaining: number;
  generationSeq: number;
  rotationReason?: string;
}

interface QrStore {
  sessions: Map<string, QrSession>; // key: `${action}_${officeId}`
  sessionCounter: number;
}

const globalForQr = globalThis as unknown as {
  __qrStore?: QrStore;
};

if (!globalForQr.__qrStore) {
  globalForQr.__qrStore = {
    sessions: new Map(),
    sessionCounter: 1,
  };
}

const qrStore = globalForQr.__qrStore;

export function getTodayDateString(): string {
  // Asia/Kolkata timezone UTC + 5:30
  return new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}

function formatSqlDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

export function getActiveQrSession(
  action: "CHECK_IN" | "CHECK_OUT",
  officeId = 1
): { active: boolean; data?: QrSession } {
  const key = `${action}_${officeId}`;
  const session = qrStore.sessions.get(key);
  if (!session) {
    return { active: false };
  }

  const now = Date.now();
  const today = getTodayDateString();

  // If different day or expired
  if (session.attendanceDate !== today || now >= session.expiresAtMs) {
    return {
      active: false,
      data: {
        ...session,
        secondsRemaining: 0,
      },
    };
  }

  const remSec = Math.max(0, Math.floor((session.expiresAtMs - now) / 1000));
  return {
    active: true,
    data: {
      ...session,
      secondsRemaining: remSec,
    },
  };
}

export function generateQrSession(params: {
  action: "CHECK_IN" | "CHECK_OUT";
  officeId?: number;
  validityMinutes?: number;
  allowRotation?: boolean;
  rotationReason?: string;
}): { success: boolean; session?: QrSession; error?: string; code?: string } {
  const officeId = params.officeId ?? 1;
  const action = params.action;
  const validityMinutes = Math.max(1, params.validityMinutes ?? 15);
  const key = `${action}_${officeId}`;
  const today = getTodayDateString();

  const existing = qrStore.sessions.get(key);
  const now = Date.now();

  // Check if already active
  if (
    existing &&
    existing.attendanceDate === today &&
    now < existing.expiresAtMs &&
    !params.allowRotation
  ) {
    return {
      success: false,
      error:
        "A QR session has already been generated today for this office and action. Please rotate if you wish to generate a new dynamic code.",
      code: "SINGLE_GEN_LIMIT",
    };
  }

  const seq = existing && existing.attendanceDate === today ? existing.generationSeq + 1 : 1;
  const sessionId = qrStore.sessionCounter++;
  const randomBytes = crypto.randomBytes(16).toString("hex");
  const qrToken = `tbs_${action.toLowerCase()}_${today}_${randomBytes}`;
  const expiresAtMs = now + validityMinutes * 60 * 1000;
  const expiresAt = formatSqlDateTime(new Date(expiresAtMs));

  const newSession: QrSession = {
    sessionId,
    qrToken,
    action,
    attendanceDate: today,
    officeId,
    createdAt: now,
    expiresAt,
    expiresAtMs,
    secondsRemaining: validityMinutes * 60,
    generationSeq: seq,
    rotationReason: params.rotationReason,
  };

  qrStore.sessions.set(key, newSession);

  return {
    success: true,
    session: newSession,
  };
}

export function validateScannedToken(
  scannedToken: string,
  expectedAction: "CHECK_IN" | "CHECK_OUT"
): { valid: boolean; session?: QrSession; error?: string } {
  const trimmed = scannedToken.trim();
  if (!trimmed) {
    return { valid: false, error: "Empty QR token." };
  }

  const now = Date.now();
  let matchedSession: QrSession | undefined;

  for (const session of qrStore.sessions.values()) {
    if (session.qrToken === trimmed) {
      matchedSession = session;
      break;
    }
  }

  if (!matchedSession) {
    return {
      valid: false,
      error: "Invalid QR code. The scanned QR token was not recognized.",
    };
  }

  if (now > matchedSession.expiresAtMs) {
    return {
      valid: false,
      error:
        "QR Code Expired: The scanned QR code has expired. Please scan the refreshed code from the office display.",
    };
  }

  if (matchedSession.action !== expectedAction) {
    return {
      valid: false,
      error: `ACTION_MISMATCH: expected ${expectedAction} code but scanned ${matchedSession.action} code.`,
    };
  }

  return {
    valid: true,
    session: matchedSession,
  };
}

