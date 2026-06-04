"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Shield, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useWallet } from "@/hooks/use-wallet";
import { RefreshCw } from "lucide-react";
import { formatUsd, formatPercent, getRiskColor, getRiskLevel } from "@/lib/utils";

const COLORS = ["#06b6d4", "#a855f7", "#22c55e", "#f59e0b", "#ef4444"];

export default function PortfolioPage() {
  const { address, isConnected, refreshPortfolio } = useWallet();
  const { data, isLoading, setPortfolio, setLoading, setError } = usePortfolioStore();

  React.useEffect(() => {
    if (isConnected && address && !data) {
      setLoading(true);
      refreshPortfolio().catch(() => {
        // Fallback: fetch from API directly
        fetch(`/api/portfolio?address=${address}&chain=BNB`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) setPortfolio(result.data);
            else setError(result.error ?? "Failed to load portfolio");
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      });
    }
  }, [isConnected, address, data, setPortfolio, setLoading, setError, refreshPortfolio]);

  const handleRefresh = () => {
    if (address) {
      setLoading(true);
      refreshPortfolio().catch(() => {
        fetch(`/api/portfolio?address=${address}&chain=BNB`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) setPortfolio(result.data);
            else setError(result.error ?? "Failed to refresh");
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-muted-foreground">
          Connect your Trust Wallet to view portfolio analysis
        </p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const riskLevel = getRiskLevel(data.riskScore);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Portfolio <span className="text-gradient-cyan">Overview</span>
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground">
            Last analyzed: {new Date(data.analyzedAt).toLocaleString()}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Value",
            value: formatUsd(data.totalValueUsd),
            icon: DollarSign,
            color: "text-cyan-400",
            bgColor: "bg-cyan-500/10",
          },
          {
            label: "Risk Score",
            value: `${data.riskScore}/100`,
            icon: Shield,
            color: getRiskColor(riskLevel),
            bgColor: "bg-orange-500/10",
            badge: riskLevel.toUpperCase(),
          },
          {
            label: "Stablecoin Ratio",
            value: formatPercent(data.stablecoinRatio * 100, 1),
            icon: data.stablecoinRatio > 0.1 ? TrendingUp : TrendingDown,
            color: "text-green-400",
            bgColor: "bg-green-500/10",
          },
          {
            label: "Concentration",
            value: formatPercent(data.concentrationRisk * 100, 1),
            icon: AlertTriangle,
            color: data.concentrationRisk > 0.3 ? "text-yellow-400" : "text-green-400",
            bgColor: "bg-yellow-500/10",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.badge && (
                <Badge variant="warning" className="mt-2">{card.badge}</Badge>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Allocation Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.assets}
                  dataKey="valueUsd"
                  nameKey="tokenSymbol"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {data.assets.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatUsd(Number(value))}
                  contentStyle={{
                    background: "rgba(18, 18, 31, 0.9)",
                    border: "1px solid rgba(42, 42, 69, 0.5)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {data.assets.map((asset, i) => (
                <div key={asset.tokenSymbol} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {asset.tokenSymbol} ({formatPercent(asset.allocationPct * 100, 1)})
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Sector Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sector Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.sectorDistribution} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="sector" width={80} />
                <Tooltip
                  formatter={(value) => formatPercent(Number(value) * 100, 1)}
                  contentStyle={{
                    background: "rgba(18, 18, 31, 0.9)",
                    border: "1px solid rgba(42, 42, 69, 0.5)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="allocationPct" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Asset Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Asset</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3 text-right font-medium">Value</th>
                  <th className="pb-3 text-right font-medium">Allocation</th>
                  <th className="pb-3 text-right font-medium">24h</th>
                  <th className="pb-3 text-left font-medium">Sector</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.map((asset) => (
                  <tr key={asset.tokenSymbol} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="font-medium">{asset.tokenSymbol}</div>
                      <div className="text-xs text-muted-foreground">{asset.tokenName}</div>
                    </td>
                    <td className="py-3 text-right font-mono">{asset.amount}</td>
                    <td className="py-3 text-right font-mono">{formatUsd(asset.valueUsd)}</td>
                    <td className="py-3 text-right">{formatPercent(asset.allocationPct * 100, 1)}</td>
                    <td className={`py-3 text-right ${asset.priceChange24h && asset.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {asset.priceChange24h ? formatPercent(asset.priceChange24h) : "—"}
                    </td>
                    <td className="py-3">
                      <Badge variant="outline">{asset.sector}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
