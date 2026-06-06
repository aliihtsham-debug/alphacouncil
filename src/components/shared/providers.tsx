"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "./toast-container";

// Singleton QueryClient to persist across hot reloads
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
        },
      },
    });
  }
  // Browser: reuse the same client
  if (!(window as unknown as Record<string, unknown>).__queryClient) {
    (window as unknown as Record<string, unknown>).__queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
        },
      },
    });
  }
  return (window as unknown as Record<string, unknown>).__queryClient as QueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastContainer />
      </ToastPrimitive.Provider>
    </QueryClientProvider>
  );
}
