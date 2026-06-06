/**
 * GET /api/auth/nonce
 *
 * Returns a cryptographic nonce for SIWE message signing.
 * The client must include this nonce in the SIWE message to prevent replay attacks.
 */

import { NextResponse } from "next/server";
import { generateNonce } from "@/lib/auth";

export async function GET() {
  const nonce = generateNonce();

  return NextResponse.json({
    success: true,
    nonce,
  });
}
