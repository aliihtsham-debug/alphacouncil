import { z } from "zod";

/**
 * Environment variable schema with validation.
 */
const envSchema = z.object({
  // ─── App ─────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Alpha Council"),

  // ─── Database ────────────────────────
  DATABASE_URL: z.string().optional(),

  // ─── AI ──────────────────────────────
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z
    .string()
    .url()
    .default("https://openrouter.ai/api/v1"),
  OPENROUTER_MODEL: z.string().default("openrouter/owl-alpha"),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o"),

  // ─── CoinMarketCap ───────────────────
  COINMARKETCAP_API_KEY: z.string().min(1),
  COINMARKETCAP_BASE_URL: z
    .string()
    .url()
    .default("https://pro-api.coinmarketcap.com/v1"),

  // ─── Auth ────────────────────────────
  SESSION_SECRET: z.string().min(32),

  // ─── Blockchain ──────────────────────
  BSCSCAN_API_KEY: z.string().min(1),

  // ─── Monitoring ──────────────────────
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

type Env = z.infer<typeof envSchema>;

// In serverless (Vercel), don't cache — env vars are injected per-request
// In dev, cache for performance across hot reloads
const isServerless = process.env.VERCEL === "1" || process.env.NOW_REGION !== undefined;

let cachedEnv: Env | null = null;

/**
 * Validate and return env vars.
 * In serverless environments, re-validates each call (no cache).
 * In dev, caches after first call for hot-reload performance.
 */
export function getEnv(): Env {
  if (!isServerless && cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }

  if (!isServerless) {
    cachedEnv = parsed.data;
  }

  return parsed.data;
}
