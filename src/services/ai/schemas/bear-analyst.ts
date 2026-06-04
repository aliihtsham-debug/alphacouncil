import { z } from "zod";

export const bearAnalystOutputSchema = z.object({
  bearishArguments: z
    .array(z.string())
    .describe("Reasons why the token should NOT be purchased"),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall risk score 0-100"),
});

export type BearAnalystOutput = z.infer<typeof bearAnalystOutputSchema>;
