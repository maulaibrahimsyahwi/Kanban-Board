// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const boolFromEnv = (value: string | undefined) =>
  value === "1" || value?.toLowerCase() === "true";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const enabled = !!dsn;
const sendDefaultPii = boolFromEnv(process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII);
const enableLogs =
  process.env.NODE_ENV !== "production" &&
  boolFromEnv(process.env.NEXT_PUBLIC_SENTRY_ENABLE_LOGS ?? "true");

Sentry.init({
  dsn,
  enabled,

  // Add optional integrations for additional features
  integrations:
    process.env.NODE_ENV === "production" && !boolFromEnv(process.env.NEXT_PUBLIC_SENTRY_ENABLE_REPLAY)
      ? []
      : [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  // Enable logs to be sent to Sentry
  enableLogs,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.0 : 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
