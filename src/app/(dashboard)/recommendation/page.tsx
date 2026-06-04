"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, Edit3, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAgentStore } from "@/stores/agent-store";
import { useWalletStore } from "@/stores/wallet-store";

// Mock recommendation for demo
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
  const [action, setAction] = React.useState<"approve" | "modify" | "reject" | null>(null);

  const recommendation = finalRecommendation || mockRecommendation;

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
              <div className="text-2xl font-bold">{recommendation.allocation}%</div>
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
        {/* Supporting */}
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

        {/* Risks */}
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
          onClick={() => setAction("approve")}
        >
          <Check className="h-5 w-5" />
          Approve Trade
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          onClick={() => setAction("modify")}
        >
          <Edit3 className="h-5 w-5" />
          Modify
        </Button>
        <Button
          variant="danger"
          size="lg"
          className="gap-2"
          onClick={() => setAction("reject")}
        >
          <X className="h-5 w-5" />
          Reject
        </Button>
      </motion.div>

      {/* Action feedback */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Badge variant={action === "approve" ? "success" : action === "reject" ? "danger" : "warning"}>
            {action === "approve"
              ? "Trade approved! Redirecting to Trust Wallet..."
              : action === "reject"
              ? "Recommendation rejected"
              : "Modify allocation and confirm"}
          </Badge>
        </motion.div>
      )}
    </div>
  );
}
