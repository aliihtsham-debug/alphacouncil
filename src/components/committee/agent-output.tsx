"use client";

/**
 * Agent Output Display
 *
 * Formatted agent output with JSON preview and syntax highlighting.
 * Truncated with "show more" toggle.
 */

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AgentOutputProps {
  output: unknown;
  maxPreviewLength?: number;
  className?: string;
}

export function AgentOutput({
  output,
  maxPreviewLength = 300,
  className,
}: AgentOutputProps) {
  const [expanded, setExpanded] = React.useState(false);

  const jsonString = JSON.stringify(output, null, 2);
  const isTruncated = jsonString.length > maxPreviewLength && !expanded;

  return (
    <div className={cn("mt-3", className)}>
      <div
        className={cn(
          "rounded-lg bg-muted/30 p-3 text-xs font-mono overflow-hidden",
          isTruncated && "max-h-32"
        )}
      >
        <pre className="whitespace-pre-wrap text-muted-foreground">
          {isTruncated ? `${jsonString.slice(0, maxPreviewLength)}...` : jsonString}
        </pre>
      </div>
      {jsonString.length > maxPreviewLength && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 h-6 text-xs gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show more
            </>
          )}
        </Button>
      )}
    </div>
  );
}
