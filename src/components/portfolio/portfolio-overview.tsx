"use client";

/**
 * Portfolio Overview Component
 *
 * Summary cards showing total value, risk score, stablecoin ratio, and concentration.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { DollarSign, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Badge } from "@/components/ui/badge";
import { getRiskColor, getRiskLevel } from "@/lib/utils";
import type { PortfolioAnalysis } from "@/types/portfolio";

interface PortfolioOverviewProps {
  data: PortfolioAnalysis;
  className?: string;
}

export function PortfolioOverview({ data, className }: PortfolioOverviewProps) {
  const riskLevel = getRiskLevel(data.riskScore);

  const cards = [
    {
      label: "Total Value",
      value: `$${data.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
      value: `${(data.stablecoinRatio * 100).toFixed(1)}%`,
      icon: data.stablecoinRatio > 0.1 ? TrendingUp : TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Concentration",
      value: `${(data.concentrationRisk * 100).toFixed(1)}%`,
      icon: AlertTriangle,
      color: data.concentrationRisk > 0.3 ? "text-yellow-400" : "text-green-400",
      bgColor: "bg-yellow-500/10",
    },
  ];

  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}
                >
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
    </div>
  );
}
