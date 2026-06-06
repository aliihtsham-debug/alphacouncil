/**
 * Trust Wallet service — unified entry point
 */

export * from "./types";
export * from "./connect";
export * from "./portfolio";
export * from "./calldata";
export * from "./swap-quote";
export * from "./rpc";
export * from "./bscscan";
export * from "./price-fetcher";
// transactions.ts re-exports getSwapQuote/getTransactionStatus from swap-quote/rpc
// with wallet-aware wrappers — import directly from "./transactions" if needed
export { executeSwap, signTransaction } from "./transactions";
