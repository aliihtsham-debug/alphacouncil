"use client";

/**
 * Dashboard Sidebar Component
 *
 * Extracted from (dashboard)/layout.tsx for reusability.
 * Collapsible sidebar with navigation links and mobile bottom bar.
 */

import * as React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  BarChart3,
  Target,
  Clock,
  ScanLine,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";

const sidebarLinks = [
  { href: "/committee", label: "Committee", icon: Brain },
  { href: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { href: "/recommendation", label: "Recommendation", icon: Target },
  { href: "/history", label: "Trade History", icon: Clock },
  { href: "/scanner", label: "Market Scanner", icon: ScanLine },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 220 }}
        transition={{ duration: 0.3 }}
        className="sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-border glass-subtle md:block"
      >
        <div className="flex h-full flex-col p-3">
          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors self-end"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Nav links */}
          <nav className="flex flex-col gap-2">
            {sidebarLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.aside>

      {/* Mobile nav bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border glass-strong md:hidden">
        <nav className="flex items-center justify-around py-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
