/**
 * AI Agent types
 */

export enum AgentType {
  MARKET_RESEARCH = "MARKET_RESEARCH",
  BULL_ANALYST = "BULL_ANALYST",
  BEAR_ANALYST = "BEAR_ANALYST",
  RISK_MANAGER = "RISK_MANAGER",
  PORTFOLIO_MANAGER = "PORTFOLIO_MANAGER",
}

export enum AgentStatus {
  IDLE = "IDLE",
  THINKING = "THINKING",
  STREAMING = "STREAMING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
}

export interface AgentState {
  type: AgentType;
  status: AgentStatus;
  output: AgentOutput | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  latencyMs: number | null;
}

// ─── Agent Outputs ──────────────────────────────────────

export interface MarketResearchOutput {
  candidateTokens: CandidateToken[];
  trends: string[];
  marketSummary: string;
}

export interface CandidateToken {
  symbol: string;
  name: string;
  reason: string;
  score: number; // 0-100
}

export interface BullAnalystOutput {
  bullishArguments: string[];
  opportunityScore: number; // 0-100
  confidence: number; // 0-100
}

export interface BearAnalystOutput {
  bearishArguments: string[];
  riskScore: number; // 0-100
}

export interface RiskManagerOutput {
  allocation: number; // percentage
  portfolioImpact: string;
  riskLevel: "low" | "medium" | "high" | "extreme";
}

export interface PortfolioManagerOutput {
  decision: "BUY" | "HOLD" | "SELL";
  confidence: number; // 0-100
  thesis: string;
  allocation: number; // percentage
}

export type AgentOutput =
  | MarketResearchOutput
  | BullAnalystOutput
  | BearAnalystOutput
  | RiskManagerOutput
  | PortfolioManagerOutput;

// ─── Debate Types ───────────────────────────────────────

export interface DebateMessage {
  id: string;
  agentType: AgentType;
  content: string;
  timestamp: string;
  isComplete: boolean;
}

export interface DebateSession {
  id: string;
  prompt: string;
  status: "active" | "completed" | "error";
  agents: Record<AgentType, AgentState>;
  messages: DebateMessage[];
  finalRecommendation: FinalRecommendation | null;
  createdAt: string;
  completedAt: string | null;
}

export interface FinalRecommendation {
  decision: "BUY" | "HOLD" | "SELL";
  tokenSymbol: string;
  tokenName: string;
  allocation: number;
  confidence: number;
  investmentThesis: string;
  supportingArguments: string[];
  risks: string[];
}

// ─── SSE Event Types ────────────────────────────────────

export type SSEEvent =
  | { type: "session_start"; sessionId: string }
  | { type: "agent_start"; agent: AgentType; timestamp: string }
  | { type: "agent_token"; agent: AgentType; token: string }
  | { type: "agent_end"; agent: AgentType; output: AgentOutput; latencyMs: number }
  | { type: "final"; recommendation: FinalRecommendation }
  | { type: "error"; agent?: AgentType; message: string }
  | { type: "done" };
