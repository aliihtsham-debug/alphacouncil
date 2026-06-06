/**
 * Next.js Middleware
 *
 * - Rate limiting: 10 req/min per IP on debate endpoint
 * - CORS headers for API routes
 * - Request size validation
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

function getAllowedOrigin(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) return appUrl;
  // In development, allow localhost
  if (process.env.NODE_ENV !== "production") return "*";
  // In production without APP_URL set, default to empty (no CORS)
  return "";
}

function addCorsHeaders(response: NextResponse): NextResponse {
  const origin = getAllowedOrigin();
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

// ─── Request Size Limit ─────────────────────────────────

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1MB

function checkContentLength(request: NextRequest): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return false;
  }
  return true;
}

// ─── Middleware ──────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check request size for methods with body
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    if (!checkContentLength(request)) {
      return NextResponse.json(
        { error: "Request body too large. Maximum size is 1MB." },
        { status: 413 }
      );
    }
  }

  // Rate limit debate/stream endpoints
  if (pathname.startsWith("/api/agents")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";

    if (isRateLimited(ip)) {
      const response = NextResponse.json(
        { error: "Rate limit exceeded. Try again in 60 seconds." },
        { status: 429 }
      );
      response.headers.set("Retry-After", "60");
      return response;
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
