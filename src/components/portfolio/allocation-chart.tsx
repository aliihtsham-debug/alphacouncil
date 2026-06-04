"use client";

/**
 * Allocation Chart Component
 *
 * Pie chart (Recharts) for asset allocation with color-coded segments and legend.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { formatUsd, formatPercent } from "@/lib/utils";
import type { TokenHolding } from "@/types/portfolio";

const COLORS = ["#06b6d4", "#a855f7", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6"];

interface AllocationChartProps {
  assets: TokenHolding[];
  className?: string;
}

export function AllocationChart({ assets, className }: AllocationChartProps) {
  const data = assets.map((asset) => ({
    name: asset.tokenSymbol,
    value: asset.valueUsd,
    allocation: asset.allocationPct,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={className}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatUsd(Number(value))}
              contentStyle={{
                background: "rgba(18, 18, 31, 0.9)",
                border: "1px solid rgba(42, 42, 69, 0.5)",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {assets.map((asset, i) => (
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
  );
}
