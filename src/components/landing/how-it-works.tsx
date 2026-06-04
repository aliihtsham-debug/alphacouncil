"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  MessageSquare,
  Brain,
  FileCheck,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Wallet,
    title: "Connect Wallet",
    description:
      "Connect your Trust Wallet in one click. Your portfolio is automatically analyzed for allocation, risk, and sector exposure.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Enter Your Prompt",
    description:
      'Tell Alpha Council what you\'re looking for. "Find the best AI token" or "Review my portfolio" — just ask naturally.',
    color: "from-blue-500 to-blue-600",
  },
  {
    step: "03",
    icon: Brain,
    title: "Agents Debate",
    description:
      "Watch as Market Research, Bull Analyst, Bear Analyst, Risk Manager, and Portfolio Manager debate in real time.",
    color: "from-purple-500 to-purple-600",
  },
  {
    step: "04",
    icon: FileCheck,
    title: "Review & Execute",
    description:
      "Review the final recommendation with confidence score, thesis, and risk analysis. Approve, modify, or reject with one click.",
    color: "from-green-500 to-green-600",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            How <span className="text-gradient-purple">Alpha Council</span> Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            From wallet connection to trade execution in four simple steps.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mx-auto max-w-3xl">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="relative flex gap-6 pb-8 last:pb-0"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-border to-transparent" />
              )}

              {/* Step number circle */}
              <div
                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg`}
              >
                <step.icon className="h-5 w-5 text-white" />
              </div>

              {/* Content */}
              <div className="glass rounded-xl p-6 flex-1">
                <div className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Step {step.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 hidden lg:block">
                  <ArrowRight className="h-4 w-4 text-border rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
