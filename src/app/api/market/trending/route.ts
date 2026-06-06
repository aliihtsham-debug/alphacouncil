import { NextRequest, NextResponse } from "next/server";
import { getTrendingTokens } from "@/services/coinmarketcap";

export const dynamic = "force-dynamic";
export const revalidate = 120; // 2 min cache

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(
      request.nextUrl.searchParams.get("limit") ?? "20",
      10
    );
    const data = await getTrendingTokens(Math.min(limit, 100));
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trending tokens error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch trending tokens",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
