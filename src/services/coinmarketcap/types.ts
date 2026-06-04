/**
 * CoinMarketCap API response types
 * Based on CMC Pro API v1 specification
 */

export interface CMCStatus {
  timestamp: string;
  error_code: number;
  error_message: string | null;
  elapsed: number;
  credit_count: number;
  notice?: string | null;
}

// ─── Cryptocurrency Listings ────────────────────────────

export interface CMCToken {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number | null;
  num_market_pairs: number;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: {
    USD: CMCQuote;
  };
}

export interface CMCQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number | null;
  percent_change_1h: number | null;
  percent_change_24h: number | null;
  percent_change_7d: number | null;
  percent_change_30d: number | null;
  percent_change_60d: number | null;
  percent_change_90d: number | null;
  market_cap: number | null;
  market_cap_dominance: number | null;
  fully_diluted_market_cap: number | null;
  last_updated: string;
}

export interface CMCListingsResponse {
  data: CMCToken[];
  status: CMCStatus;
}

// ─── Trending ───────────────────────────────────────────

export interface CMCTrendingResponse {
  data: CMCToken[];
  status: CMCStatus;
}

// ─── Categories ─────────────────────────────────────────

export interface CMCCategory {
  id: string;
  name: string;
  title: string;
  description: string;
  num_tokens: number;
  avg_price_change: number;
  market_cap: number;
  market_cap_change: number;
  volume: number;
  volume_change: number;
  last_updated: string;
}

export interface CMCCategoriesResponse {
  data: CMCCategory[];
  status: CMCStatus;
}

// ─── Global Metrics ─────────────────────────────────────

export interface CMCGlobalMetrics {
  data: {
    active_cryptocurrencies: number;
    total_cryptocurrencies: number;
    active_market_pairs: number;
    active_exchanges: number;
    total_exchanges: number;
    btc_dominance: number;
    eth_dominance: number;
    quote: {
      USD: {
        total_market_cap: number;
        total_volume_24h: number;
        total_volume_24h_reported: number;
        altcoin_volume_24h: number;
        altcoin_volume_24h_reported: number;
        altcoin_market_cap: number;
        defi_volume_24h: number | null;
        defi_market_cap: number | null;
        stablecoin_volume_24h: number | null;
        stablecoin_market_cap: number | null;
        last_updated: string;
      };
    };
    last_updated: string;
  };
  status: CMCStatus;
}

// ─── Fear & Greed Index (from alternative API) ──────────

export interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
}

export interface FearGreedResponse {
  data: FearGreedData[];
}
