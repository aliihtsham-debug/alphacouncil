import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio } from "@/services/trust-wallet";
import { analyzePortfolio, getRiskMetrics } from "@/services/portfolio/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, chain = "BNB" } = body;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          error: "Wallet address is required",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const walletPortfolio = await getWalletPortfolio(address, chain);
    const analysis = analyzePortfolio(walletPortfolio);
    const riskMetrics = getRiskMetrics(analysis);

    return NextResponse.json({
      success: true,
      data: {
        ...analysis,
        riskMetrics,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Portfolio analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze portfolio",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
