// This file configures the initialization of Sentry on the edge.
// The config you add here will be used whenever an edge runtime handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://14625a5bd85d9eeacc8a37bec0643c6a@o4510500225613824.ingest.us.sentry.io/4510500307468288",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
