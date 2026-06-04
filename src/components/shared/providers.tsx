"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { ToastContainer } from "./toast-container";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastContainer />
    </ToastPrimitive.Provider>
  );
}
