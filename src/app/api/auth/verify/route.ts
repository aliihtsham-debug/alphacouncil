/**
 * POST /api/auth/verify
 *
 * Verifies a signed SIWE message and creates a session.
 * Body: { message: string, signature: string }
 * On success, sets an HTTP-only session cookie and creates/finds the user in DB.
 */

import { NextRequest, NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";
import {
  verifySiweMessage,
  createSessionCookie,
  type SessionData,
} from "@/lib/auth";

// Prisma client with pg adapter — created lazily on first request
let prisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const pool = new Pool({ connectionString: dbUrl });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

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
    let chainId = 56;
    try {
      const siweMsg = new SiweMessage(message);
      chainId = siweMsg.chainId ?? 56;
    } catch (error) {
      console.error("SIWE parse error:", error);
      // Continue with default chainId
    }

    // Find or create user in database
    let user;
    try {
      const db = getPrismaClient();
      user = await db.user.findUnique({
        where: { walletAddress: address },
      });

      if (!user) {
        user = await db.user.create({
          data: { walletAddress: address },
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("Database error details:", errMsg);
      return NextResponse.json(
        {
          success: false,
          error: `Database error: ${errMsg}`,
        },
        { status: 503 }
      );
    }

    // Create session
    let cookieValue: string;
    try {
      const sessionData: SessionData = {
        address,
        chainId,
        issuedAt: Date.now(),
      };
      cookieValue = await createSessionCookie(sessionData);
    } catch (error) {
      console.error("Session creation error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Session creation failed. Please try again.",
        },
        { status: 500 }
      );
    }

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
    console.error("Auth verify unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      },
      { status: 500 }
    );
  }
}
