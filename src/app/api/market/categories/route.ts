import { NextResponse } from "next/server";
import { getCategories } from "@/services/coinmarketcap";

export const revalidate = 3600; // 1 hour cache

export async function GET() {
  try {
    const data = await getCategories();
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
