"use client";

/**
 * Recommendation Card Component
 *
 * Final recommendation display: decision badge, token info, allocation, confidence bar.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  decision: string;
  tokenSymbol: string;
  tokenName: string;
  allocation: number;
  confidence: number;
  showModify?: boolean;
  modifiedAllocation?: number;
  onAllocationChange?: (value: number) => void;
  className?: string;
}

export function RecommendationCard({
  decision,
  tokenSymbol,
  tokenName,
  allocation,
  confidence,
  showModify = false,
  modifiedAllocation,
  onAllocationChange,
  className,
}: RecommendationCardProps) {
  const decisionColor =
    decision === "BUY"
      ? "text-green-400"
      : decision === "SELL"
        ? "text-red-400"
        : "text-yellow-400";

  const decisionBg =
    decision === "BUY"
      ? "bg-green-500/10 border-green-500/30"
      : decision === "SELL"
        ? "bg-red-500/10 border-red-500/30"
        : "bg-yellow-500/10 border-yellow-500/30";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className={className}
    >
      <GlassCard className={cn(`p-8 text-center border`, decisionBg)}>
        <div className={cn("text-6xl font-extrabold", decisionColor, "mb-2")}>
          {decision}
        </div>
        <div className="text-2xl font-bold mb-1">{tokenName}</div>
        <div className="text-lg text-muted-foreground mb-6">{tokenSymbol}</div>

        <div className="flex justify-center gap-8 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Allocation</div>
            {showModify ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={modifiedAllocation ?? allocation}
                  onChange={(e) =>
                    onAllocationChange?.(Math.min(25, Math.max(0, Number(e.target.value))))
                  }
                  className="w-20 text-center h-8"
                  min={0}
                  max={25}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            ) : (
              <div className="text-2xl font-bold">{allocation}%</div>
            )}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
            <div className="text-2xl font-bold">{confidence}%</div>
          </div>
        </div>

        <Progress
          value={confidence}
          className="h-2 max-w-xs mx-auto"
          indicatorClassName={
            confidence >= 70
              ? "bg-green-500"
              : confidence >= 40
                ? "bg-yellow-500"
                : "bg-red-500"
          }
        />
      </GlassCard>
    </motion.div>
  );
}
