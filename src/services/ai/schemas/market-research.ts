import { z } from "zod";

export const candidateTokenSchema = z.object({
  symbol: z.string().describe("Token symbol (e.g., FET, AAVE)"),
  name: z.string().describe("Full token name"),
  reason: z.string().describe("Why this token is a candidate"),
  score: z.number().min(0).max(100).describe("Opportunity score 0-100"),
});

export const marketResearchOutputSchema = z.object({
  candidateTokens: z
    .array(candidateTokenSchema)
    .describe("Top candidate tokens for investment"),
  trends: z
    .array(z.string())
    .describe("Current market trends identified"),
  marketSummary: z
    .string()
    .describe("Overall market summary and sentiment"),
});

export type MarketResearchOutput = z.infer<typeof marketResearchOutputSchema>;
