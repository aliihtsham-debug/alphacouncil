import { z } from "zod";

export const riskManagerOutputSchema = z.object({
  allocation: z
    .number()
    .min(0)
    .max(25)
    .describe("Recommended allocation percentage (0-25%)"),
  portfolioImpact: z
    .string()
    .describe("Description of how this trade affects the portfolio"),
  riskLevel: z
    .enum(["low", "medium", "high", "extreme"])
    .describe("Overall risk level of the proposed trade"),
});

export type RiskManagerOutput = z.infer<typeof riskManagerOutputSchema>;
