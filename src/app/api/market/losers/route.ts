/**
 * GET /api/market/losers — Top 24h losers
 */

import { NextResponse } from "next/server";
import { getTopLosers } from "@/services/coinmarketcap";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getTopLosers(20);
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Losers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch losers",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
