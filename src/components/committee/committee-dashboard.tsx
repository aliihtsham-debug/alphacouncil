"use client";

/**
 * Committee Dashboard Component
 *
 * Main debate dashboard layout composing agent cards,
 * debate stream, and input.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Shield,
  BarChart3,
  Target,
  ArrowRight,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { AgentCard } from "./agent-card";
import { DebateStream } from "./debate-stream";
import { DebateInput } from "./debate-input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AgentState, AgentType, DebateMessage, FinalRecommendation } from "@/types/agent";

const agentConfig: Record<
  AgentType,
  {
    name: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {
  [AgentType.MARKET_RESEARCH]: {
    name: "Market Research",
    icon: BarChart3,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Scans CoinMarketCap for opportunities",
  },
  [AgentType.BULL_ANALYST]: {
    name: "Bull Analyst",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Argues for buying opportunities",
  },
  [AgentType.BEAR_ANALYST]: {
    name: "Bear Analyst",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Challenges bullish assumptions",
  },
  [AgentType.RISK_MANAGER]: {
    name: "Risk Manager",
    icon: Target,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Protects portfolio from overexposure",
  },
  [AgentType.PORTFOLIO_MANAGER]: {
    name: "Portfolio Manager",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Makes the final investment decision",
  },
};

const examplePrompts = [
  "Find the best AI token opportunity this week",
  "I have $5,000 and moderate risk tolerance",
  "Review my portfolio and suggest rebalancing",
  "Find opportunities in the BNB ecosystem",
];

interface CommitteeDashboardProps {
  agents: Record<AgentType, AgentState>;
  messages: DebateMessage[];
  isActive: boolean;
  isStreaming: boolean;
  finalRecommendation: FinalRecommendation | null;
  error: string | null;
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export function CommitteeDashboard({
  agents,
  messages,
  isActive,
  isStreaming,
  finalRecommendation,
  error,
  prompt,
  onPromptChange,
  onSubmit,
  onReset,
}: CommitteeDashboardProps) {
  const isDebating = isActive || isStreaming;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold">
          Investment <span className="text-gradient-cyan">Committee</span>
        </h1>
        <p className="text-muted-foreground">
          Watch AI agents debate your investment question in real time
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="mx-auto max-w-2xl">
        <DebateInput
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          isDisabled={isDebating}
          isSubmitting={isDebating}
          examplePrompts={examplePrompts}
        />
      </div>

      {/* Agent Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(agentConfig).map(([type, config], i) => (
          <AgentCard
            key={type}
            type={type as AgentType}
            name={config.name}
            icon={config.icon}
            color={config.color}
            bgColor={config.bgColor}
            borderColor={config.borderColor}
            description={config.description}
            state={agents[type as AgentType]}
            index={i}
          />
        ))}
      </div>

      {/* Debate Stream */}
      <DebateStream messages={messages} />

      {/* Final Recommendation */}
      {finalRecommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl"
        >
          <GlassCard glow="cyan" className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Final Recommendation</h2>
            <div className="text-4xl font-extrabold text-gradient-cyan mb-2">
              {finalRecommendation.decision}
            </div>
            <div className="text-lg font-semibold mb-1">
              {finalRecommendation.tokenName} ({finalRecommendation.tokenSymbol})
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Allocation: {finalRecommendation.allocation}% | Confidence:{" "}
              {finalRecommendation.confidence}%
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {finalRecommendation.investmentThesis}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="success" asChild>
                <Link href="/recommendation" className="gap-2">
                  Review & Approve
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={onReset}>
                New Debate
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Reset during debate */}
      {isDebating && !finalRecommendation && (
        <div className="text-center">
          <Button variant="ghost" onClick={onReset}>
            Cancel Debate
          </Button>
        </div>
      )}
    </div>
  );
}
