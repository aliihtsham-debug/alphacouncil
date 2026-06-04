import { z } from "zod";

export const bullAnalystOutputSchema = z.object({
  bullishArguments: z
    .array(z.string())
    .describe("Reasons why the token should be purchased"),
  opportunityScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall opportunity score 0-100"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence level in the bullish thesis 0-100"),
});

export type BullAnalystOutput = z.infer<typeof bullAnalystOutputSchema>;
