"use client";

/**
 * Trending Tokens Component
 *
 * Trending tokens list with rank, price, and change.
 * Fetches from the API.
 */

import * as React from "react";
import { Flame } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { TokenCard } from "./token-card";
import { SkeletonCard } from "@/components/shared/skeleton-loader";
import type { CMCToken } from "@/services/coinmarketcap/types";

interface TrendingTokensProps {
  limit?: number;
  className?: string;
}

export function TrendingTokens({ limit = 20, className }: TrendingTokensProps) {
  const [tokens, setTokens] = React.useState<CMCToken[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/market/trending?limit=${limit}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setTokens(result.data);
        } else {
          setError(result.error ?? "Failed to fetch trending tokens");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load trending tokens");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <GlassCard className={className}>
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          Trending Tokens
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} lines={1} showHeader={false} className="h-16" />
          ))
        ) : tokens.length > 0 ? (
          tokens.map((token, i) => (
            <TokenCard key={token.symbol} token={token} rank={i} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No trending tokens available
          </div>
        )}
      </div>
    </GlassCard>
  );
}
