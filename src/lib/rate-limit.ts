import { createHash } from "node:crypto";
import { getReadyRedis } from "./redis";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  if (now - lastCleanup > 60_000) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(k);
    }
    lastCleanup = now;
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  current.count += 1;
  if (current.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  return {
    allowed: true,
    remaining: limit - current.count,
    retryAfterSeconds: 0,
  };
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  // Keep raw IP addresses out of Redis and logs. The digest is scoped to this
  // deployment through AUTH_SECRET and truncated to the minimum needed to
  // distinguish clients for abuse prevention.
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.AUTH_SECRET ?? "silong-local";
  const digest = createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 24);
  return `${scope}:${digest}`;
}

/**
 * Distributed rate limiting when Redis is available. Falls back to the
 * in-process limiter so a Redis outage cannot lock users out of the app.
 */
export async function rateLimitAsync(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redis = await getReadyRedis();
  if (!redis) return rateLimit(key, limit, windowMs);

  try {
    const redisKey = `silong:ratelimit:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }
    let ttlMs = await redis.pttl(redisKey);
    if (ttlMs < 0) {
      await redis.pexpire(redisKey, windowMs);
      ttlMs = windowMs;
    }
    if (count > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil(ttlMs / 1000)),
      };
    }
    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: 0,
    };
  } catch {
    return rateLimit(key, limit, windowMs);
  }
}

export function resetRateLimits(): void {
  buckets.clear();
}
