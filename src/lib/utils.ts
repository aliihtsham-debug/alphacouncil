import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Use this instead of template literal class concatenation.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as USD currency.
 */
export function formatUsd(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
    ...options,
  }).format(value);
}

/**
 * Format a large number with K/M/B suffix.
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a percentage with sign.
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Truncate a wallet address: 0x1234...5678
 */
export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Delay utility for async operations.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique session ID.
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate risk level from score.
 */
export function getRiskLevel(score: number): "low" | "medium" | "high" | "extreme" {
  if (score <= 25) return "low";
  if (score <= 50) return "medium";
  if (score <= 75) return "high";
  return "extreme";
}

/**
 * Get color class for risk level.
 */
export function getRiskColor(level: "low" | "medium" | "high" | "extreme"): string {
  switch (level) {
    case "low":
      return "text-green-400";
    case "medium":
      return "text-yellow-400";
    case "high":
      return "text-orange-400";
    case "extreme":
      return "text-red-400";
  }
}
