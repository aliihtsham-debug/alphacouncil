/**
 * Market data types from CoinMarketCap
 */

export interface TokenQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

export interface TokenMetadata {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: unknown;
  self_reported_circulating_supply: unknown;
  self_reported_market_cap: unknown;
  quote: {
    USD: TokenQuote;
  };
}

export interface TokenListResponse {
  data: TokenMetadata[];
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
}

export interface TrendingToken {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
    };
  };
}

export interface CategoryInfo {
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
}

export type TokenCategory =
  | "AI"
  | "DeFi"
  | "Gaming"
  | "BNB"
  | "Meme"
  | "Layer1"
  | "Layer2"
  | "Infrastructure";

export const CATEGORY_MAP: Record<TokenCategory, string[]> = {
  AI: ["artificial-intelligence", "ai", "ai-2"],
  DeFi: ["defi", "decentralized-finance"],
  Gaming: ["gaming", "gamefi", "metaverse", "play-to-earn"],
  BNB: ["bnb-chain", "binance-smart-chain", "bsc"],
  Meme: ["meme", "memes", "dog", "dog-themed"],
  Layer1: ["layer-1", "l1"],
  Layer2: ["layer-2", "l2", "scaling"],
  Infrastructure: ["infrastructure", "oracle", "storage"],
};
