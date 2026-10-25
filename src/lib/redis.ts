import Redis from "ioredis";

/**
 * Optional Redis integration.
 *
 * The application must remain fully usable when Redis is absent or unreachable.
 * Every helper therefore fails open and callers keep an in-process fallback.
 */

const globalForRedis = globalThis as unknown as {
  __silongRedis?: Redis | null;
  __silongRedisFailureUntil?: number;
};

const FAILURE_COOLDOWN_MS = 30_000;

export function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

function createClient(url: string): Redis {
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2_000,
    retryStrategy(times) {
      if (times > 2) return null;
      return Math.min(times * 250, 750);
    },
  });
  // ioredis emits an error event for every failed reconnect. Logging each one
  // would flood the server log; the health endpoint reports reachability.
  client.on("error", () => undefined);
  return client;
}

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null;
  const existing = globalForRedis.__silongRedis;
  if (existing && existing.status !== "end") return existing;
  const client = createClient(process.env.REDIS_URL);
  globalForRedis.__silongRedis = client;
  return client;
}

export async function getReadyRedis(): Promise<Redis | null> {
  if (!process.env.REDIS_URL) return null;
  if ((globalForRedis.__silongRedisFailureUntil ?? 0) > Date.now()) return null;

  let client = getRedisClient();
  if (!client) return null;

  if (client.status === "ready") return client;

  if (client.status === "wait" || client.status === "end") {
    if (client.status === "end") {
      client = createClient(process.env.REDIS_URL);
      globalForRedis.__silongRedis = client;
    }
    try {
      await client.connect();
    } catch {
      globalForRedis.__silongRedisFailureUntil = Date.now() + FAILURE_COOLDOWN_MS;
      return null;
    }
  }

  return client.status === "ready" ? client : null;
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const client = await getReadyRedis();
  if (!client) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function redisSetJson(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  const client = await getReadyRedis();
  if (!client) return false;
  try {
    await client.set(key, JSON.stringify(value), "EX", Math.max(1, Math.round(ttlSeconds)));
    return true;
  } catch {
    return false;
  }
}

export async function redisPing(): Promise<{
  configured: boolean;
  reachable: boolean;
  latencyMs: number | null;
}> {
  if (!isRedisConfigured()) return { configured: false, reachable: false, latencyMs: null };
  const started = Date.now();
  const client = await getReadyRedis();
  if (!client) return { configured: true, reachable: false, latencyMs: null };
  try {
    const result = await client.ping();
    return { configured: true, reachable: result === "PONG", latencyMs: Date.now() - started };
  } catch {
    return { configured: true, reachable: false, latencyMs: null };
  }
}

export async function closeRedis(): Promise<void> {
  const client = globalForRedis.__silongRedis;
  globalForRedis.__silongRedis = undefined;
  if (!client) return;
  try {
    await client.quit();
  } catch {
    client.disconnect();
  }
}
