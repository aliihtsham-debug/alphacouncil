"use client";

/**
 * Confidence Gauge Component
 *
 * Circular confidence indicator (SVG).
 * Color-coded: green (70+), yellow (40-69), red (<40).
 */

import * as React from "react";
import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
  className?: string;
}

export function ConfidenceGauge({ value, size = 120, className }: ConfidenceGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  const getColor = () => {
    if (value >= 70) return "#22c55e"; // green
    if (value >= 40) return "#eab308"; // yellow
    return "#ef4444"; // red
  };

  const getLabel = () => {
    if (value >= 70) return "High";
    if (value >= 40) return "Medium";
    return "Low";
  };

  return (
    <div className={`relative inline-flex ${className ?? ""}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{value}%</span>
        <span className="text-xs text-muted-foreground">{getLabel()}</span>
      </div>
    </div>
  );
}
