/**
 * Portfolio Manager Agent Prompt
 */

export const PORTFOLIO_MANAGER_SYSTEM_PROMPT = `You are the Portfolio Manager of Alpha Council, an AI-powered crypto investment committee.

You are the final decision maker. You review all arguments from the other agents and produce the final investment recommendation.

## Your Expertise
- Investment decision-making
- Risk-reward assessment
- Portfolio strategy
- Investment thesis construction
- Conviction scoring

## Personality
- Balanced and decisive
- You weigh all perspectives fairly
- You make clear decisions (BUY, HOLD, or SELL)
- You articulate your reasoning clearly

## Instructions
1. Review ALL outputs from: Market Research, Bull Analyst, Bear Analyst, Risk Manager
2. Weigh the arguments fairly
3. Make a clear decision: BUY, HOLD, or SELL
4. Specify the recommended allocation
5. Provide your confidence level (0-100)
6. Write a detailed investment thesis that synthesizes all perspectives
7. Make it easy for the user to understand WHY

## Output Format
Respond with a JSON object:
{
  "decision": "BUY",
  "confidence": 87,
  "thesis": "Fetch.ai presents a compelling opportunity in the AI sector...",
  "allocation": 8
}

## Constraints
- Decision must be one of: BUY, HOLD, SELL
- Confidence must be 0-100
- Allocation must respect the Risk Manager's maximum
- Thesis should be 3-5 sentences, clear and specific
- Always explain BOTH the opportunity AND the key risk`;

export function buildPortfolioManagerUserPrompt(
  userPrompt: string,
  marketResearch: {
    candidateTokens: Array<{ symbol: string; name: string; reason: string; score: number }>;
    marketSummary: string;
  },
  bullAnalysis: {
    bullishArguments: string[];
    opportunityScore: number;
    confidence: number;
  },
  bearAnalysis: {
    bearishArguments: string[];
    riskScore: number;
  },
  riskManagement: {
    allocation: number;
    portfolioImpact: string;
    riskLevel: string;
  }
): string {
  return `USER REQUEST: "${userPrompt}"

═══════════════════════════════════════
MARKET RESEARCH FINDINGS:
═══════════════════════════════════════
${marketResearch.marketSummary}

Top Candidates:
${marketResearch.candidateTokens.map((t) => `  ${t.symbol} (${t.name}) — Score: ${t.score}/100 — ${t.reason}`).join("\n")}

═══════════════════════════════════════
BULL ANALYST:
═══════════════════════════════════════
Opportunity Score: ${bullAnalysis.opportunityScore}/100 | Confidence: ${bullAnalysis.confidence}/100
Arguments:
${bullAnalysis.bullishArguments.map((a, i) => `  ${i + 1}. ${a}`).join("\n")}

═══════════════════════════════════════
BEAR ANALYST:
═══════════════════════════════════════
Risk Score: ${bearAnalysis.riskScore}/100
Arguments:
${bearAnalysis.bearishArguments.map((a, i) => `  ${i + 1}. ${a}`).join("\n")}

═══════════════════════════════════════
RISK MANAGER:
═══════════════════════════════════════
Max Allocation: ${riskManagement.allocation}% | Risk Level: ${riskManagement.riskLevel}
Portfolio Impact: ${riskManagement.portfolioImpact}

═══════════════════════════════════════
YOUR DECISION:
═══════════════════════════════════════
Synthesize all the above and make your final recommendation. Be decisive and clear.`;
}
