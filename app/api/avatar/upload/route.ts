import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { enforceSameOrigin } from "@/lib/request-security";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 1 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForMime(mime: string) {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export async function POST(request: Request) {
  const originCheck = enforceSameOrigin(request, { requireOrigin: true });
  if (!originCheck.ok) {
    return NextResponse.json(
      { success: false, message: originCheck.message },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) {
    return NextResponse.json(
      { success: false, message: unlock.message },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const ip = getClientIpFromHeaders(request.headers);
  const [limitedByIp, limitedByUser] = await Promise.all([
    rateLimit(`upload:avatar:ip:${ip}`, { windowMs: 60 * 1000, max: 30 }),
    rateLimit(`upload:avatar:user:${session.user.id}`, {
      windowMs: 60 * 1000,
      max: 10,
    }),
  ]);

  if (!limitedByIp.ok || !limitedByUser.ok) {
    return NextResponse.json(
      { success: false, message: "Too many requests" },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid form data" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { success: false, message: "File is required" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const fileSize = Number((file as unknown as { size?: unknown })?.size ?? 0);
  const fileType = String((file as unknown as { type?: unknown })?.type ?? "");

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid file" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (fileSize > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "File too large (max 1MB)" },
      { status: 413, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(fileType)) {
    return NextResponse.json(
      { success: false, message: "Unsupported file type" },
      { status: 415, headers: { "Cache-Control": "no-store" } }
    );
  }

  const ext = extensionForMime(fileType);
  if (!ext) {
    return NextResponse.json(
      { success: false, message: "Unsupported file type" },
      { status: 415, headers: { "Cache-Control": "no-store" } }
    );
  }

  const objectPath = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from("avatars")
      .upload(objectPath, file, { contentType: fileType, upsert: true });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Upload failed" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
    const url = data.publicUrl;

    return NextResponse.json(
      { success: true, data: { url, path: objectPath } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
