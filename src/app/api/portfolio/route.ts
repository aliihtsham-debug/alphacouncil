import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio } from "@/services/trust-wallet";
import { analyzePortfolio } from "@/services/portfolio/analyzer";

export const revalidate = 30; // 30s cache

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get("address");
    const chain = request.nextUrl.searchParams.get("chain") ?? "BNB";

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

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
