"use client";

import { Ghost, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <GlassCard className="p-8 max-w-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <Ghost className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-4xl font-extrabold mb-2 text-gradient-cyan">
          404
        </h2>
        <p className="text-lg font-semibold mb-1">Page not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button variant="default" asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </GlassCard>
    </div>
  );
}
