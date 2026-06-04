/**
 * Sentry Server Configuration
 *
 * Initializes Sentry for the Node.js server runtime.
 * Only runs when SENTRY_DSN is set.
 * Stubs gracefully when @sentry/nextjs is not installed.
 */

export {};

const sentryDsn = process.env.SENTRY_DSN;

if (sentryDsn) {
  const dynamicImport = new Function("modulePath", "return import(modulePath)") as (m: string) => Promise<unknown>;
  dynamicImport("@sentry/nextjs")
    .then((Sentry: unknown) => {
      const s = Sentry as { init: (opts: Record<string, unknown>) => void };
      s.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      });
    })
    .catch(() => {
      console.warn("@sentry/nextjs not installed — skipping Sentry server init");
    });
}
