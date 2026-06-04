import { create } from "zustand";
import type { PortfolioAnalysis } from "@/types/portfolio";

interface PortfolioStore {
  data: PortfolioAnalysis | null;
  isLoading: boolean;
  error: string | null;
  analyzedAt: string | null;

  setPortfolio: (data: PortfolioAnalysis) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refresh: () => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  analyzedAt: null,

  setPortfolio: (data) =>
    set({ data, analyzedAt: new Date().toISOString(), error: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  refresh: () => set({ data: null, analyzedAt: null }),
}));
