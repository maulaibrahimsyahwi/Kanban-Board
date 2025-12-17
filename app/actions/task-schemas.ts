import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeStoragePath(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/")) return false;
  if (trimmed.includes("..")) return false;
  if (trimmed.includes("\\")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) return false;
  return /^[A-Za-z0-9][A-Za-z0-9/_\-.]{0,512}$/.test(trimmed);
}

export const AttachmentSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "link") {
      if (!isHttpUrl(value.url)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid URL format",
          path: ["url"],
        });
      }
      return;
    }

    // File attachments: allow legacy http(s) URLs (public bucket) or internal storage paths (private bucket).
    if (!isHttpUrl(value.url) && !isSafeStoragePath(value.url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid attachment URL/path",
        path: ["url"],
      });
    }
  });

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  progress: z.enum(["not_started", "in_progress", "done"]).optional(),
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
