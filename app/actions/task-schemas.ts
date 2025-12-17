import { z } from "zod";

export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z
    .string()
    .refine((val) => val.startsWith("http") || val.startsWith("data:"), {
      message: "Invalid URL format",
    }),
  type: z.string(),
});

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(["low", "medium", "important", "urgent"]).optional(),
  progress: z.enum(["not-started", "in-progress", "completed"]).optional(),
  statusId: z.string().optional().nullable(),
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  cardDisplayPreference: z
    .enum(["none", "description", "checklist"])
    .optional(),
  labels: z.array(z.object({ name: z.string(), color: z.string() })).optional(),
  checklist: z
    .array(z.object({ text: z.string(), isDone: z.boolean() }))
    .optional(),
  assignees: z.array(z.any()).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

