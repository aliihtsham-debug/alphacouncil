/**
 * CoinMarketCap API Client
 *
 * Server-side only. All API keys stay on the server.
 * Responses are cached via the cache layer.
 */

import type {
  CMCListingsResponse,
  CMCTrendingResponse,
  CMCCategoriesResponse,
  CMCGlobalMetrics,
  CMCToken,
} from "./types";

const CMC_BASE_URL =
  process.env.COINMARKETCAP_BASE_URL ||
  "https://pro-api.coinmarketcap.com/v1";
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;

if (!CMC_API_KEY && typeof window === "undefined") {
  console.warn(
    "⚠️  COINMARKETCAP_API_KEY is not set. Market data will use mock data."
  );
}

/**
 * Make an authenticated request to CoinMarketCap API.
 */
async function cmcFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // If no API key, throw to trigger mock fallback
  if (!CMC_API_KEY) {
    throw new Error("CMC_API_KEY not configured");
  }

  const url = new URL(`${CMC_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-CMC_PRO_API_KEY": CMC_API_KEY,
      Accept: "application/json",
    },
    next: { revalidate: 60 }, // Next.js data cache: 60s
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `CoinMarketCap API error: ${response.status} ${response.statusText} — ${errorBody}`
    );
  }

  return response.json();
}

// ─── API Methods ─────────────────────────────────────────

/**
 * Get latest token listings with market data.
 */
export async function getTokenListings(params?: {
  start?: number;
  limit?: number;
  sort?: string;
  sort_dir?: "asc" | "desc";
  category?: string;
  symbol?: string;
}): Promise<CMCListingsResponse> {
  return cmcFetch<CMCListingsResponse>("/cryptocurrency/listings/latest", {
    start: String(params?.start ?? 1),
    limit: String(params?.limit ?? 100),
    sort: params?.sort ?? "market_cap",
    sort_dir: params?.sort_dir ?? "desc",
    ...(params?.category && { category: params.category }),
    ...(params?.symbol && { symbol: params.symbol }),
  });
}

/**
 * Get trending tokens (by market cap rank change).
 */
export async function getTrendingTokens(limit = 20): Promise<CMCToken[]> {
  try {
    const response = await cmcFetch<CMCTrendingResponse>(
      "/cryptocurrency/trending-latest",
      { limit: String(limit) }
    );
    return response.data;
  } catch {
    // Fallback: get top tokens sorted by percent change
    const response = await getTokenListings({
      limit,
      sort: "percent_change_24h",
      sort_dir: "desc",
    });
    return response.data;
  }
}

/**
 * Get top gainers (tokens with highest 24h % change).
 */
export async function getTopGainers(limit = 20): Promise<CMCToken[]> {
  const response = await getTokenListings({
    limit,
    sort: "percent_change_24h",
    sort_dir: "desc",
  });
  return response.data.filter(
    (t) => (t.quote.USD.percent_change_24h ?? 0) > 0
  );
}

/**
 * Get top losers (tokens with lowest 24h % change).
 */
export async function getTopLosers(limit = 20): Promise<CMCToken[]> {
  const response = await getTokenListings({
    limit,
    sort: "percent_change_24h",
    sort_dir: "asc",
  });
  return response.data.filter(
    (t) => (t.quote.USD.percent_change_24h ?? 0) < 0
  );
}

/**
 * Get token metadata by symbol.
 */
export async function getTokensBySymbol(
  symbols: string[]
): Promise<CMCToken[]> {
  const response = await cmcFetch<CMCListingsResponse>(
    "/cryptocurrency/quotes/latest",
    { symbol: symbols.join(",") }
  );
  return response.data;
}

/**
 * Get available categories.
 */
export async function getCategories(): Promise<CMCCategoriesResponse> {
  return cmcFetch<CMCCategoriesResponse>("/cryptocurrency/categories", {
    start: "1",
    limit: "100",
  });
}

/**
 * Get global market metrics.
 */
export async function getGlobalMetrics(): Promise<CMCGlobalMetrics> {
  return cmcFetch<CMCGlobalMetrics>("/global-metrics/quotes/latest");
}

/**
 * Get Fear & Greed Index from Alternative.me API.
 */
export async function getFearGreedIndex(): Promise<{
  value: number;
  classification: string;
}> {
  try {
    const response = await fetch(
      "https://api.alternative.me/fng/?limit=1",
      { next: { revalidate: 300 } } // 5 min cache
    );
    const data = await response.json();
    return {
      value: parseInt(data.data[0].value, 10),
      classification: data.data[0].value_classification,
    };
  } catch {
    return { value: 50, classification: "Neutral" };
  }
}
