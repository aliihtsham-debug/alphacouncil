import { z } from "zod";

/**
 * Environment variable schema with validation.
 * Add all env vars here to ensure they exist at startup.
 */
const envSchema = z.object({
  // ─── App ─────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Alpha Council"),

  // ─── Database ────────────────────────
  DATABASE_URL: z.string().min(1),

  // ─── Redis ───────────────────────────
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),

  // ─── AI ──────────────────────────────
  // OpenRouter is the primary provider
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z
    .string()
    .url()
    .default("https://openrouter.ai/api/v1"),
  OPENROUTER_MODEL: z.string().default("openrouter/owl-alpha"),

  // OpenAI is optional fallback
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o"),

  // ─── CoinMarketCap ───────────────────
  COINMARKETCAP_API_KEY: z.string().min(1),
  COINMARKETCAP_BASE_URL: z
    .string()
    .url()
    .default("https://pro-api.coinmarketcap.com/v1"),

  // ─── Monitoring ──────────────────────
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
});

// Validate on import (server-side only)
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
