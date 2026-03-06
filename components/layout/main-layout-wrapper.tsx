"use client";

import { usePathname } from "next/navigation";
import { GlobalNav } from "@/components/layout/global-nav";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 只有在主页或者明确需要左侧导航的页面才显示 GlobalNav
  const showGlobalNav = pathname === "/" || pathname === "/dashboard";

  return (
    <div className="flex min-h-screen">
      {/* 仅在主页显示左侧全局导航 */}
      {showGlobalNav && <GlobalNav />}

      {/* 主页面内容区 */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
