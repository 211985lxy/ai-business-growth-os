/**
 * L1: Global Navigation (全局导航栏)
 * Fixed 68px width, h-screen
 */

"use client";

import { BarChart3, FileText, HelpCircle, PenTool, Settings, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { id: "strategy", label: "天道·战略", icon: Sparkles, href: "/strategy" },
  { id: "content", label: "神韵·内容", icon: PenTool, href: "/content-workplace" },
  { id: "model", label: "器物·模型", icon: FileText, href: "/model" },
  { id: "products", label: "产品·商品", icon: BarChart3, href: "/products" },
];

export const GlobalNav = memo(function GlobalNav() {
  const pathname = usePathname();

  return (
    <aside className="w-[68px] h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-4 justify-between border-r border-zinc-200 dark:border-zinc-800">
      <div className="shrink-0">
        <button className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
          <User className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
        </button>
      </div>

      {/* Middle: Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative w-full flex items-center justify-center py-3 group"
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-zinc-900 dark:bg-white rounded-r-sm" />
              )}

              {/* Icon */}
              <item.icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings & Help */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button className="w-full flex items-center justify-center py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors group">
          <Settings className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
        </button>
        <button className="w-full flex items-center justify-center py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors group">
          <HelpCircle className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
        </button>
      </div>
    </aside>
  );
});
