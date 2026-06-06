import { NextRequest, NextResponse } from "next/server";
import { getTopGainers, getTopLosers, getTokensByCategory, getTokenBySymbol } from "@/services/coinmarketcap";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const symbol = searchParams.get("symbol");
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    let data;

    if (symbol) {
      const token = await getTokenBySymbol(symbol);
      data = token ? [token] : [];
    } else if (category) {
      data = await getTokensByCategory(category, Math.min(limit, 100));
    } else if (type === "gainers") {
      data = await getTopGainers(Math.min(limit, 100));
    } else if (type === "losers") {
      data = await getTopLosers(Math.min(limit, 100));
    } else {
      // Default: return gainers
      data = await getTopGainers(Math.min(limit, 100));
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Tokens fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tokens",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
