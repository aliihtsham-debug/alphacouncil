"use client";

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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAgentStore } from "@/stores/agent-store";
import { useDebate } from "@/hooks/use-debate";
import { AgentType, AgentStatus } from "@/types/agent";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

export default function CommitteePage() {
  const [prompt, setPrompt] = React.useState("");
  const { agents, isActive, finalRecommendation, error } = useAgentStore();
  const { isStreaming, startDebate, resetDebate } = useDebate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;
    startDebate(prompt);
  };

  const isDebating = isActive || isStreaming;

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.IDLE:
        return <Badge variant="outline">Idle</Badge>;
      case AgentStatus.THINKING:
        return <Badge variant="info">Thinking...</Badge>;
      case AgentStatus.STREAMING:
        return <Badge variant="default">Streaming</Badge>;
      case AgentStatus.COMPLETED:
        return <Badge variant="success">Complete</Badge>;
      case AgentStatus.ERROR:
        return <Badge variant="danger">Error</Badge>;
    }
  };

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
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl"
      >
        <div className="glass rounded-xl p-2 flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the committee..."
            className="border-0 bg-transparent focus-visible:ring-0"
            disabled={isDebating}
          />
          <Button
            type="submit"
            variant="glow"
            disabled={isDebating || !prompt.trim()}
          >
            {isDebating ? "Debating..." : "Start Debate"}
          </Button>
        </div>

        {/* Example prompts */}
        {!isDebating && (
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {examplePrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full px-3 py-1 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.form>

      {/* Agent Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(agentConfig).map(([type, config], i) => {
          const agentState = agents[type as AgentType];
          const Icon = config.icon;

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <GlassCard
                className={cn(
                  "h-full p-5 transition-all duration-300",
                  agentState.status === AgentStatus.THINKING && "shadow-glow",
                  agentState.status === AgentStatus.STREAMING && "shadow-glow",
                  agentState.status === AgentStatus.COMPLETED &&
                    "border-green-500/30"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", config.color)} />
                  </div>
                  {getStatusBadge(agentState.status)}
                </div>

                <h3 className="font-semibold mb-1">{config.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {config.description}
                </p>

                {/* Animated progress for active agents */}
                {(agentState.status === AgentStatus.THINKING ||
                  agentState.status === AgentStatus.STREAMING) && (
                  <Progress
                    value={
                      agentState.status === AgentStatus.STREAMING ? 60 : 30
                    }
                    className="h-1"
                    indicatorClassName="bg-primary"
                  />
                )}

                {/* Output preview */}
                {agentState.output && (
                  <div className="mt-3 rounded-lg bg-muted/30 p-3 text-xs">
                    <pre className="whitespace-pre-wrap text-muted-foreground font-mono">
                      {JSON.stringify(agentState.output, null, 2).slice(0, 300)}
                      {JSON.stringify(agentState.output).length > 300 && "..."}
                    </pre>
                  </div>
                )}

                {/* Error display */}
                {agentState.error && (
                  <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
                    {agentState.error}
                  </div>
                )}

                {/* Latency */}
                {agentState.latencyMs && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Completed in {(agentState.latencyMs / 1000).toFixed(1)}s
                  </p>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

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
              <Button variant="outline" onClick={resetDebate}>
                New Debate
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Reset during debate */}
      {isDebating && !finalRecommendation && (
        <div className="text-center">
          <Button variant="ghost" onClick={resetDebate}>
            Cancel Debate
          </Button>
        </div>
      )}
    </div>
  );
}
