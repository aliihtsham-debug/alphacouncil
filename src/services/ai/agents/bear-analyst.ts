/**
 * Bear Analyst Agent
 *
 * Challenges the bullish thesis. Identifies risks and red flags.
 * Runs independently (in parallel with Bull Analyst).
 */

import { z } from "zod";
import { BaseAgent } from "./base-agent";
import { bearAnalystOutputSchema } from "../schemas/bear-analyst";
import {
  BEAR_ANALYST_SYSTEM_PROMPT,
  buildBearAnalystUserPrompt,
} from "../prompts/bear-analyst";

export interface BearAnalystInput {
  candidateToken: {
    symbol: string;
    name: string;
  };
  marketSummary: string;
}

export type BearAnalystAgentOutput = z.infer<typeof bearAnalystOutputSchema>;

export class BearAnalystAgent extends BaseAgent<
  BearAnalystInput,
  BearAnalystAgentOutput
> {
  constructor() {
    super(
      {
        name: "Bear Analyst",
        systemPrompt: BEAR_ANALYST_SYSTEM_PROMPT,
        maxRetries: 2,
        timeoutMs: 15000,
        temperature: 0.6,
      },
      bearAnalystOutputSchema
    );
  }

  protected buildUserPrompt(input: BearAnalystInput): string {
    return buildBearAnalystUserPrompt(
      input.candidateToken,
      input.marketSummary
    );
  }
}
