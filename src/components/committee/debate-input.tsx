"use client";

/**
 * Debate Input Component
 *
 * Prompt input form with submit button, example prompts,
 * and disabled state during debate.
 */

import * as React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DebateInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isDisabled?: boolean;
  isSubmitting?: boolean;
  examplePrompts?: string[];
  className?: string;
}

export function DebateInput({
  value,
  onChange,
  onSubmit,
  isDisabled = false,
  isSubmitting = false,
  examplePrompts = [],
  className,
}: DebateInputProps) {
  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onSubmit={onSubmit}
      className={className}
    >
      <div className="glass rounded-xl p-2 flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask the committee..."
          className="border-0 bg-transparent focus-visible:ring-0"
          disabled={isDisabled}
        />
        <Button
          type="submit"
          variant="glow"
          disabled={isDisabled || !value.trim()}
        >
          {isSubmitting ? "Debating..." : "Start Debate"}
        </Button>
      </div>

      {/* Example prompts */}
      {!isDisabled && examplePrompts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onChange(prompt)}
              className="text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full px-3 py-1 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </motion.form>
  );
}
