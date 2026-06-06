/**
 * GET /api/auth/session
 *
 * Returns the current session state based on the session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
      });
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      address: session.address,
      chainId: session.chainId,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      success: true,
      isAuthenticated: false,
    });
  }
}
