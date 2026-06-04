"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const typeConfig = {
  success: {
    icon: Check,
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-400",
    shadowColor: "shadow-[0_0_20px_rgba(34,197,94,0.15)]",
  },
  error: {
    icon: X,
    borderColor: "border-red-500/40",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-400",
    shadowColor: "shadow-[0_0_20px_rgba(239,68,68,0.15)]",
  },
  info: {
    icon: Info,
    borderColor: "border-cyan-500/40",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    shadowColor: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  },
};

export function ToastContainer() {
  const toast = useUIStore((s) => s.toast);
  const clearToast = useUIStore((s) => s.clearToast);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (toast) {
      setOpen(true);
      const timer = setTimeout(() => {
        setOpen(false);
        setTimeout(clearToast, 300); // Wait for exit animation
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setOpen(false);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Root
        open={open}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setTimeout(clearToast, 300);
          }
        }}
        asChild
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "fixed top-20 right-4 z-[100] max-w-sm rounded-xl border p-4 glass-strong",
                config.borderColor,
                config.bgColor,
                config.shadowColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 shrink-0", config.iconColor)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <ToastPrimitive.Title className="text-sm font-semibold">
                    {toast.type === "success"
                      ? "Success"
                      : toast.type === "error"
                        ? "Error"
                        : "Info"}
                  </ToastPrimitive.Title>
                  <ToastPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                    {toast.message}
                  </ToastPrimitive.Description>
                </div>
                <ToastPrimitive.Close asChild>
                  <button
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => {
                      setOpen(false);
                      setTimeout(clearToast, 300);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </ToastPrimitive.Close>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}
