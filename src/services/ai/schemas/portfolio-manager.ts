import { z } from "zod";

export const portfolioManagerOutputSchema = z.object({
  decision: z
    .enum(["BUY", "HOLD", "SELL"])
    .describe("Final investment decision"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence level in the decision 0-100"),
  thesis: z
    .string()
    .describe("Detailed investment thesis explaining the reasoning"),
  allocation: z
    .number()
    .min(0)
    .max(25)
    .describe("Final recommended allocation percentage"),
});

export type PortfolioManagerOutput = z.infer<typeof portfolioManagerOutputSchema>;
