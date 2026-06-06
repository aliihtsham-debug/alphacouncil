/**
 * Sentry Edge Configuration
 *
 * Initializes Sentry for the Edge runtime.
 * Only runs when SENTRY_DSN is set.
 */

import * as Sentry from "@sentry/nextjs";

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  });
}
