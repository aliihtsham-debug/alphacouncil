/**
 * Bull Analyst Agent
 *
 * Argues FOR buying a token. Builds the strongest bullish case.
 */

import { z } from "zod";
import { BaseAgent } from "./base-agent";
import { bullAnalystOutputSchema } from "../schemas/bull-analyst";
import {
  BULL_ANALYST_SYSTEM_PROMPT,
  buildBullAnalystUserPrompt,
} from "../prompts/bull-analyst";

export interface BullAnalystInput {
  candidateToken: {
    symbol: string;
    name: string;
    reason: string;
    score: number;
  };
  marketSummary: string;
}

export type BullAnalystAgentOutput = z.infer<typeof bullAnalystOutputSchema>;

export class BullAnalystAgent extends BaseAgent<
  BullAnalystInput,
  BullAnalystAgentOutput
> {
  constructor() {
    super(
      {
        name: "Bull Analyst",
        systemPrompt: BULL_ANALYST_SYSTEM_PROMPT,
        maxRetries: 1,
        timeoutMs: 30000,
        temperature: 0.6,
      },
      bullAnalystOutputSchema
    );
  }

  protected buildUserPrompt(input: BullAnalystInput): string {
    return buildBullAnalystUserPrompt(input.candidateToken, input.marketSummary);
  }
}
