export const dynamic = "force-dynamic";

// Liveness check: confirms the Next.js application has started.
// Database readiness is reported separately at /api/health/database.
export async function GET() {
  return Response.json({
    ok: true,
    service: "delta-updates",
    timestamp: new Date().toISOString(),
  });
}
