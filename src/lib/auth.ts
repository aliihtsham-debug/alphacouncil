/**
 * Authentication Library — Sign-In with Ethereum (SIWE)
 *
 * Implements EIP-4361 SIWE flow using Trust Wallet's window.ethereum provider.
 * Session is stored as an HTTP-only cookie with HMAC signature.
 */

import { SiweMessage } from "siwe";
import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";
import { bytesToHex } from "@noble/hashes/utils";
import type { NextRequest } from "next/server";

// ─── EIP-55 Checksum ────────────────────────────────────

/**
 * Convert an Ethereum address to EIP-55 checksummed form.
 * Uses keccak256 per the EIP-55 specification.
 */
function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace("0x", "");
  const hash = bytesToHex(keccak_256(addr));
  let checksummed = "0x";
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksummed += addr[i].toUpperCase();
    } else {
      checksummed += addr[i];
    }
  }
  return checksummed;
}

// ─── Constants ──────────────────────────────────────────

const COOKIE_NAME = "alphacouncil_session";
const SESSION_TTL_SECONDS = 86400; // 24 hours
const NONCE_BYTES = 16;

// ─── Nonce Generation ───────────────────────────────────

/**
 * Generate a cryptographically random nonce for SIWE.
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(NONCE_BYTES);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

// ─── SIWE Message Creation ──────────────────────────────

/**
 * Create a SIWE message for the user to sign.
 */
export function createSiweMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  domain?: string;
  uri?: string;
}): SiweMessage {
  const domain = params.domain ?? "localhost:3000";
  const uri = params.uri ?? "http://localhost:3000";

  return new SiweMessage({
    domain,
    address: toChecksumAddress(params.address),
    statement: "Sign in to Alpha Council",
    uri,
    version: "1",
    chainId: params.chainId,
    nonce: params.nonce,
  });
}

// ─── SIWE Message Verification ──────────────────────────

/**
 * Verify a signed SIWE message.
 * Returns the verified address on success, throws on failure.
 */
export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<string> {
  const siweMessage = new SiweMessage(message);
  const result = await siweMessage.verify({ signature });

  if (!result.success) {
    throw new Error(result.error?.type ?? "SIWE verification failed");
  }

  return result.data.address;
}

// ─── Session Cookie Management ──────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set and at least 32 characters. Run: openssl rand -hex 32"
    );
  }
  return secret;
}

async function signPayload(payload: string): Promise<string> {
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return bytesToHex(new Uint8Array(signature));
}

async function verifySignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const expected = await signPayload(payload);
  if (signature.length !== expected.length) return false;
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return result === 0;
}

export interface SessionData {
  address: string;
  chainId: number;
  issuedAt: number;
}

/**
 * Create a signed session cookie value.
 */
export async function createSessionCookie(
  data: SessionData
): Promise<string> {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

/**
 * Parse and verify a session cookie value.
 * Returns the session data on success, null on failure.
 */
export async function parseSessionCookie(
  cookieValue: string
): Promise<SessionData | null> {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  if (!(await verifySignature(payload, signature))) return null;

  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionData;

    // Check expiration
    const age = Date.now() - data.issuedAt;
    if (age > SESSION_TTL_SECONDS * 1000) return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Get session from a NextRequest.
 */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<SessionData | null> {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return parseSessionCookie(cookie.value);
}

/**
 * Build the Set-Cookie header value for a session.
 */
export function buildSessionSetCookie(session: SessionData): string {
  // We need to return the async cookie value, so this is a helper
  // that returns the cookie attributes string.
  return `${COOKIE_NAME}=<value>; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}; Path=/`;
}

/**
 * Build the Set-Cookie header to clear the session.
 */
export function buildSessionClearCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
}
