"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 bg-grid min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-7xl p-6 pb-24 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
