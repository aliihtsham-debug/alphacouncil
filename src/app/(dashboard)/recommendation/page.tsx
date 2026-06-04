"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Edit3,
  TrendingUp,
  Shield,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAgentStore } from "@/stores/agent-store";
import { useTradeStore } from "@/stores/trade-store";
import { useWalletStore } from "@/stores/wallet-store";
import { formatUsd } from "@/lib/utils";

const mockRecommendation = {
  decision: "BUY" as const,
  tokenSymbol: "FET",
  tokenName: "Fetch.ai",
  allocation: 8,
  confidence: 87,
  investmentThesis:
    "Fetch.ai demonstrates strong momentum in the AI narrative with increasing developer activity and strategic partnerships. The token is well-positioned for growth as AI adoption accelerates in the BNB ecosystem.",
  supportingArguments: [
    "Strong AI narrative momentum across the market",
    "Increasing developer activity on GitHub",
    "Strategic partnership announcements expected",
    "Technical breakout above key resistance level",
  ],
  risks: [
    "AI sector rotation could shift focus to competitors",
    "Broader market correction may impact momentum",
    "Regulatory uncertainty around AI tokens",
  ],
};

export default function RecommendationPage() {
  const { isConnected } = useWalletStore();
  const { finalRecommendation } = useAgentStore();
  const { activeTrade, isExecuting, error, executeTrade, rejectTrade, resetTrade, clearError } =
    useTradeStore();

  const [showModify, setShowModify] = React.useState(false);
  const [modifiedAllocation, setModifiedAllocation] = React.useState<number>(0);

  const recommendation = finalRecommendation ?? mockRecommendation;

  // Initialize modify input when recommendation changes
  React.useEffect(() => {
    if (finalRecommendation) {
      setModifiedAllocation(finalRecommendation.allocation);
    }
  }, [finalRecommendation]);

  React.useEffect(() => {
    setModifiedAllocation(recommendation.allocation);
  }, [recommendation.allocation]);

  const handleApprove = async () => {
    const tradeRec = modifiedAllocation !== recommendation.allocation
      ? { ...recommendation, allocation: modifiedAllocation }
      : recommendation;
    await executeTrade(tradeRec);
  };

  const handleReject = () => {
    rejectTrade(recommendation.tokenSymbol);
  };

  const handleReset = () => {
    resetTrade();
    setShowModify(false);
    clearError();
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Recommendation Yet</h2>
        <p className="text-muted-foreground">
          Connect your wallet and start a debate to get recommendations
        </p>
      </div>
    );
  }

  const decisionColor =
    recommendation.decision === "BUY"
      ? "text-green-400"
      : recommendation.decision === "SELL"
        ? "text-red-400"
        : "text-yellow-400";

  const decisionBg =
    recommendation.decision === "BUY"
      ? "bg-green-500/10 border-green-500/30"
      : recommendation.decision === "SELL"
        ? "bg-red-500/10 border-red-500/30"
        : "bg-yellow-500/10 border-yellow-500/30";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-2">
          Investment <span className="text-gradient-cyan">Recommendation</span>
        </h1>
        <p className="text-muted-foreground">
          Review the committee&apos;s final decision
        </p>
      </motion.div>

      {/* Trade Status Overlay */}
      {activeTrade && activeTrade.status !== "FAILED" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 text-center ${
            activeTrade.status === "CONFIRMED"
              ? "border-green-500/30 bg-green-500/10"
              : "border-yellow-500/30 bg-yellow-500/10"
          }`}
        >
          {activeTrade.status === "SUBMITTED" && (
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Transaction submitted, awaiting confirmation...</span>
            </div>
          )}
          {activeTrade.status === "CONFIRMED" && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">Trade confirmed!</span>
              </div>
              {activeTrade.txHash && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="font-mono">{activeTrade.txHash.slice(0, 20)}...</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {activeTrade.action} {activeTrade.amount.toFixed(2)} {activeTrade.tokenSymbol} ({formatUsd(activeTrade.amountUsd)})
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 mt-1">
                <RotateCcw className="h-3 w-3" />
                Done
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center"
        >
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Dismiss
          </Button>
        </motion.div>
      )}

      {/* Decision Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className={`p-8 text-center border ${decisionBg}`}>
          <div className={`text-6xl font-extrabold ${decisionColor} mb-2`}>
            {recommendation.decision}
          </div>
          <div className="text-2xl font-bold mb-1">
            {recommendation.tokenName}
          </div>
          <div className="text-lg text-muted-foreground mb-6">
            {recommendation.tokenSymbol}
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Allocation</div>
              {showModify ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={modifiedAllocation}
                    onChange={(e) => setModifiedAllocation(Math.min(25, Math.max(0, Number(e.target.value))))}
                    className="w-20 text-center h-8"
                    min={0}
                    max={25}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ) : (
                <div className="text-2xl font-bold">{recommendation.allocation}%</div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Confidence</div>
              <div className="text-2xl font-bold">{recommendation.confidence}%</div>
            </div>
          </div>

          <Progress
            value={recommendation.confidence}
            className="h-2 max-w-xs mx-auto"
            indicatorClassName={
              recommendation.confidence >= 70
                ? "bg-green-500"
                : recommendation.confidence >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }
          />
        </GlassCard>
      </motion.div>

      {/* Thesis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Investment Thesis
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {recommendation.investmentThesis}
          </p>
        </GlassCard>
      </motion.div>

      {/* Arguments */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Supporting Arguments
            </h3>
            <ul className="space-y-3">
              {recommendation.supportingArguments.map((arg, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  <span className="text-muted-foreground">{arg}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-400" />
              Risk Factors
            </h3>
            <ul className="space-y-3">
              {recommendation.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </motion.div>
      </div>

      {/* Actions */}
      {!activeTrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <Button
            variant="success"
            size="lg"
            className="gap-2"
            onClick={handleApprove}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
            {isExecuting ? "Executing..." : "Approve Trade"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => setShowModify(!showModify)}
            disabled={isExecuting}
          >
            <Edit3 className="h-5 w-5" />
            {showModify ? "Cancel Modify" : "Modify"}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="gap-2"
            onClick={handleReject}
            disabled={isExecuting}
          >
            <X className="h-5 w-5" />
            Reject
          </Button>
        </motion.div>
      )}

      {/* Rejected Badge */}
      {!activeTrade && !isExecuting && (
        <div className="text-center">
          <Badge variant="outline">
            {recommendation.decision === "BUY"
              ? `Ready to execute: Buy ${recommendation.allocation}% ${recommendation.tokenSymbol}`
              : recommendation.decision === "SELL"
                ? `Ready to execute: Sell ${recommendation.allocation}% ${recommendation.tokenSymbol}`
                : `Recommendation: Hold ${recommendation.tokenSymbol}`}
          </Badge>
        </div>
      )}
    </div>
  );
}
