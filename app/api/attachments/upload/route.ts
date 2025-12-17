import { NextResponse } from "next/server";
import crypto from "crypto";

import { auth } from "@/auth";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

function sanitizeExtension(raw: string | undefined) {
  const cleaned = (raw || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
  return cleaned || "bin";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const unlock = await ensureTwoFactorUnlocked(session);
  if (!unlock.ok) {
    return NextResponse.json(
      { success: false, message: unlock.message },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { success: false, message: "File is required" },
      { status: 400 }
    );
  }

  const fileSize = Number((file as unknown as { size?: unknown })?.size ?? 0);
  const fileType = String((file as unknown as { type?: unknown })?.type ?? "");
  const fileName = String((file as unknown as { name?: unknown })?.name ?? "upload.bin");

  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json(
      { success: false, message: "Invalid file" },
      { status: 400 }
    );
  }

  if (fileSize > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "File too large (max 2MB)" },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME_TYPES.has(fileType)) {
    return NextResponse.json(
      { success: false, message: "Unsupported file type" },
      { status: 415 }
    );
  }

  const ext = sanitizeExtension(fileName.split(".").pop());
  const objectPath = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from("attachments")
      .upload(objectPath, file, { contentType: fileType, upsert: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Upload failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: { path: objectPath } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

