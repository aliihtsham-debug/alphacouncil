"use client";

/**
 * Asset List Component
 *
 * Holdings table: Asset, Amount, Value, Allocation, 24h change, Sector.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { formatUsd, formatPercent } from "@/lib/utils";
import type { TokenHolding } from "@/types/portfolio";

interface AssetListProps {
  assets: TokenHolding[];
  className?: string;
}

export function AssetList({ assets, className }: AssetListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={className}
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
              {assets.map((asset) => (
                <tr key={asset.tokenSymbol} className="border-b border-border/50">
                  <td className="py-3">
                    <div className="font-medium">{asset.tokenSymbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.tokenName}</div>
                  </td>
                  <td className="py-3 text-right font-mono">{asset.amount}</td>
                  <td className="py-3 text-right font-mono">{formatUsd(asset.valueUsd)}</td>
                  <td className="py-3 text-right">{formatPercent(asset.allocationPct * 100, 1)}</td>
                  <td
                    className={`py-3 text-right ${
                      asset.priceChange24h && asset.priceChange24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
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
  );
}
