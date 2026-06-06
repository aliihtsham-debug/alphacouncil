import { describe, it, expect, beforeAll } from "vitest";
import {
  generateNonce,
  createSiweMessage,
  createSessionCookie,
  parseSessionCookie,
} from "../auth";

describe("auth", () => {
  beforeAll(() => {
    process.env.SESSION_SECRET = "test-secret-key-that-is-32-chars-long!!";
  });

  describe("generateNonce", () => {
    it("generates a hex string", () => {
      const nonce = generateNonce();
      expect(nonce).toMatch(/^[0-9a-f]+$/);
    });

    it("generates unique nonces", () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it("generates 32-char hex (16 bytes)", () => {
      const nonce = generateNonce();
      expect(nonce.length).toBe(32);
    });
  });

  describe("createSiweMessage", () => {
    it("creates a valid SIWE message with lowercase address", () => {
      const message = createSiweMessage({
        address: "0x742d35cc6634c0532925a3b844bc9e7595f2bd18",
        chainId: 56,
        nonce: "abcdefgh",
        domain: "localhost:3000",
        uri: "http://localhost:3000",
      });

      expect(message.address.toLowerCase()).toBe(
        "0x742d35cc6634c0532925a3b844bc9e7595f2bd18"
      );
      expect(message.chainId).toBe(56);
    });

    it("creates a message that can be serialized", () => {
      const message = createSiweMessage({
        address: "0x742d35cc6634c0532925a3b844bc9e7595f2bd18",
        chainId: 56,
        nonce: "abcdefgh",
        domain: "localhost:3000",
        uri: "http://localhost:3000",
      });

      const text = message.prepareMessage();
      expect(text).toContain("Sign in to Alpha Council");
      expect(text).toContain("localhost:3000");
    });
  });

  describe("session cookie", () => {
    it("creates and parses a valid session cookie", async () => {
      const session = {
        address: "0x742d35cc6634c0532925a3b844bc9e7595f2bd18",
        chainId: 56,
        issuedAt: Date.now(),
      };

      const cookie = await createSessionCookie(session);
      expect(cookie).toContain(".");

      const parsed = await parseSessionCookie(cookie);
      expect(parsed).not.toBeNull();
      expect(parsed?.address).toBe(session.address);
      expect(parsed?.chainId).toBe(session.chainId);
    });

    it("rejects tampered cookie", async () => {
      const session = {
        address: "0x742d35cc6634c0532925a3b844bc9e7595f2bd18",
        chainId: 56,
        issuedAt: Date.now(),
      };

      const cookie = await createSessionCookie(session);
      const tampered = cookie.slice(0, -5) + "XXXXX";

      const parsed = await parseSessionCookie(tampered);
      expect(parsed).toBeNull();
    });

    it("rejects malformed cookie", async () => {
      const parsed = await parseSessionCookie("not-a-valid-cookie");
      expect(parsed).toBeNull();
    });
  });
});
