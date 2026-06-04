"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet-store";
import { truncateAddress } from "@/lib/utils";
import Link from "next/link";

export function Header() {
  const { isConnected, address, connect, disconnect, isConnecting } = useWalletStore();

  const handleConnect = async () => {
    // Placeholder: Trust Wallet connection via SDK
    // In production, use Trust Wallet SDK
    connect("0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18", "BNB");
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
              <Button variant="outline" size="sm" onClick={disconnect}>
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
