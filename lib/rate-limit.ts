import "server-only";

import Redis from "ioredis";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

type MemoryState = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitRedis?: Redis;
  rateLimitMemory?: Map<string, MemoryState>;
  rateLimitMemoryLastSweepAt?: number;
  rateLimitWarnedNoRedis?: boolean;
};

const redisFixedWindowScript = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`;

const MEMORY_SWEEP_INTERVAL_MS = 60 * 1000;
const MEMORY_MAX_KEYS = 50_000;

function getMemoryStore() {
  if (!globalForRateLimit.rateLimitMemory) {
    globalForRateLimit.rateLimitMemory = new Map<string, MemoryState>();
  }
  return globalForRateLimit.rateLimitMemory;
}

function warnIfNoRedisInProduction() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.REDIS_URL) return;
  if (globalForRateLimit.rateLimitWarnedNoRedis) return;

  globalForRateLimit.rateLimitWarnedNoRedis = true;
  console.warn(
    "[rateLimit] REDIS_URL is not set; using in-memory rate limiting (not shared across instances)."
  );
}

function maybeSweepMemoryStore(now: number, store: Map<string, MemoryState>) {
  const lastSweepAt = globalForRateLimit.rateLimitMemoryLastSweepAt ?? 0;
  if (now - lastSweepAt < MEMORY_SWEEP_INTERVAL_MS) return;

  globalForRateLimit.rateLimitMemoryLastSweepAt = now;

  for (const [key, state] of store) {
    if (now >= state.resetAt) {
      store.delete(key);
    }
  }

  if (store.size <= MEMORY_MAX_KEYS) return;

  const overflow = store.size - MEMORY_MAX_KEYS;
  let removed = 0;
  for (const key of store.keys()) {
    store.delete(key);
    removed += 1;
    if (removed >= overflow) break;
  }
}

function getRedisClient() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;

  if (!globalForRateLimit.rateLimitRedis) {
    globalForRateLimit.rateLimitRedis = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
    });
  }
  return globalForRateLimit.rateLimitRedis;
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() ?? "unknown";
}

async function rateLimitWithMemory(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const store = getMemoryStore();
  const now = Date.now();
  maybeSweepMemoryStore(now, store);
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, options.max - 1), resetAt };
  }

  if (existing.count >= options.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(key, existing);
  return {
    ok: true,
    remaining: Math.max(0, options.max - existing.count),
    resetAt: existing.resetAt,
  };
}

async function rateLimitWithRedis(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  if (!redis) return rateLimitWithMemory(key, options);

  const now = Date.now();
  const redisKey = `ratelimit:${key}`;
  const [countRaw, ttlRaw] = (await redis.eval(
    redisFixedWindowScript,
    1,
    redisKey,
    String(options.windowMs)
  )) as [number, number];

  const count = Number(countRaw) || 0;
  const ttlMs = Number(ttlRaw);
  const resetAt = now + (Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : options.windowMs);

  return {
    ok: count <= options.max,
    remaining: Math.max(0, options.max - count),
    resetAt,
  };
}

export async function rateLimit(
  key: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  if (options.max <= 0 || options.windowMs <= 0) {
    return { ok: true, remaining: 0, resetAt: Date.now() };
  }

  warnIfNoRedisInProduction();

  try {
    if (process.env.REDIS_URL) return await rateLimitWithRedis(key, options);
  } catch (_error) {
    console.warn("[rateLimit] Redis unavailable, falling back to in-memory store.");
  }

  return rateLimitWithMemory(key, options);
}
