"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useUIStore } from "@/stores/ui-store";
import { truncateAddress } from "@/lib/utils";
import Link from "next/link";

export function Header() {
  const { isConnected, address, connect, disconnect, isConnecting } = useWallet();
  const { showToast } = useUIStore();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to connect wallet";
      showToast(message, "error");
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border glass-strong"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-glow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient-cyan">
            Alpha Council
          </span>
        </Link>

        {/* Navigation */}
        {isConnected && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/committee"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Committee
            </Link>
            <Link
              href="/portfolio"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/history"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              History
            </Link>
          </nav>
        )}

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground font-mono">
                {truncateAddress(address)}
              </span>
              <Button variant="outline" size="sm" onClick={() => disconnect()}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              variant="glow"
              onClick={handleConnect}
              disabled={isConnecting}
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
