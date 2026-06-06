/**
 * Market Research Agent
 *
 * Scans CoinMarketCap data and identifies investment candidates.
 */

import { BaseAgent } from "./base-agent";
import { marketResearchOutputSchema } from "../schemas/market-research";
import {
  MARKET_RESEARCH_SYSTEM_PROMPT,
  buildMarketResearchUserPrompt,
} from "../prompts/market-research";

export interface MarketResearchInput {
  userPrompt: string;
  marketData: {
    fearGreedIndex: number;
    btcDominance: number;
    trendingTokens: string[];
  };
}

export type MarketResearchAgentOutput = z.infer<typeof marketResearchOutputSchema>;

import { z } from "zod";

export class MarketResearchAgent extends BaseAgent<
  MarketResearchInput,
  MarketResearchAgentOutput
> {
  constructor() {
    super(
      {
        name: "Market Research",
        systemPrompt: MARKET_RESEARCH_SYSTEM_PROMPT,
        maxRetries: 1,
        timeoutMs: 30000,
        temperature: 0.5,
      },
      marketResearchOutputSchema
    );
  }

  protected buildUserPrompt(input: MarketResearchInput): string {
    return buildMarketResearchUserPrompt(input.userPrompt, input.marketData);
  }
}
