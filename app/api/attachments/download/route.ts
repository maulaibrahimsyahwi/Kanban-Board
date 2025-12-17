import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function isSafeStoragePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return false;
  if (trimmed.includes("..")) return false;
  if (trimmed.includes("\\")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return false;
  return /^[A-Za-z0-9][A-Za-z0-9/_\-.]{0,512}$/.test(trimmed);
}

export async function GET(request: Request) {
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

  const url = new URL(request.url);
  const rawPath = url.searchParams.get("path");
  if (!rawPath) {
    return NextResponse.json(
      { success: false, message: "Missing path" },
      { status: 400 }
    );
  }

  const path = rawPath.trim();
  if (!isSafeStoragePath(path)) {
    return NextResponse.json(
      { success: false, message: "Invalid path" },
      { status: 400 }
    );
  }

  // Enforce access via DB relation when possible.
  // Fallback: allow the uploader to preview files before the attachment row is persisted.
  const attachment = await prisma.attachment.findFirst({
    where: {
      url: path,
      task: {
        board: {
          project: {
            OR: [
              { ownerId: session.user.id },
              { members: { some: { id: session.user.id } } },
            ],
          },
        },
      },
    },
    select: { id: true },
  });

  const isUploaderPreview = path.startsWith(`${session.user.id}/`);
  if (!attachment && !isUploaderPreview) {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from("attachments")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { success: false, message: "Failed to create signed URL" },
        { status: 500 }
      );
    }

    const response = NextResponse.redirect(data.signedUrl, { status: 302 });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

