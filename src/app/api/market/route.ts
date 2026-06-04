import { NextResponse } from "next/server";
import { getMarketOverview } from "@/services/coinmarketcap";

export const revalidate = 60; // ISR: revalidate every 60s

export async function GET() {
  try {
    const data = await getMarketOverview();
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Market overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market overview",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
