"use client";

/**
 * Debate Stream Component
 *
 * Scrollable debate log showing messages chronologically
 * with agent-colored borders.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";
import { DebateMessage, AgentType } from "@/types/agent";

const agentColors: Record<AgentType, string> = {
  [AgentType.MARKET_RESEARCH]: "border-l-cyan-500",
  [AgentType.BULL_ANALYST]: "border-l-green-500",
  [AgentType.BEAR_ANALYST]: "border-l-red-500",
  [AgentType.RISK_MANAGER]: "border-l-orange-500",
  [AgentType.PORTFOLIO_MANAGER]: "border-l-purple-500",
};

const agentNames: Record<AgentType, string> = {
  [AgentType.MARKET_RESEARCH]: "Market Research",
  [AgentType.BULL_ANALYST]: "Bull Analyst",
  [AgentType.BEAR_ANALYST]: "Bear Analyst",
  [AgentType.RISK_MANAGER]: "Risk Manager",
  [AgentType.PORTFOLIO_MANAGER]: "Portfolio Manager",
};

interface DebateStreamProps {
  messages: DebateMessage[];
  className?: string;
}

export function DebateStream({ messages, className }: DebateStreamProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <GlassCard className={cn("p-4", className)}>
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
        Debate Log
      </h3>
      <div
        ref={scrollRef}
        className="space-y-3 max-h-80 overflow-y-auto pr-2"
      >
        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "border-l-2 pl-3 py-1",
              agentColors[message.agentType] ?? "border-l-primary"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium">
                {agentNames[message.agentType] ?? message.agentType}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{message.content}</p>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
