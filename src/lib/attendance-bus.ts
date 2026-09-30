import { EventEmitter } from "events";

export interface AttendanceEventPayload {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  checkIn: string; // ISO string
  method: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
}

class AttendanceBus extends EventEmitter {}

const globalForBus = globalThis as unknown as {
  attendanceBus: AttendanceBus | undefined;
};

export const attendanceBus =
  globalForBus.attendanceBus ?? new AttendanceBus();

// Allow unlimited listeners for live SSE connections without node leak warnings
attendanceBus.setMaxListeners(100);

if (process.env.NODE_ENV !== "production") {
  globalForBus.attendanceBus = attendanceBus;
}
