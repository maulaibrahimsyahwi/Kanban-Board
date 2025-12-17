import "server-only";

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitState>();

function nowMs() {
  return Date.now();
}

export function getClientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function rateLimit(key: string, options: RateLimitOptions) {
  const now = nowMs();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    const next: RateLimitState = { count: 1, resetAt: now + options.windowMs };
    store.set(key, next);
    return { ok: true, remaining: options.max - 1, resetAt: next.resetAt };
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

