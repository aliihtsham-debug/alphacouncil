"use client";

import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-purple-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Alpha Council</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Built for BNB Hack: AI Trading Agent Edition</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alpha Council. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
