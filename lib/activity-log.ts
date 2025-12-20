import type { Prisma } from "@prisma/client";
import { ActivityAction, ActivityEntityType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type ActivityLogInput = {
  projectId: string;
  actorId: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export async function recordActivity(
  input: ActivityLogInput,
  tx?: Prisma.TransactionClient
) {
  const client = tx ?? prisma;

  try {
    await client.activityLog.create({ data: input });
  } catch (error) {
    console.error("Activity log error:", error);
  }
}
