"use client";

/**
 * Trade Detail Component
 *
 * Single trade detail view: token, action, amount, tx hash, status timeline.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Clock,
  ExternalLink,
  ArrowRight,
  Circle,
  CircleCheck,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { formatUsd } from "@/lib/utils";
import type { Trade } from "@/stores/trade-store";

interface TradeDetailProps {
  trade: Trade;
  className?: string;
}

export function TradeDetail({ trade, className }: TradeDetailProps) {
  const steps = [
    { label: "Created", time: trade.createdAt, completed: true },
    {
      label: "Submitted",
      time: trade.status !== "PENDING" ? trade.createdAt : null,
      completed: trade.status !== "PENDING",
    },
    {
      label: "Confirmed",
      time: trade.status === "CONFIRMED" ? trade.createdAt : null,
      completed: trade.status === "CONFIRMED",
    },
  ];

  const actionColor =
    trade.action === "BUY"
      ? "text-green-400"
      : trade.action === "SELL"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <GlassCard className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-2xl font-bold ${actionColor}`}>
                {trade.action}
              </span>
              <span className="text-xl font-semibold">{trade.tokenSymbol}</span>
            </div>
            <div className="text-sm text-muted-foreground">{trade.tokenName}</div>
          </div>
          <Badge
            variant={
              trade.status === "CONFIRMED"
                ? "success"
                : trade.status === "FAILED"
                  ? "danger"
                  : "warning"
            }
          >
            {trade.status}
          </Badge>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Amount</div>
            <div className="font-mono font-semibold">
              {trade.amount.toFixed(4)} {trade.tokenSymbol}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Value</div>
            <div className="font-mono font-semibold">{formatUsd(trade.amountUsd)}</div>
          </div>
        </div>

        {/* Transaction hash */}
        {trade.txHash && (
          <div className="mb-6 p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Transaction Hash</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm break-all">{trade.txHash}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
            </div>
          </div>
        )}

        {/* Status timeline */}
        <div>
          <div className="text-xs text-muted-foreground mb-3">Status Timeline</div>
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex items-center gap-1.5">
                  {step.completed ? (
                    <CircleCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={`text-xs ${
                      step.completed ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
