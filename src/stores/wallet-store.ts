import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletState {
  address: string | null;
  chain: string;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (address: string, chain?: string) => void;
  disconnect: () => void;
  setConnecting: (connecting: boolean) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      chain: "BNB",
      isConnected: false,
      isConnecting: false,

      connect: (address: string, chain = "BNB") =>
        set({ address, chain, isConnected: true, isConnecting: false }),

      disconnect: () =>
        set({ address: null, chain: "BNB", isConnected: false, isConnecting: false }),

      setConnecting: (connecting: boolean) => set({ isConnecting: connecting }),
    }),
    {
      name: "alphacouncil-wallet",
      partialize: (state) => ({
        address: state.address,
        chain: state.chain,
        isConnected: state.isConnected,
      }),
    }
  )
);
