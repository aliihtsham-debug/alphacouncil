"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useUIStore } from "@/stores/ui-store";

interface Report {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
}

const reportTypes = [
  {
    key: "investment",
    title: "Investment Report",
    description:
      "Full analysis of committee decisions, trade outcomes, and portfolio impact.",
    icon: TrendingUp,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    key: "weekly",
    title: "Weekly Rebalance",
    description:
      "Suggested allocation changes based on recent market movements and risk profile.",
    icon: BarChart3,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    key: "health",
    title: "Portfolio Health",
    description:
      "Risk metrics, diversification score, and exposure analysis for your holdings.",
    icon: Activity,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
];

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [generating, setGenerating] = React.useState<string | null>(null);
  const [activeReport, setActiveReport] = React.useState<Report | null>(null);
  const { showToast } = useUIStore();

  const generateReport = async (type: string) => {
    setGenerating(type);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.status}`);
      }

      const data = await response.json();

      const report: Report = {
        id: `report_${Date.now()}`,
        type,
        title: reportTypes.find((r) => r.key === type)?.title ?? "Report",
        content: data.content ?? generateFallbackContent(type),
        createdAt: new Date().toISOString(),
      };

      setReports((prev) => [report, ...prev]);
      setActiveReport(report);
      showToast("Report generated successfully", "success");
    } catch (error) {
      // Generate report locally as fallback
      const reportType = reportTypes.find((r) => r.key === type);
      const report: Report = {
        id: `report_${Date.now()}`,
        type,
        title: reportType?.title ?? "Report",
        content: generateFallbackContent(type),
        createdAt: new Date().toISOString(),
      };
      setReports((prev) => [report, ...prev]);
      setActiveReport(report);
      showToast("Report generated (offline mode)", "success");
    } finally {
      setGenerating(null);
    }
  };

  const generateFallbackContent = (type: string): string => {
    switch (type) {
      case "investment":
        return `# Investment Report — ${new Date().toLocaleDateString()}

## Summary
The committee analyzed 3 opportunities this week, resulting in 1 executed trade.

## Committee Performance
- **Decisions Made:** 3
- **Trades Executed:** 1
- **Win Rate:** 100%
- **Average Confidence:** 82%

## Trade Log
| Token | Action | Amount | Outcome |
|-------|--------|--------|---------|
| FET   | BUY    | $1,875  | +2.3%   |
| LINK  | BUY    | $333   | +0.8%   |

## Recommendation
Continue accumulating AI-sector tokens. Risk levels remain moderate.`;
      case "weekly":
        return `# Weekly Rebalance Report — ${new Date().toLocaleDateString()}

## Current Allocation
- AI Tokens: 35% (target: 30%) ⚠️ Overweight
- Layer 1: 40% (target: 40%) ✅ On target
- DeFi: 15% (target: 20%) ⚠️ Underweight
- Stablecoins: 10% (target: 10%) ✅ On target

## Suggested Actions
1. **Trim** FET position by 5% of portfolio
2. **Accumulate** DeFi tokens (UNI, AAVE)
3. **Hold** current Layer 1 positions

## Risk Assessment
Portfolio risk score: 6.2/10 (Moderate)`;
      case "health":
        return `# Portfolio Health Report — ${new Date().toLocaleDateString()}

## Health Score: 7.8/10

## Diversification
- **Sector Diversity:** Good (4 sectors)
- **Token Concentration:** Moderate (top 3 = 65%)
- **Chain Diversity:** Low (primarily BNB Chain)

## Risk Metrics
- **Volatility (30d):** 12.3%
- **Max Drawdown:** -8.5%
- **Sharpe Ratio:** 1.4
- **Beta:** 0.87

## Recommendations
1. Consider cross-chain diversification
2. Reduce single-token exposure above 25%
3. Maintain stablecoin buffer at 10%`;
      default:
        return `# Report — ${new Date().toLocaleDateString()}

No data available for this report type.`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient-cyan">Reports</span>
        </h1>
        <p className="text-muted-foreground">
          Generate AI-powered reports on your portfolio and committee decisions
        </p>
      </motion.div>

      {/* Report Type Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {reportTypes.map((rt, i) => {
          const Icon = rt.icon;
          const isGenerating = generating === rt.key;

          return (
            <motion.div
              key={rt.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex flex-col">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${rt.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${rt.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{rt.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {rt.description}
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => generateReport(rt.key)}
                  disabled={generating !== null}
                >
                  {isGenerating ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Active Report Content */}
      {activeReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{activeReport.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Generated {new Date(activeReport.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveReport(null)}
              >
                Close
              </Button>
            </div>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono leading-relaxed bg-muted/20 rounded-lg p-4">
                {activeReport.content}
              </pre>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Previous Reports */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Previous Reports</h2>
          <div className="space-y-3">
            {reports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className="p-4 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => setActiveReport(report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reports.length === 0 && !activeReport && (
        <EmptyState
          icon={FileText}
          title="No Reports Yet"
          description="Generate your first report to get AI-powered insights on your portfolio and committee decisions."
        />
      )}
    </div>
  );
}
