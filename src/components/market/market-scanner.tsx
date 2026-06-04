"use client";

/**
 * Market Scanner Component
 *
 * Scanner layout: search, view mode toggle, category filters, token list.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, TrendingUp, TrendingDown, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TokenCard } from "./token-card";
import type { CMCToken } from "@/services/coinmarketcap/types";

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

// ─── Main Component ──────────────────────────────────────

interface MarketScannerProps {
  className?: string;
}

export function MarketScanner({ className }: MarketScannerProps) {
  const [category, setCategory] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("trending");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [apiTokens, setApiTokens] = React.useState<CMCToken[]>([]);

  // Fetch tokens from API on mount and when viewMode changes
  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

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
          setApiTokens([]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setApiTokens([]);
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

  return (
    <div className={className}>
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
              onClick={() => setViewMode(mode)}
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
            onClick={() => setCategory(cat.id)}
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
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : tokens.length > 0 ? (
          tokens.map((token, i) => (
            <TokenCard key={token.symbol} token={token} rank={i} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tokens found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
