import "server-only";

type SameOriginResult = { ok: true } | { ok: false; message: string };

function normalizeHeaderValue(value: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getRequestHost(request: Request) {
  return (
    normalizeHeaderValue(request.headers.get("x-forwarded-host")) ??
    normalizeHeaderValue(request.headers.get("host"))
  );
}

function getRequestOrigin(request: Request) {
  return normalizeHeaderValue(request.headers.get("origin"));
}

export function enforceSameOrigin(
  request: Request,
  options?: { requireOrigin?: boolean }
): SameOriginResult {
  const host = getRequestHost(request);
  const origin = getRequestOrigin(request);

  if (!origin) {
    if (options?.requireOrigin) {
      return { ok: false, message: "Missing Origin header" };
    }
    return { ok: true };
  }

  if (!host) return { ok: true };

  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return { ok: false, message: "Invalid Origin header" };
  }

  const originHost = originUrl.host.toLowerCase();
  const requestHost = host.toLowerCase();

  if (originHost !== requestHost) {
    return { ok: false, message: "Origin mismatch" };
  }

  return { ok: true };
}

