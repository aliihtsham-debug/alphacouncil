"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Search,
  Filter,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatUsd, formatPercent, formatCompact } from "@/lib/utils";
import type { CMCToken } from "@/services/coinmarketcap/types";
import { mockTokens } from "@/services/coinmarketcap/mock-data";

// ─── Category Tabs ───────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "All", icon: Flame },
  { id: "AI", label: "AI", icon: null },
  { id: "DeFi", label: "DeFi", icon: null },
  { id: "Gaming", label: "Gaming", icon: null },
  { id: "BNB", label: "BNB Chain", icon: null },
  { id: "Meme", label: "Meme", icon: null },
];

type ViewMode = "trending" | "gainers" | "losers";

const categoryTags: Record<string, string[]> = {
  AI: ["ai-big-data", "ai-agents", "artificial-intelligence"],
  DeFi: ["defi", "decentralized-finance"],
  Gaming: ["gaming", "metaverse", "play-to-earn"],
  BNB: ["bnb-chain", "binance-smart-chain", "bsc"],
  Meme: ["memes", "dog-themed"],
};

function filterByCategory(tokens: CMCToken[], category: string): CMCToken[] {
  if (category === "all") return tokens;
  const tags = categoryTags[category] ?? [];
  return tokens.filter((t) =>
    t.tags.some((tag) => tags.some((ct) => tag.includes(ct)))
  );
}

function sortByMode(tokens: CMCToken[], mode: ViewMode): CMCToken[] {
  const sorted = [...tokens];
  if (mode === "gainers") {
    sorted.sort(
      (a, b) =>
        (b.quote.USD.percent_change_24h ?? 0) -
        (a.quote.USD.percent_change_24h ?? 0)
    );
  } else if (mode === "losers") {
    sorted.sort(
      (a, b) =>
        (a.quote.USD.percent_change_24h ?? 0) -
        (b.quote.USD.percent_change_24h ?? 0)
    );
  }
  return sorted;
}

// ─── Token Card Component ────────────────────────────────

function TokenCard({ token, rank }: { token: CMCToken; rank: number }) {
  const change24h = token.quote.USD.percent_change_24h ?? 0;
  const isPositive = change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <GlassCard hover className="p-4">
        <div className="flex items-center gap-4">
          {/* Rank */}
          <div className="w-6 text-center text-sm font-bold text-muted-foreground">
            {rank + 1}
          </div>

          {/* Token info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{token.symbol}</span>
              <span className="text-xs text-muted-foreground">
                {token.name}
              </span>
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

// ─── Main Page ───────────────────────────────────────────

export default function ScannerPage() {
  const [category, setCategory] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("trending");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [apiTokens, setApiTokens] = React.useState<CMCToken[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch tokens from API on mount and when viewMode changes
  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const endpoint =
      viewMode === "gainers"
        ? "/api/market/tokens?type=gainers"
        : viewMode === "losers"
          ? "/api/market/tokens?type=losers"
          : "/api/market/trending?limit=50";

    fetch(endpoint)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success && result.data) {
          setApiTokens(result.data);
        } else {
          // Fallback to mock data
          setApiTokens(mockTokens);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setApiTokens(mockTokens);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  const tokens = React.useMemo(() => {
    const filtered = filterByCategory(apiTokens, category);
    const sorted = sortByMode(filtered, viewMode);
    if (!search) return sorted;
    return sorted.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [apiTokens, category, viewMode, search]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Market <span className="text-gradient-cyan">Scanner</span>
        </h1>
        <p className="text-muted-foreground">
          Discover trending opportunities across categories
        </p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tokens..."
            className="pl-10"
          />
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2">
          {[
            { mode: "trending" as ViewMode, label: "Trending", icon: Flame },
            { mode: "gainers" as ViewMode, label: "Gainers", icon: TrendingUp },
            { mode: "losers" as ViewMode, label: "Losers", icon: TrendingDown },
          ].map(({ mode, label, icon: Icon }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewModeChange(mode)}
              className="gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200",
              category === cat.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            )}
          >
            {cat.icon && <cat.icon className="h-4 w-4" />}
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Token list */}
      <div className="space-y-3">
        {isLoading
          ? [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          : tokens.length > 0
          ? tokens.map((token, i) => (
              <TokenCard key={token.symbol} token={token} rank={i} />
            ))
          : (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tokens found matching your criteria</p>
              </div>
            )}
      </div>
    </div>
  );
}
