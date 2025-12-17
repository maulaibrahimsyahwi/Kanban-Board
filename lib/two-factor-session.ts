import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import type { Session } from "next-auth";

const TWO_FACTOR_COOKIE_NAME = "fk_2fa_verified";
const TWO_FACTOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

type TwoFactorCookiePayload = {
  userId: string;
  sessionFingerprint: string;
  issuedAt: number;
  expiresAt: number;
};

function base64urlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecodeToString(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const withPadding = padded + "=".repeat(padLen);
  return Buffer.from(withPadding, "base64").toString("utf8");
}

function hmacSha256Base64url(data: string, secret: string) {
  return base64urlEncode(crypto.createHmac("sha256", secret).update(data).digest());
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for 2FA session signing.");
  return secret;
}

async function getCookieStore() {
  return await cookies();
}

async function getAuthSessionCookieValue() {
  const cookieStore = await getCookieStore();
  const candidates = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  for (const name of candidates) {
    const value = cookieStore.get(name)?.value;
    if (value) return value;
  }
  return null;
}

function fingerprintSessionCookie(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function signTwoFactorPayload(payload: TwoFactorCookiePayload) {
  const secret = getAuthSecret();
  const data = base64urlEncode(JSON.stringify(payload));
  const sig = hmacSha256Base64url(data, secret);
  return `${data}.${sig}`;
}

function verifyTwoFactorToken(token: string) {
  const secret = getAuthSecret();
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expectedSig = hmacSha256Base64url(data, secret);
  if (sig.length !== expectedSig.length) return null;
  const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!sigOk) return null;

  try {
    const parsed = JSON.parse(base64urlDecodeToString(data)) as TwoFactorCookiePayload;
    if (
      !parsed ||
      typeof parsed.userId !== "string" ||
      typeof parsed.sessionFingerprint !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    if (Date.now() > parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isTwoFactorRequiredForSession(session: Session) {
  const provider = session.user.authProvider;
  const enabled = session.user.twoFactorEnabled === true;
  if (!enabled) return false;
  // Credentials already verifies TOTP during sign-in; other providers must verify post-login.
  return provider !== "credentials";
}

export async function isTwoFactorVerifiedForCurrentRequest(userId: string) {
  const cookieStore = await getCookieStore();
  const raw = cookieStore.get(TWO_FACTOR_COOKIE_NAME)?.value;
  if (!raw) return false;

  const parsed = verifyTwoFactorToken(raw);
  if (!parsed) return false;
  if (parsed.userId !== userId) return false;

  const sessionCookie = await getAuthSessionCookieValue();
  if (!sessionCookie) return false;

  const currentFingerprint = fingerprintSessionCookie(sessionCookie);
  return currentFingerprint === parsed.sessionFingerprint;
}

export async function setTwoFactorVerifiedCookie(userId: string) {
  const sessionCookie = await getAuthSessionCookieValue();
  if (!sessionCookie) throw new Error("Session cookie not found; cannot bind 2FA verification.");

  const now = Date.now();
  const payload: TwoFactorCookiePayload = {
    userId,
    sessionFingerprint: fingerprintSessionCookie(sessionCookie),
    issuedAt: now,
    expiresAt: now + TWO_FACTOR_COOKIE_MAX_AGE_SECONDS * 1000,
  };

  const cookieStore = await getCookieStore();
  cookieStore.set({
    name: TWO_FACTOR_COOKIE_NAME,
    value: signTwoFactorPayload(payload),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TWO_FACTOR_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearTwoFactorVerifiedCookie() {
  const cookieStore = await getCookieStore();
  cookieStore.set({
    name: TWO_FACTOR_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function ensureTwoFactorUnlocked(session: Session) {
  if (!isTwoFactorRequiredForSession(session)) return { ok: true as const };
  if (await isTwoFactorVerifiedForCurrentRequest(session.user.id)) {
    return { ok: true as const };
  }
  return {
    ok: false as const,
    message: "Two-factor verification required.",
  };
}
