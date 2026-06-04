/**
 * LLM Service — handles all OpenAI / OpenRouter API calls
 *
 * Primary: OpenAI GPT-4o
 * Fallback: OpenRouter
 */

import type { LLMMessage, LLMConfig } from "./types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

interface LLMResponse {
  content: string;
  tokensUsed: number;
}

/**
 * Call the LLM with retry and fallback logic.
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
  // Try OpenAI first
  if (OPENAI_API_KEY) {
    try {
      return await callOpenAI(messages, options);
    } catch (error) {
      console.warn("OpenAI call failed, trying OpenRouter:", error);
    }
  }

  // Fallback to OpenRouter
  if (OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter(messages, options);
    } catch (error) {
      console.warn("OpenRouter call failed:", error);
    }
  }

  // If no API keys available, throw
  throw new Error(
    "No LLM API key configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY."
  );
}

/**
 * Call OpenAI API.
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
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Alpha Council",
    },
    body: JSON.stringify({
      model: options?.model ?? "openai/gpt-4o",
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

    // Try to find JSON object in the text
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]) as T;
      } catch {
        // Fall through
      }
    }

    throw new Error(`Failed to parse JSON from LLM response: ${content.slice(0, 200)}`);
  }
}
