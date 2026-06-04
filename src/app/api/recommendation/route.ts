import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0; // No cache for recommendations

export async function GET(request: NextRequest) {
  try {
    // In production: fetch from database
    // For demo: return empty list
    return NextResponse.json({
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendations fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recommendations",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, decision, tokenSymbol, tokenName, allocation, confidence, investmentThesis, supportingArguments, risks } = body;

    // In production: save to database
    return NextResponse.json({
      success: true,
      data: {
        id: `rec_${Date.now()}`,
        sessionId,
        decision,
        tokenSymbol,
        tokenName,
        allocation,
        confidence,
        investmentThesis,
        supportingArguments,
        risks,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendation create error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create recommendation",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
