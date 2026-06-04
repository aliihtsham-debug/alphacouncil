"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Gauge,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { formatUsd, formatPercent, cn } from "@/lib/utils";

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
}

const fallbackStats: MarketStats = {
  totalMarketCap: 2_847_000_000_000,
  totalVolume24h: 98_500_000_000,
  btcDominance: 52.3,
  fearGreedIndex: 62,
  fearGreedLabel: "Greed",
};

const fallbackTokens: Token[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67_250, change24h: 2.34, marketCap: 1_320_000_000_000 },
  { symbol: "ETH", name: "Ethereum", price: 3_243, change24h: -1.12, marketCap: 390_000_000_000 },
  { symbol: "BNB", name: "BNB", price: 283.66, change24h: 0.87, marketCap: 42_500_000_000 },
  { symbol: "SOL", name: "Solana", price: 178.5, change24h: 4.21, marketCap: 78_000_000_000 },
  { symbol: "FET", name: "Fetch.ai", price: 1.5, change24h: 8.45, marketCap: 3_750_000_000 },
];

export function MarketOverview() {
  const [stats, setStats] = React.useState<MarketStats>(fallbackStats);
  const [tokens, setTokens] = React.useState<Token[]>(fallbackTokens);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch("/api/market");
        if (response.ok) {
          const data = await response.json();
          if (data.stats) setStats(data.stats);
          if (data.tokens) setTokens(data.tokens);
        }
      } catch {
        // Use fallback data
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60_000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getFearGreedColor = (index: number) => {
    if (index >= 75) return "text-green-400";
    if (index >= 50) return "text-lime-400";
    if (index >= 25) return "text-yellow-400";
    return "text-red-400";
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <GlassCard key={i} className="p-6 animate-pulse">
                <div className="h-4 w-24 bg-muted/30 rounded mb-2" />
                <div className="h-8 w-32 bg-muted/30 rounded" />
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold mb-2">
            Market <span className="text-gradient-cyan">Overview</span>
          </h2>
          <p className="text-muted-foreground">
            Real-time crypto market data powering committee decisions
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            {
              label: "Total Market Cap",
              value: formatUsd(stats.totalMarketCap),
              icon: DollarSign,
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/10",
            },
            {
              label: "24h Volume",
              value: formatUsd(stats.totalVolume24h),
              icon: BarChart3,
              color: "text-purple-400",
              bgColor: "bg-purple-500/10",
            },
            {
              label: "BTC Dominance",
              value: formatPercent(stats.btcDominance),
              icon: Activity,
              color: "text-orange-400",
              bgColor: "bg-orange-500/10",
            },
            {
              label: "Fear & Greed",
              value: `${stats.fearGreedIndex} — ${stats.fearGreedLabel}`,
              icon: Gauge,
              color: getFearGreedColor(stats.fearGreedIndex),
              bgColor: "bg-green-500/10",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bgColor}`}
                    >
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                  <p className={cn("text-xl font-bold", stat.color)}>
                    {stat.value}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Top Tokens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              Top Tokens
            </h3>
            <div className="space-y-3">
              {tokens.map((token, i) => (
                <motion.div
                  key={token.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-xs font-bold">
                      {token.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{token.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {token.symbol} • MCap {formatUsd(token.marketCap)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatUsd(token.price)}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-medium flex items-center justify-end gap-1",
                        token.change24h >= 0 ? "text-green-400" : "text-red-400"
                      )}
                    >
                      {token.change24h >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {token.change24h >= 0 ? "+" : ""}
                      {formatPercent(token.change24h)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
