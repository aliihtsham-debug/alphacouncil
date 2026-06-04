/**
 * GET /api/market/losers — Top 24h losers
 * Redirects to the tokens endpoint with type=losers
 */

import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  // Fetch from the existing tokens endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/api/market/tokens?type=losers`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const result = await res.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Losers proxy error:", error);
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
