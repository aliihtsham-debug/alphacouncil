/**
 * Portfolio Manager Agent
 *
 * Final decision maker. Synthesizes all agent outputs into a recommendation.
 */

import { z } from "zod";
import { BaseAgent } from "./base-agent";
import { portfolioManagerOutputSchema } from "../schemas/portfolio-manager";
import {
  PORTFOLIO_MANAGER_SYSTEM_PROMPT,
  buildPortfolioManagerUserPrompt,
} from "../prompts/portfolio-manager";

export interface PortfolioManagerInput {
  userPrompt: string;
  marketResearch: {
    candidateTokens: Array<{
      symbol: string;
      name: string;
      reason: string;
      score: number;
    }>;
    marketSummary: string;
  };
  bullAnalysis: {
    bullishArguments: string[];
    opportunityScore: number;
    confidence: number;
  };
  bearAnalysis: {
    bearishArguments: string[];
    riskScore: number;
  };
  riskManagement: {
    allocation: number;
    portfolioImpact: string;
    riskLevel: string;
  };
}

export type PortfolioManagerAgentOutput = z.infer<
  typeof portfolioManagerOutputSchema
>;

export class PortfolioManagerAgent extends BaseAgent<
  PortfolioManagerInput,
  PortfolioManagerAgentOutput
> {
  constructor() {
    super(
      {
        name: "Portfolio Manager",
        systemPrompt: PORTFOLIO_MANAGER_SYSTEM_PROMPT,
        maxRetries: 2,
        timeoutMs: 15000,
        temperature: 0.5,
      },
      portfolioManagerOutputSchema
    );
  }

  protected buildUserPrompt(input: PortfolioManagerInput): string {
    return buildPortfolioManagerUserPrompt(
      input.userPrompt,
      input.marketResearch,
      input.bullAnalysis,
      input.bearAnalysis,
      input.riskManagement
    );
  }
}
