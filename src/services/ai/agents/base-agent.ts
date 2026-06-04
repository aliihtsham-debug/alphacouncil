/**
 * Base Agent Class
 *
 * All agents extend this class. Provides:
 * - LLM calling with retry logic
 * - Structured output parsing with Zod validation
 * - Timeout handling
 * - Observability (latency tracking)
 */

import { z } from "zod";
import { callLLM, parseJsonResponse } from "../llm";
import type { LLMMessage, AgentResult } from "../types";

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  maxRetries: number;
  timeoutMs: number;
  temperature: number;
}

export abstract class BaseAgent<TInput, TOutput> {
  protected config: AgentConfig;
  protected outputSchema: z.ZodSchema<TOutput>;

  constructor(config: AgentConfig, outputSchema: z.ZodSchema<TOutput>) {
    this.config = config;
    this.outputSchema = outputSchema;
  }

  /**
   * Build the user prompt from input data.
   * Each agent implements this.
   */
  protected abstract buildUserPrompt(input: TInput): string;

  /**
   * Execute the agent with retry logic and timeout.
   */
  async execute(input: TInput): Promise<AgentResult<TOutput>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.runWithTimeout(input);
        const latencyMs = Date.now() - startTime;

        return {
          success: true,
          data: result,
          latencyMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[${this.config.name}] Attempt ${attempt + 1} failed: ${lastError.message}`
        );

        if (attempt < this.config.maxRetries) {
          // Exponential backoff: 1s, 2s
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    return {
      success: false,
      error: lastError?.message ?? "Unknown error",
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Run the agent with a timeout.
   */
  private async runWithTimeout(input: TInput): Promise<TOutput> {
    return new Promise<TOutput>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `[${this.config.name}] Timeout after ${this.config.timeoutMs}ms`
          )
        );
      }, this.config.timeoutMs);

      this.run(input)
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Core execution: build messages, call LLM, parse output.
   */
  private async run(input: TInput): Promise<TOutput> {
    const messages: LLMMessage[] = [
      { role: "system", content: this.config.systemPrompt },
      { role: "user", content: this.buildUserPrompt(input) },
    ];

    const response = await callLLM(messages, {
      temperature: this.config.temperature,
      maxTokens: 2000,
      responseFormat: { type: "json_object" },
    });

    const parsed = parseJsonResponse<unknown>(response.content);

    // Validate with Zod schema
    const validated = this.outputSchema.safeParse(parsed);
    if (!validated.success) {
      console.error(
        `[${this.config.name}] Zod validation error:`,
        validated.error.flatten()
      );
      throw new Error(
        `[${this.config.name}] Output validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
  }
}
