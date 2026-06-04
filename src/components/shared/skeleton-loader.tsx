"use client";

/**
 * Skeleton Loader Components
 *
 * Placeholder components shown during loading states.
 * Uses pulse animation to indicate content is loading.
 */

import { cn } from "@/lib/utils";

// ─── Base Skeleton ───────────────────────────────────────

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  );
}

// ─── SkeletonCard ────────────────────────────────────────

interface SkeletonCardProps {
  lines?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  showHeader = true,
  className,
}: SkeletonCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5 space-y-3", className)}>
      {showHeader && <Skeleton className="h-5 w-1/3" />}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

// ─── SkeletonRow ─────────────────────────────────────────

interface SkeletonRowProps {
  columns?: number;
  className?: string;
}

export function SkeletonRow({ columns = 4, className }: SkeletonRowProps) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-3 w-1/6" />
      </div>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-16" />
      ))}
    </div>
  );
}

// ─── SkeletonChart ───────────────────────────────────────

interface SkeletonChartProps {
  type?: "bar" | "pie" | "line";
  className?: string;
}

export function SkeletonChart({
  type = "bar",
  className,
}: SkeletonChartProps) {
  if (type === "pie") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-end gap-1 h-48">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton
            className="h-4 flex-1"
            style={{ width: `${40 + Math.random() * 60}%` }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── SkeletonTable ───────────────────────────────────────

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border/50">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── SkeletonList ────────────────────────────────────────

interface SkeletonListProps {
  items?: number;
  className?: string;
}

export function SkeletonList({ items = 3, className }: SkeletonListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}

export { Skeleton };
