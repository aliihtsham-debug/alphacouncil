"use client";

/**
 * Gainer/Loser Component
 *
 * Top gainers/losers list using TokenCard with sort by percent change.
 */

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { TokenCard } from "./token-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonCard } from "@/components/shared/skeleton-loader";
import type { CMCToken } from "@/services/coinmarketcap/types";

interface GainerLoserProps {
  limit?: number;
  className?: string;
}

export function GainerLoser({ limit = 20, className }: GainerLoserProps) {
  const [gainers, setGainers] = React.useState<CMCToken[]>([]);
  const [losers, setLosers] = React.useState<CMCToken[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/market/gainers?limit=${limit}`).then((res) => res.json()),
      fetch(`/api/market/losers?limit=${limit}`).then((res) => res.json()),
    ]).then(([gainersResult, losersResult]) => {
      if (cancelled) return;
      if (gainersResult.success) setGainers(gainersResult.data);
      if (losersResult.success) setLosers(losersResult.data);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <GlassCard className={className}>
      <Tabs defaultValue="gainers">
        <div className="p-4 border-b border-border">
          <TabsList className="w-full">
            <TabsTrigger value="gainers" className="flex-1 gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="flex-1 gap-1.5">
              <TrendingDown className="h-4 w-4 text-red-400" />
              Top Losers
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="gainers" className="p-4 space-y-3 m-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} lines={1} showHeader={false} className="h-16" />
            ))
          ) : gainers.length > 0 ? (
            gainers.map((token, i) => (
              <TokenCard key={token.symbol} token={token} rank={i} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No gainers data available
            </div>
          )}
        </TabsContent>

        <TabsContent value="losers" className="p-4 space-y-3 m-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} lines={1} showHeader={false} className="h-16" />
            ))
          ) : losers.length > 0 ? (
            losers.map((token, i) => (
              <TokenCard key={token.symbol} token={token} rank={i} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No losers data available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </GlassCard>
  );
}
