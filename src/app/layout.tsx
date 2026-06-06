import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../sentry.client.config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/shared/providers";
import { PostHogClientProvider } from "@/components/shared/posthog-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha Council — AI-Powered Investment Committee",
  description:
    "Multiple specialized AI agents debate investment opportunities before reaching a decision. Transparent reasoning. Professional risk management. One-click execution.",
  keywords: [
    "crypto",
    "AI",
    "trading",
    "investment",
    "portfolio",
    "Trust Wallet",
    "CoinMarketCap",
    "BNB",
    "DeFi",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PostHogClientProvider>
          <Header />
          <main className="flex-1">
            <Providers>{children}</Providers>
          </main>
          <Footer />
        </PostHogClientProvider>
      </body>
    </html>
  );
}
