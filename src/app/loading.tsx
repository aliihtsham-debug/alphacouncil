"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain className="h-12 w-12 text-primary" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-lg font-semibold">Loading...</p>
        <p className="text-sm text-muted-foreground">
          Preparing your dashboard
        </p>
      </motion.div>
    </div>
  );
}
