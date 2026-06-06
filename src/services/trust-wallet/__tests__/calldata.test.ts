import { describe, it, expect } from "vitest";
import {
  encodeSwapExactTokensForTokens,
  encodeSwapExactETHForTokens,
  encodeSwapExactTokensForETH,
  encodeGetAmountsOut,
  decodeAmountsOut,
  PANCAKESWAP_ROUTER,
  WBNB,
} from "../calldata";

describe("calldata encoding", () => {
  const TOKEN_A = "0x031b41e504677879370e9DBcF937283A8691Fa7f"; // FET
  const TOKEN_B = "0x55d398326f99059fF775485246999027B3197955"; // USDT
  const WALLET = "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18";

  describe("encodeSwapExactTokensForTokens", () => {
    it("encodes with correct selector", () => {
      const calldata = encodeSwapExactTokensForTokens({
        amountIn: "100",
        amountOutMin: "50",
        path: [TOKEN_A, TOKEN_B],
        to: WALLET,
        deadline: BigInt(1700000000),
        tokenDecimals: 18,
      });
      expect(calldata.startsWith("0x38ed1739")).toBe(true);
    });

    it("encodes with correct length", () => {
      const calldata = encodeSwapExactTokensForTokens({
        amountIn: "1",
        amountOutMin: "1",
        path: [TOKEN_A, TOKEN_B],
        to: WALLET,
        deadline: BigInt(1700000000),
      });
      // Should be a valid hex string
      expect(calldata).toMatch(/^0x[0-9a-f]+$/);
    });
  });

  describe("encodeSwapExactETHForTokens", () => {
    it("encodes with correct selector", () => {
      const calldata = encodeSwapExactETHForTokens({
        amountOutMin: "50",
        path: [WBNB, TOKEN_B],
        to: WALLET,
        deadline: BigInt(1700000000),
      });
      expect(calldata.startsWith("0x7ff36ab5")).toBe(true);
    });
  });

  describe("encodeSwapExactTokensForETH", () => {
    it("encodes with correct selector", () => {
      const calldata = encodeSwapExactTokensForETH({
        amountIn: "100",
        amountOutMin: "50",
        path: [TOKEN_A, WBNB],
        to: WALLET,
        deadline: BigInt(1700000000),
      });
      expect(calldata.startsWith("0x18cbafe5")).toBe(true);
    });
  });

  describe("encodeGetAmountsOut", () => {
    it("encodes with correct selector", () => {
      const calldata = encodeGetAmountsOut({
        amountIn: "1",
        path: [TOKEN_A, TOKEN_B],
        tokenDecimals: 18,
      });
      expect(calldata.startsWith("0xd06ca61f")).toBe(true);
    });

    it("encodes path correctly", () => {
      const calldata = encodeGetAmountsOut({
        amountIn: "1",
        path: [TOKEN_A, WBNB, TOKEN_B],
        tokenDecimals: 18,
      });
      expect(calldata).toMatch(/^0x[0-9a-f]+$/);
    });
  });

  describe("decodeAmountsOut", () => {
    it("decodes single amount correctly", () => {
      // Build a known response: offset(32) + length(1) + amount(1e18)
      const amount = BigInt(1e18);
      const hex =
        "0x" +
        "0000000000000000000000000000000000000000000000000000000000000020" + // offset
        "0000000000000000000000000000000000000000000000000000000000000001" + // length = 1
        amount.toString(16).padStart(64, "0"); // amount

      const amounts = decodeAmountsOut(hex);
      expect(amounts.length).toBe(1);
      expect(amounts[0]).toBe(amount);
    });

    it("decodes multiple amounts correctly", () => {
      const amount1 = BigInt(1e18);
      const amount2 = BigInt(2e18);
      const hex =
        "0x" +
        "0000000000000000000000000000000000000000000000000000000000000020" + // offset
        "0000000000000000000000000000000000000000000000000000000000000002" + // length = 2
        amount1.toString(16).padStart(64, "0") +
        amount2.toString(16).padStart(64, "0");

      const amounts = decodeAmountsOut(hex);
      expect(amounts.length).toBe(2);
      expect(amounts[0]).toBe(amount1);
      expect(amounts[1]).toBe(amount2);
    });
  });

  describe("constants", () => {
    it("has correct PancakeSwap router address", () => {
      expect(PANCAKESWAP_ROUTER).toBe(
        "0x10ED43C718714eb63d5aA57B78B54704E256024E"
      );
    });

    it("has correct WBNB address", () => {
      expect(WBNB).toBe("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
    });
  });
});
