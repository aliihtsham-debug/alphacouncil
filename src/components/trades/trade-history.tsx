"use client";

/**
 * Trade History Component
 *
 * Trade history list with status badges, tx hashes, and timestamps.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Check, X, ExternalLink, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatUsd } from "@/lib/utils";
import type { Trade } from "@/stores/trade-store";

interface TradeHistoryProps {
  trades: Trade[];
  className?: string;
}

export function TradeHistory({ trades, className }: TradeHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Confirmed</Badge>;
      case "SUBMITTED":
        return (
          <Badge variant="warning" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Pending
          </Badge>
        );
      case "FAILED":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (trades.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No Trades Yet"
        description="Trades executed from the recommendation page will appear here. Start a debate on the Committee page to get your first recommendation."
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {trades.map((trade, i) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Action indicator */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      trade.action === "BUY"
                        ? "bg-green-500/10"
                        : trade.action === "SELL"
                          ? "bg-red-500/10"
                          : "bg-yellow-500/10"
                    }`}
                  >
                    {trade.action === "BUY" ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : trade.action === "SELL" ? (
                      <X className="h-5 w-5 text-red-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                  </div>

                  {/* Trade info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.action}</span>
                      <span className="font-bold text-lg">{trade.tokenSymbol}</span>
                      {getStatusBadge(trade.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.amount.toFixed(2)} {trade.tokenSymbol} •{" "}
                      {formatUsd(trade.amountUsd)}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {trade.txHash && (
                    <div className="flex items-center gap-1 text-xs text-primary mt-1">
                      <span className="font-mono">
                        {trade.txHash.slice(0, 10)}...{trade.txHash.slice(-8)}
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
