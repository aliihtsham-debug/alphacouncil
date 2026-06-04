"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, TrendingUp, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const agents = [
  {
    name: "Market Research",
    icon: BarChart3,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    status: "Analyzing markets...",
  },
  {
    name: "Bull Analyst",
    icon: TrendingUp,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    status: "Finding opportunities...",
  },
  {
    name: "Bear Analyst",
    icon: Shield,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    status: "Checking risks...",
  },
  {
    name: "Portfolio Manager",
    icon: Brain,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    status: "Making decisions...",
  },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="text-sm font-medium text-primary">
            AI-Powered Investment Committee
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          Your AI Investment
          <br />
          <span className="text-gradient-cyan">Committee</span> for{" "}
          <span className="text-gradient-purple">Crypto</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Multiple specialized AI agents debate investment opportunities before
          reaching a decision. Transparent reasoning. Professional risk management.
          One-click execution.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button variant="glow" size="lg" className="gap-2 text-base" asChild>
            <Link href="/committee">
              Start Analysis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </motion.div>

        {/* Agent Cards Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              className={`glass rounded-xl p-4 border ${agent.borderColor} hover:scale-105 transition-transform duration-300`}
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${agent.bgColor}`}
              >
                <agent.icon className={`h-6 w-6 ${agent.color}`} />
              </div>
              <h3 className="mb-1 text-sm font-semibold">{agent.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </span>
                {agent.status}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
