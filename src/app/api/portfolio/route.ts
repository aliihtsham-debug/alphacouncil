import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio } from "@/services/trust-wallet";
import { analyzePortfolio } from "@/services/portfolio/analyzer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET(request: NextRequest) {
  try {
    const address = request.headers.get("x-user-address") ?? request.nextUrl.searchParams.get("address");
    const chain = request.nextUrl.searchParams.get("chain") ?? "BNB";
    const userId = request.headers.get("x-user-id") ?? undefined;

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

    // Persist portfolio snapshot to database
    if (userId) {
      try {
        let user = await prisma.user.findUnique({
          where: { walletAddress: address },
        });

        if (!user) {
          user = await prisma.user.create({
            data: { walletAddress: address },
          });
        }

        await prisma.wallet.upsert({
          where: { address },
          update: { chain, isActive: true },
          create: {
            userId: user.id,
            address,
            chain,
            isActive: true,
          },
        });

        const portfolio = await prisma.portfolio.create({
          data: {
            userId: user.id,
            totalValueUsd: analysis.totalValueUsd,
            stablecoinRatio: analysis.stablecoinRatio,
            riskScore: analysis.riskScore,
            concentrationRisk: analysis.concentrationRisk,
            assets: {
              create: analysis.assets.map((a) => ({
                tokenSymbol: a.tokenSymbol,
                tokenName: a.tokenName,
                amount: a.amount,
                valueUsd: a.valueUsd,
                allocationPct: a.allocationPct,
                sector: a.sector,
                priceChange24h: a.priceChange24h,
              })),
            },
          },
        });

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "PORTFOLIO_FETCHED",
            metadata: {
              portfolioId: portfolio.id,
              address,
              chain,
              totalValueUsd: analysis.totalValueUsd,
            },
          },
        });
      } catch (dbError) {
        console.error("Failed to persist portfolio:", dbError);
      }
    }

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
