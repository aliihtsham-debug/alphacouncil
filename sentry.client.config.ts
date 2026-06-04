/**
 * Sentry Client Configuration
 *
 * Initializes Sentry for the browser runtime.
 * Only runs when NEXT_PUBLIC_SENTRY_DSN is set.
 * Stubs gracefully when @sentry/nextjs is not installed.
 */

export {};

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (sentryDsn) {
  // Use dynamic import to avoid compile-time dependency
  const dynamicImport = new Function("modulePath", "return import(modulePath)") as (m: string) => Promise<unknown>;
  dynamicImport("@sentry/nextjs")
    .then((Sentry: unknown) => {
      const s = Sentry as { init: (opts: Record<string, unknown>) => void };
      s.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.0,
        replaysOnErrorSampleRate: 1.0,
        integrations: [],
      });
    })
    .catch(() => {
      console.warn("@sentry/nextjs not installed — skipping Sentry client init");
    });
}
