"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  BarChart3,
  Wallet,
  ScanLine,
  FileText,
  RefreshCw,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const features = [
  {
    icon: Brain,
    title: "AI Investment Committee",
    description:
      "Five specialized AI agents debate investment opportunities. Bull Analyst, Bear Analyst, Risk Manager, and Portfolio Manager collaborate to reach a consensus.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    glow: "cyan" as const,
  },
  {
    icon: BarChart3,
    title: "Portfolio Analysis",
    description:
      "Automatically analyze your connected wallet. Get insights on allocation, concentration risk, sector exposure, and stablecoin ratio.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    glow: "purple" as const,
  },
  {
    icon: Wallet,
    title: "Trust Wallet Execution",
    description:
      "Execute approved trades directly through Trust Wallet. One-click swaps with full transaction confirmation and history tracking.",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    glow: "green" as const,
  },
  {
    icon: ScanLine,
    title: "Market Scanner",
    description:
      "Scan trending tokens across categories: AI, DeFi, Gaming, BNB Ecosystem, and Meme Coins. Filter by top gainers, losers, and volume.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    glow: "none" as const,
  },
  {
    icon: FileText,
    title: "Investment Reports",
    description:
      "Generate shareable AI-generated reports with market summaries, opportunities, risks, and recommended actions. Export as PDF or Markdown.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    glow: "none" as const,
  },
  {
    icon: RefreshCw,
    title: "Weekly Rebalancing",
    description:
      "Automated weekly analysis suggests portfolio reallocation, risk reduction, and optimization opportunities based on market conditions.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    glow: "none" as const,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Powered by{" "}
            <span className="text-gradient-cyan">Multi-Agent Intelligence</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            More than a trading bot. Alpha Council simulates a professional hedge
            fund investment committee with transparent reasoning.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <GlassCard
                glow={feature.glow}
                hover
                className="h-full p-6"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
