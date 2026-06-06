/**
 * POST /api/auth/verify
 *
 * Verifies a signed SIWE message and creates a session.
 * Body: { message: string, signature: string }
 * On success, sets an HTTP-only session cookie and creates/finds the user in DB.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifySiweMessage,
  createSessionCookie,
  type SessionData,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature } = body ?? {};

    if (!message || !signature) {
      return NextResponse.json(
        { success: false, error: "Message and signature are required" },
        { status: 400 }
      );
    }

    // Verify the SIWE signature
    let address: string;
    try {
      address = await verifySiweMessage(message, signature);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Invalid signature",
        },
        { status: 401 }
      );
    }

    // Parse the SIWE message to get chainId
    const siweMessage = JSON.parse(message);
    const chainId = siweMessage.chainId ?? 56;

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: address },
      });
    }

    // Create session
    const sessionData: SessionData = {
      address,
      chainId,
      issuedAt: Date.now(),
    };

    const cookieValue = await createSessionCookie(sessionData);

    const response = NextResponse.json({
      success: true,
      address,
      userId: user.id,
    });

    response.cookies.set({
      name: "alphacouncil_session",
      value: cookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 }
    );
  }
}
