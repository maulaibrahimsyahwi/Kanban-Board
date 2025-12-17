// This file configures the initialization of Sentry on the edge.
// The config you add here will be used whenever an edge runtime handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const boolFromEnv = (value: string | undefined) =>
  value === "1" || value?.toLowerCase() === "true";

const dsn = process.env.SENTRY_DSN;
const enabled = !!dsn;
const sendDefaultPii = boolFromEnv(process.env.SENTRY_SEND_DEFAULT_PII);
const enableLogs =
  process.env.NODE_ENV !== "production" &&
  boolFromEnv(process.env.SENTRY_ENABLE_LOGS ?? "true");

Sentry.init({
  dsn,
  enabled,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  enableLogs,
  sendDefaultPii,
});
