import { create } from "zustand";

interface Toast {
  message: string;
  type: "success" | "error" | "info";
}

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toast: Toast | null;
  showToast: (message: string, type: Toast["type"]) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toast: null,
  showToast: (message, type) => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
