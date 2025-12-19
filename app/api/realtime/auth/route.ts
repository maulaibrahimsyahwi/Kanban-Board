import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getClientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { enforceSameOrigin } from "@/lib/request-security";
import { ensureTwoFactorUnlocked } from "@/lib/two-factor-session";
import { createProjectTokenRequest, isAblyConfigured } from "@/lib/ably";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const originCheck = enforceSameOrigin(request);
  if (!originCheck.ok) {
    return NextResponse.json(
      { success: false, message: originCheck.message },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isAblyConfigured()) {
    return NextResponse.json(
      { success: false, message: "Realtime is not configured." },
      { status: 501, headers: { "Cache-Control": "no-store" } }
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
    rateLimit(`realtime:auth:ip:${ip}`, { windowMs: 60 * 1000, max: 120 }),
    rateLimit(`realtime:auth:user:${session.user.id}`, {
      windowMs: 60 * 1000,
      max: 60,
    }),
  ]);

  if (!limitedByIp.ok || !limitedByUser.ok) {
    return NextResponse.json(
      { success: false, message: "Too many requests" },
      { status: 429, headers: { "Cache-Control": "no-store" } }
    );
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json(
      { success: false, message: "Missing projectId" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const hasAccess = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { id: session.user.id } } },
      ],
    },
    select: { id: true },
  });

  if (!hasAccess) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const tokenRequest = await createProjectTokenRequest({
      clientId: session.user.id,
      projectId,
    });

    return NextResponse.json(tokenRequest, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[realtime] Failed to create token request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to authorize realtime" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
