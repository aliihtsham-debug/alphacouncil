"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ConnectCTA() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0 glass" />

          {/* Glow effects */}
          <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 text-center sm:px-16">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-glow"
            >
              <Sparkles className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Start?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">
              Connect your Trust Wallet and let Alpha Council analyze your
              portfolio. Get AI-powered investment recommendations in minutes.
            </p>

            <Button variant="glow" size="lg" className="gap-2 text-base" asChild>
              <Link href="/committee">
                <Wallet className="h-5 w-5" />
                Connect & Start Trading
              </Link>
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
              Free to use. No API keys required. Secured by Trust Wallet.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
