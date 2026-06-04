"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Check, X, AlertTriangle, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "@/stores/wallet-store";
import { formatUsd, formatPercent } from "@/lib/utils";

// Mock trade history for demo
const mockTrades = [
  {
    id: "1",
    tokenSymbol: "FET",
    action: "BUY" as const,
    amount: 1250,
    amountUsd: 1875.0,
    status: "CONFIRMED" as const,
    txHash: "0xabc123...def456",
    executedAt: "2026-06-04T10:30:00Z",
    createdAt: "2026-06-04T10:25:00Z",
  },
  {
    id: "2",
    tokenSymbol: "LINK",
    action: "BUY" as const,
    amount: 25,
    amountUsd: 333.13,
    status: "CONFIRMED" as const,
    txHash: "0x789ghi...012jkl",
    executedAt: "2026-06-03T14:15:00Z",
    createdAt: "2026-06-03T14:10:00Z",
  },
  {
    id: "3",
    tokenSymbol: "DOGE",
    action: "SELL" as const,
    amount: 5000,
    amountUsd: 850.0,
    status: "PENDING" as const,
    txHash: null,
    executedAt: null,
    createdAt: "2026-06-04T11:00:00Z",
  },
];

export default function HistoryPage() {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Clock className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Trade History</h2>
        <p className="text-muted-foreground">
          Connect your wallet to view past trades
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="success">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "FAILED":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          Trade <span className="text-gradient-cyan">History</span>
        </h1>
        <p className="text-muted-foreground">
          Previous decisions and executed trades
        </p>
      </motion.div>

      {/* Trade list */}
      <div className="space-y-4">
        {mockTrades.map((trade, i) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Action indicator */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      trade.action === "BUY"
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {trade.action === "BUY" ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  {/* Trade info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.action}</span>
                      <span className="font-bold text-lg">{trade.tokenSymbol}</span>
                      {getStatusBadge(trade.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.amount} {trade.tokenSymbol} • {formatUsd(trade.amountUsd)}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {trade.txHash && (
                    <div className="flex items-center gap-1 text-xs text-primary mt-1">
                      <span className="font-mono">{trade.txHash}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
