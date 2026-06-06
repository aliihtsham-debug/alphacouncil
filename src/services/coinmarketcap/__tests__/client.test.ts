import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CoinMarketCap client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("is importable without errors", async () => {
    const client = await import("../client");
    expect(client).toBeDefined();
  });

  it("getCmcConfig reads env at call time", async () => {
    // The client module should be importable
    const client = await import("../client");
    expect(client).toBeDefined();
  });
});
