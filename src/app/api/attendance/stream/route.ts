import { NextRequest } from "next/server";
import { attendanceBus, AttendanceEventPayload } from "@/lib/attendance-bus";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keepalive / ping
      controller.enqueue(encoder.encode(`event: ping\ndata: ${Date.now()}\n\n`));

      const onCheckIn = (payload: AttendanceEventPayload) => {
        try {
          const msg = `event: checkin\ndata: ${JSON.stringify(payload)}\n\n`;
          controller.enqueue(encoder.encode(msg));
        } catch {
          // Stream might be closed
        }
      };

      attendanceBus.on("checkin", onCheckIn);

      // Keep connection alive with periodic heartbeats every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        attendanceBus.off("checkin", onCheckIn);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
