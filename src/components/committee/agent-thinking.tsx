"use client";

/**
 * Agent Thinking Animation
 *
 * Pulsing dots with "Analyzing..." text.
 * Shown when agent status is THINKING.
 */

import { motion } from "framer-motion";

export function AgentThinking() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <span>Analyzing...</span>
    </div>
  );
}
