/**
 * LLM Service — handles all OpenRouter / OpenAI API calls
 *
 * Primary: OpenRouter (openrouter/owl-alpha)
 * Fallback: OpenAI GPT-4o (optional, used when OpenRouter fails)
 */

import type { LLMMessage, LLMConfig } from "./types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL ?? "openrouter/owl-alpha";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

interface LLMResponse {
  content: string;
  tokensUsed: number;
}

/**
 * Fetch with timeout support.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Call the LLM with retry and fallback logic.
 * Primary: OpenRouter → Fallback: OpenAI (if configured)
 */
export async function callLLM(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" } | { type: "text" };
  }
): Promise<LLMResponse> {
  let lastError: Error | null = null;

  // Try OpenRouter first (primary provider)
  if (OPENROUTER_API_KEY) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await callOpenRouter(messages, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`OpenRouter attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    console.warn("OpenRouter exhausted retries, trying OpenAI fallback:", lastError?.message);
  }

  // Fallback to OpenAI (if configured)
  if (OPENAI_API_KEY) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await callOpenAI(messages, options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`OpenAI attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
  }

  // If no API keys available or all retries exhausted
  throw lastError ?? new Error(
    "No LLM API key configured. Set OPENROUTER_API_KEY or OPENAI_API_KEY."
  );
}

/**
 * Call OpenRouter API (OpenAI-compatible interface).
 */
async function callOpenRouter(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" } | { type: "text" };
  }
): Promise<LLMResponse> {
  const response = await fetchWithTimeout(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Alpha Council",
    },
    body: JSON.stringify({
      model: options?.model ?? OPENROUTER_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      ...(options?.responseFormat && {
        response_format: options.responseFormat,
      }),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

/**
 * Call OpenAI API (fallback).
 */
async function callOpenAI(
  messages: LLMMessage[],
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" } | { type: "text" };
  }
): Promise<LLMResponse> {
  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options?.model ?? OPENAI_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      ...(options?.responseFormat && {
        response_format: options.responseFormat,
      }),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenAI API error: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}

/**
 * Parse JSON from LLM response.
 */
export function parseJsonResponse<T>(content: string): T {
  // Try direct parse first
  try {
    return JSON.parse(content) as T;
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim()) as T;
      } catch {
        // Fall through
      }
    }

    // Try to find JSON object in the text (balanced braces)
    const firstBrace = content.indexOf("{");
    if (firstBrace !== -1) {
      let depth = 0;
      let endIdx = firstBrace;
      for (let i = firstBrace; i < content.length; i++) {
        if (content[i] === "{") depth++;
        if (content[i] === "}") depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
      if (depth === 0) {
        try {
          return JSON.parse(content.slice(firstBrace, endIdx + 1)) as T;
        } catch {
          // Fall through
        }
      }
    }

    throw new Error(`Failed to parse JSON from LLM response: ${content.slice(0, 200)}`);
  }
}
