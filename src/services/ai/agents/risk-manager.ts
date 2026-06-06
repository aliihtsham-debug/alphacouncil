/**
 * Risk Manager Agent
 *
 * Assesses portfolio risk and determines safe allocation.
 */

import { z } from "zod";
import { BaseAgent } from "./base-agent";
import { riskManagerOutputSchema } from "../schemas/risk-manager";
import {
  RISK_MANAGER_SYSTEM_PROMPT,
  buildRiskManagerUserPrompt,
} from "../prompts/risk-manager";

export interface RiskManagerInput {
  currentPortfolio: {
    totalValueUsd: number;
    assets: Array<{
      tokenSymbol: string;
      allocationPct: number;
      sector: string;
    }>;
    riskScore: number;
    stablecoinRatio: number;
  };
  proposedToken: {
    symbol: string;
    name: string;
    sector?: string;
  };
  bullArguments: string[];
  bearArguments: string[];
  marketSummary: string;
}

export type RiskManagerAgentOutput = z.infer<typeof riskManagerOutputSchema>;

export class RiskManagerAgent extends BaseAgent<
  RiskManagerInput,
  RiskManagerAgentOutput
> {
  constructor() {
    super(
      {
        name: "Risk Manager",
        systemPrompt: RISK_MANAGER_SYSTEM_PROMPT,
        maxRetries: 1,
        timeoutMs: 30000,
        temperature: 0.4,
      },
      riskManagerOutputSchema
    );
  }

  protected buildUserPrompt(input: RiskManagerInput): string {
    return buildRiskManagerUserPrompt(
      input.currentPortfolio,
      input.proposedToken,
      input.bullArguments,
      input.bearArguments,
      input.marketSummary
    );
  }
}
