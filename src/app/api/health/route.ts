import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRedisConfigured, redisPing } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let databaseReachable = false;
  let databaseLatencyMs: number | null = null;
  try {
    const dbStarted = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    databaseReachable = true;
    databaseLatencyMs = Date.now() - dbStarted;
  } catch (error) {
    console.error("Health check database failure", error);
  }

  const cache = await redisPing();
  const healthy = databaseReachable;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      database: {
        configured: Boolean(process.env.DATABASE_URL),
        reachable: databaseReachable,
        latencyMs: databaseLatencyMs,
      },
      cache: {
        ...cache,
        configured: isRedisConfigured(),
        mode: cache.reachable ? "redis" : "in-process-fallback",
      },
      checkedAt: new Date().toISOString(),
      responseTimeMs: Date.now() - started,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
