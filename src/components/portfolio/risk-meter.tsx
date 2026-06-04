"use client";

/**
 * Risk Meter Component
 *
 * Risk gauge visualization with 0-100 scale and color zones.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { getRiskColor, getRiskLevel } from "@/lib/utils";

interface RiskMeterProps {
  riskScore: number;
  className?: string;
}

export function RiskMeter({ riskScore, className }: RiskMeterProps) {
  const riskLevel = getRiskLevel(riskScore);
  const riskColor = getRiskColor(riskLevel);

  // Calculate the angle for the gauge needle (0-180 degrees)
  const angle = (riskScore / 100) * 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className={className}
    >
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Risk Gauge</h3>

        {/* Gauge visualization */}
        <div className="relative w-48 h-24 mx-auto mb-4">
          {/* Background arc */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Green zone (0-25) */}
            <path
              d="M 20 90 A 80 80 0 0 1 55 25"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Yellow zone (25-50) */}
            <path
              d="M 55 25 A 80 80 0 0 1 100 15"
              fill="none"
              stroke="#eab308"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Orange zone (50-75) */}
            <path
              d="M 100 15 A 80 80 0 0 1 145 25"
              fill="none"
              stroke="#f97316"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Red zone (75-100) */}
            <path
              d="M 145 25 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>

          {/* Needle */}
          <motion.div
            className="absolute bottom-0 left-1/2 origin-bottom"
            style={{ marginLeft: -1 }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle - 90 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="w-0.5 h-16 bg-white rounded-full" />
          </motion.div>

          {/* Center circle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary" />
        </div>

        {/* Score display */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${riskColor}`}>{riskScore}</div>
          <div className="text-sm text-muted-foreground mt-1">{riskLevel.toUpperCase()} RISK</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
