// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  // Enable logs to be sent to Sentry
  enableLogs,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii,
});
