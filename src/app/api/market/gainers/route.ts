/**
 * GET /api/market/gainers — Top 24h gainers
 * Redirects to the tokens endpoint with type=gainers
 */

import { NextResponse } from "next/server";

export const revalidate = 60;

export async function GET() {
  // Fetch from the existing tokens endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/api/market/tokens?type=gainers`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const result = await res.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gainers proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gainers",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
