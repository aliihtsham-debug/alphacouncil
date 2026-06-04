"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong" | "subtle";
  glow?: "none" | "cyan" | "purple" | "green" | "red";
  hover?: boolean;
}

const glowMap = {
  none: "",
  cyan: "shadow-glow",
  purple: "shadow-glow-purple",
  green: "shadow-glow-green",
  red: "shadow-glow-red",
};

export function GlassCard({
  className,
  variant = "default",
  glow = "none",
  hover = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        variant === "default" && "glass",
        variant === "strong" && "glass-strong",
        variant === "subtle" && "glass-subtle",
        glowMap[glow],
        hover &&
          "transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-lg",
        "rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
