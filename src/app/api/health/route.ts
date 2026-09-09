/**
 * GET /api/health
 *
 * Lightweight health check endpoint for AWS ALB / ECS / Route 53 health checks.
 * Returns 200 with a JSON payload as long as the Next.js server is running.
 */
export async function GET() {
  return Response.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
