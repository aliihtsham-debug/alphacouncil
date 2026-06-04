/**
 * Next.js Middleware
 *
 * - Rate limiting: 10 req/min per IP on debate endpoint
 * - CORS headers for API routes
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Rate Limiting (in-memory, per-IP) ─────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// ─── CORS Headers ───────────────────────────────────────

function addCorsHeaders(response: NextResponse): NextResponse {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "*";
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// ─── Middleware ──────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Rate limit debate/stream endpoints
  if (pathname.startsWith("/api/agents")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in 60 seconds." },
        { status: 429 }
      );
    }
  }

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response);
  }

  // Add CORS headers to API responses
  const response = NextResponse.next();
  return addCorsHeaders(response);
}

export const config = {
  matcher: ["/api/:path*"],
};
