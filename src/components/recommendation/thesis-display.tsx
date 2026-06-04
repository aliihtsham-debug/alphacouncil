"use client";

/**
 * Thesis Display Component
 *
 * Investment thesis with supporting arguments and risk factors lists.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

interface ThesisDisplayProps {
  thesis: string;
  supportingArguments?: string[];
  risks?: string[];
  className?: string;
}

export function ThesisDisplay({
  thesis,
  supportingArguments = [],
  risks = [],
  className,
}: ThesisDisplayProps) {
  return (
    <div className={className}>
      {/* Thesis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Investment Thesis
          </h3>
          <p className="text-muted-foreground leading-relaxed">{thesis}</p>
        </GlassCard>
      </motion.div>

      {/* Arguments */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Supporting Arguments
            </h3>
            <ul className="space-y-3">
              {supportingArguments.map((arg, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  <span className="text-muted-foreground">{arg}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Risk Factors
            </h3>
            <ul className="space-y-3">
              {risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
