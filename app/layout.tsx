import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";
import { GlobalSearchBar } from "@/components/layout/global-search-bar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "六脉增长系统",
  description: "天地人神财法一体 - AI驱动的商业增长平台",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
      <body
        className="font-sans antialiased text-zinc-800 dark:text-zinc-100 dark:text-zinc-200 bg-white dark:bg-zinc-950"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {/* Main Content Area Wrapped with Nav Logic */}
          <MainLayoutWrapper>
            <GlobalSearchBar />
            {children}
          </MainLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
