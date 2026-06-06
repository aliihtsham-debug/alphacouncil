/**
 * Swap Calldata Encoder
 *
 * ABI-encodes PancakeSwap Router V2 function calls without external libraries.
 * All encoding is done with raw hex string manipulation.
 *
 * PancakeSwap Router V2 (BSC): 0x10ED43C718714eb63d5aA57B78B54704E256024E
 * PancakeSwap Factory V2 (BSC): 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73
 * WBNB (BSC):                   0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
 */

// ─── Constants ──────────────────────────────────────────

export const PANCAKESWAP_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
export const PANCAKESWAP_FACTORY = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Function selectors (first 4 bytes of keccak256 of function signature)
const SELECTORS = {
  swapExactTokensForTokens: "0x38ed1739",
  swapExactETHForTokens: "0x7ff36ab5",
  swapExactTokensForETH: "0x18cbafe5",
  getAmountsOut: "0xd06ca61f",
  addLiquidity: "0xe8e33700",
  removeLiquidity: "0xbaa2abde",
} as const;

// ─── Helpers ────────────────────────────────────────────

/**
 * Convert a number or bigint to a hex string padded to 32 bytes (64 hex chars).
 */
function toHex32(value: bigint | number): string {
  const hex = BigInt(value).toString(16);
  return hex.padStart(64, "0");
}

/**
 * Pad an Ethereum address to 32 bytes (left-padded).
 */
function padAddress(address: string): string {
  const clean = address.toLowerCase().replace(/^0x/, "");
  return clean.padStart(64, "0");
}

/**
 * Convert a human-readable amount to hex wei based on decimals.
 */
function amountToHex(amount: string, decimals: number): string {
  const [intPart, fracPart = ""] = amount.split(".");
  const paddedFrac = fracPart.padEnd(decimals, "0").slice(0, decimals);
  const raw = BigInt(intPart + paddedFrac);
  return toHex32(raw);
}

/**
 * Encode a dynamic array (address[]) in ABI format.
 * Returns: offset + length + padded elements
 */
function encodeAddressArray(addresses: string[]): string {
  const length = toHex32(addresses.length);
  const elements = addresses.map(padAddress).join("");
  return length + elements;
}

// ─── Swap Calldata Encoding ─────────────────────────────

/**
 * Encode swapExactTokensForTokens calldata.
 *
 * function swapExactTokensForTokens(
 *   uint amountIn,
 *   uint amountOutMin,
 *   address[] calldata path,
 *   address to,
 *   uint deadline
 * )
 */
export function encodeSwapExactTokensForTokens(params: {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: bigint;
  tokenDecimals?: number;
}): string {
  const decimals = params.tokenDecimals ?? 18;

  // Static parameters start at offset 0x80 (4 args * 32 bytes for offsets + data)
  // Actually: selector(4) + amountIn(32) + amountOutMin(32) + path_offset(32) + to(32) + deadline(32) = 196 bytes = 0xC4
  // Path data starts at offset 0xC4
  const pathOffset = toHex32(5 * 32); // 5 static params after selector = 160 bytes = 0xa0

  const amountIn = amountToHex(params.amountIn, decimals);
  const amountOutMin = amountToHex(params.amountOutMin, decimals);
  const to = padAddress(params.to);
  const deadline = toHex32(params.deadline);
  const pathData = encodeAddressArray(params.path);

  return (
    SELECTORS.swapExactTokensForTokens +
    amountIn +
    amountOutMin +
    pathOffset +
    to +
    deadline +
    pathData
  );
}

/**
 * Encode swapExactETHForTokens calldata.
 *
 * function swapExactETHForTokens(
 *   uint amountOutMin,
 *   address[] calldata path,
 *   address to,
 *   uint deadline
 * )
 *
 * BNB value is sent as msg.value, not encoded in calldata.
 */
export function encodeSwapExactETHForTokens(params: {
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: bigint;
  outDecimals?: number;
}): string {
  const decimals = params.outDecimals ?? 18;

  const amountOutMin = amountToHex(params.amountOutMin, decimals);
  const pathOffset = toHex32(4 * 32); // 4 static params = 128 bytes = 0x80
  const to = padAddress(params.to);
  const deadline = toHex32(params.deadline);
  const pathData = encodeAddressArray(params.path);

  return (
    SELECTORS.swapExactETHForTokens +
    amountOutMin +
    pathOffset +
    to +
    deadline +
    pathData
  );
}

/**
 * Encode swapExactTokensForETH calldata.
 *
 * function swapExactTokensForETH(
 *   uint amountIn,
 *   uint amountOutMin,
 *   address[] calldata path,
 *   address to,
 *   uint deadline
 * )
 */
export function encodeSwapExactTokensForETH(params: {
  amountIn: string;
  amountOutMin: string;
  path: string[];
  to: string;
  deadline: bigint;
  tokenDecimals?: number;
}): string {
  const decimals = params.tokenDecimals ?? 18;

  const amountIn = amountToHex(params.amountIn, decimals);
  const amountOutMin = amountToHex(params.amountOutMin, decimals);
  const pathOffset = toHex32(5 * 32);
  const to = padAddress(params.to);
  const deadline = toHex32(params.deadline);
  const pathData = encodeAddressArray(params.path);

  return (
    SELECTORS.swapExactTokensForETH +
    amountIn +
    amountOutMin +
    pathOffset +
    to +
    deadline +
    pathData
  );
}

// ─── Read-Only Call Encoding ────────────────────────────

/**
 * Encode getAmountsOut calldata for on-chain price queries.
 *
 * function getAmountsOut(uint amountIn, address[] calldata path)
 *   external view returns (uint[] memory amounts)
 */
export function encodeGetAmountsOut(params: {
  amountIn: string;
  path: string[];
  tokenDecimals?: number;
}): string {
  const decimals = params.tokenDecimals ?? 18;

  const amountIn = amountToHex(params.amountIn, decimals);
  const pathOffset = toHex32(32); // 1 static param = 32 bytes
  const pathData = encodeAddressArray(params.path);

  return SELECTORS.getAmountsOut + amountIn + pathOffset + pathData;
}

// ─── Calldata Decoder ───────────────────────────────────

/**
 * Decode a uint256 from ABI-encoded hex data.
 */
export function decodeUint256(hexData: string): bigint {
  const clean = hexData.replace(/^0x/, "");
  return BigInt("0x" + clean);
}

/**
 * Decode an array of uint256 from getAmountsOut response.
 */
export function decodeAmountsOut(hexData: string): bigint[] {
  const clean = hexData.replace(/^0x/, "");
  // Skip offset (64 chars) and length (64 chars)
  const length = Number(BigInt("0x" + clean.slice(64, 128)));
  const amounts: bigint[] = [];
  for (let i = 0; i < length; i++) {
    const start = 128 + i * 64;
    amounts.push(BigInt("0x" + clean.slice(start, start + 64)));
  }
  return amounts;
}
