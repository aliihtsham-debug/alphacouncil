"use client";

/**
 * Sector Breakdown Component
 *
 * Horizontal bar chart (Recharts) for sector distribution.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { formatPercent } from "@/lib/utils";
import type { SectorAllocation } from "@/types/portfolio";

interface SectorBreakdownProps {
  sectors: SectorAllocation[];
  className?: string;
}

export function SectorBreakdown({ sectors, className }: SectorBreakdownProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={className}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sector Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sectors} layout="vertical">
            <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="sector" width={80} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatPercent(Number(value) * 100, 1)}
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
  );
}
