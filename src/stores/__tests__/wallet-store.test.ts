import { describe, it, expect, beforeEach } from "vitest";
import { useWalletStore } from "../wallet-store";

describe("wallet-store", () => {
  beforeEach(() => {
    useWalletStore.setState({
      address: null,
      chain: "BNB",
      isConnected: false,
      isConnecting: false,
    });
  });

  it("starts disconnected", () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
  });

  it("connects with address and chain", () => {
    useWalletStore.getState().connect("0x1234567890abcdef", "BNB");
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe("0x1234567890abcdef");
    expect(state.chain).toBe("BNB");
  });

  it("disconnects correctly", () => {
    useWalletStore.getState().connect("0x1234567890abcdef", "BNB");
    useWalletStore.getState().disconnect();
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
  });

  it("sets connecting state", () => {
    useWalletStore.getState().setConnecting(true);
    expect(useWalletStore.getState().isConnecting).toBe(true);
    useWalletStore.getState().setConnecting(false);
    expect(useWalletStore.getState().isConnecting).toBe(false);
  });
});
