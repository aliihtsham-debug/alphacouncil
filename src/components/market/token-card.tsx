"use client";

/**
 * Token Card Component
 *
 * Individual token card: rank, symbol, name, market cap, price, 24h change, tags.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn, formatUsd, formatPercent, formatCompact } from "@/lib/utils";
import type { CMCToken } from "@/services/coinmarketcap/types";

interface TokenCardProps {
  token: CMCToken;
  rank: number;
  className?: string;
}

export function TokenCard({ token, rank, className }: TokenCardProps) {
  const change24h = token.quote.USD.percent_change_24h ?? 0;
  const isPositive = change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <GlassCard hover className={cn("p-4", className)}>
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="w-6 text-center text-sm font-bold text-muted-foreground">
            {rank + 1}
          </div>

          {/* Token info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{token.symbol}</span>
              <span className="text-xs text-muted-foreground">{token.name}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              MCap: {formatCompact(token.quote.USD.market_cap ?? 0)}
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="font-mono font-semibold">
              {formatUsd(token.quote.USD.price)}
            </div>
            <div
              className={cn(
                "text-xs font-medium flex items-center justify-end gap-1",
                isPositive ? "text-green-400" : "text-red-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {formatPercent(change24h)}
            </div>
          </div>

          {/* Tags */}
          <div className="hidden sm:flex gap-1">
            {token.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
