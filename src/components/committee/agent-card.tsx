"use client";

/**
 * Agent Card Component
 *
 * Individual agent card with status badge, icon, output preview, and latency.
 * Animated progress for active agents.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AgentThinking } from "./agent-thinking";
import { AgentOutput } from "./agent-output";
import { cn } from "@/lib/utils";
import { AgentState, AgentStatus, AgentType } from "@/types/agent";

interface AgentCardProps {
  type: AgentType;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  state: AgentState;
  index?: number;
}

export function AgentCard({
  type,
  name,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  description,
  state,
  index = 0,
}: AgentCardProps) {
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

  const isActive =
    state.status === AgentStatus.THINKING ||
    state.status === AgentStatus.STREAMING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard
        className={cn(
          "h-full p-5 transition-all duration-300",
          isActive && "shadow-glow",
          state.status === AgentStatus.COMPLETED && "border-green-500/30"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              bgColor
            )}
          >
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          {getStatusBadge(state.status)}
        </div>

        <h3 className="font-semibold mb-1">{name}</h3>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>

        {/* Thinking animation */}
        {state.status === AgentStatus.THINKING && <AgentThinking />}

        {/* Animated progress for active agents */}
        {isActive && state.status !== AgentStatus.THINKING && (
          <Progress
            value={state.status === AgentStatus.STREAMING ? 60 : 30}
            className="h-1"
            indicatorClassName="bg-primary"
          />
        )}

        {/* Output preview */}
        {state.output && <AgentOutput output={state.output} />}

        {/* Error display */}
        {state.error && (
          <div className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
            {state.error}
          </div>
        )}

        {/* Latency */}
        {state.latencyMs && (
          <p className="mt-2 text-xs text-muted-foreground">
            Completed in {(state.latencyMs / 1000).toFixed(1)}s
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
