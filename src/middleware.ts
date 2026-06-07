/**
 * Middleware — Authentication enforcement
 *
 * Protects all API routes except:
 * - /api/auth/* (authentication routes)
 * - /api/market/* (public market data)
 *
 * For protected routes, extracts the user from the session cookie
 * and injects x-user-id and x-user-address headers.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, parseSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Routes that do NOT require authentication
const PUBLIC_PREFIXES = ["/api/auth", "/api/market"];

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/api/portfolio",
  "/api/agents",
  "/api/trades",
  "/api/recommendation",
  "/api/reports",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept API routes
  if (!pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow public routes
  const isPublic = PUBLIC_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  // Verify session
  const cookie = request.cookies.get("alphacouncil_session");
  if (!cookie?.value) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const session = await parseSessionCookie(cookie.value);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Invalid or expired session" },
      { status: 401 }
    );
  }

  // Look up user ID from database
  let userId: string | undefined;
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: session.address },
      select: { id: true },
    });
    userId = user?.id;
  } catch (error) {
    // DB lookup failed — log for debugging but continue without userId
    console.error("Middleware DB lookup failed:", error);
  }

  // Inject user headers
  const headers = new Headers(request.headers);
  headers.set("x-user-address", session.address);
  if (userId) {
    headers.set("x-user-id", userId);
  }

  const response = NextResponse.next({
    request: { headers },
  });

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
