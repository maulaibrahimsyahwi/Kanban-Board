import "server-only";

import Ably from "ably";

const globalForAbly = globalThis as unknown as {
  ablyRest?: Ably.Rest;
};

function getAblyApiKey() {
  const key = process.env.ABLY_API_KEY?.trim();
  return key || null;
}

export function isAblyConfigured() {
  return !!getAblyApiKey();
}

export function getAblyRestClient() {
  const key = getAblyApiKey();
  if (!key) return null;

  if (!globalForAbly.ablyRest) {
    globalForAbly.ablyRest = new Ably.Rest({ key });
  }

  return globalForAbly.ablyRest;
}

export async function createProjectTokenRequest(args: {
  clientId: string;
  projectId: string;
}) {
  const ably = getAblyRestClient();
  if (!ably) {
    throw new Error("ABLY_API_KEY is not configured.");
  }

  const capability = JSON.stringify({
    [`project:${args.projectId}`]: ["subscribe"],
  });

  return await ably.auth.createTokenRequest({
    clientId: args.clientId,
    capability,
  });
}

export async function publishProjectInvalidation(args: {
  projectId: string;
  actorId: string;
  kind?: string;
}) {
  const ably = getAblyRestClient();
  if (!ably) return;

  try {
    const channel = ably.channels.get(`project:${args.projectId}`);
    await channel.publish("invalidate", {
      projectId: args.projectId,
      actorId: args.actorId,
      kind: args.kind || "mutation",
      at: Date.now(),
    });
  } catch (error) {
    console.warn("[realtime] Failed to publish invalidation event:", error);
  }
}

