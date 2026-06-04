"use client";

/**
 * Agent Showcase Component
 *
 * Animated agent preview cards for the landing page.
 * Shows all 5 agents with icons, names, and descriptions.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Shield,
  BarChart3,
  Target,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

const agents = [
  {
    name: "Market Research",
    icon: BarChart3,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    description: "Scans CoinMarketCap for opportunities and identifies trending tokens across categories.",
  },
  {
    name: "Bull Analyst",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    description: "Argues for buying opportunities with supporting market data and momentum analysis.",
  },
  {
    name: "Bear Analyst",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "Challenges bullish assumptions and identifies potential risks and downsides.",
  },
  {
    name: "Risk Manager",
    icon: Target,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Protects portfolio from overexposure and calculates optimal position sizing.",
  },
  {
    name: "Portfolio Manager",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Makes the final investment decision by synthesizing all agent perspectives.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AgentShowcase() {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">
          Meet the <span className="text-gradient-cyan">Committee</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Five specialized AI agents debate your investment question,
          each bringing a unique perspective to the table.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <motion.div key={agent.name} variants={cardVariants}>
              <GlassCard
                hover
                className={cn(
                  "h-full p-5 transition-all duration-300",
                  agent.borderColor
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg mb-4",
                    agent.bgColor
                  )}
                >
                  <Icon className={cn("h-6 w-6", agent.color)} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{agent.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
