/**
 * Global Navigation (L1) - 飞书风格最左侧窄栏
 * 全局分身切换 - 决定用户处于哪个大模块
 */

"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface GlobalNavItem {
  title: string;
  href: string;
  icon: string;
  description: string;
}

const globalNavItems: GlobalNavItem[] = [
  {
    title: "仪表盘",
    href: "/",
    icon: "dashboard",
    description: "数据总览",
  },
  {
    title: "灵魂仓库",
    href: "/knowledge",
    icon: "library_books",
    description: "企业知识库管理",
  },
  {
    title: "天道·战略",
    href: "/strategy",
    icon: "lightbulb",
    description: "AI 商业战略生成",
  },
  {
    title: "地利·产品",
    href: "/products",
    icon: "landscape",
    description: "核心赛道与产品资产",
  },
  {
    title: "人和·模式",
    href: "/model",
    icon: "groups",
    description: "团结视频专业人士",
  },
  {
    title: "神韵·内容",
    href: "/content-factory",
    icon: "videocam",
    description: "视频脚本生成器",
  },
  {
    title: "财库·成交",
    href: "/closing",
    icon: "payments",
    description: "成交转化系统",
  },
  {
    title: "法度·管理",
    href: "/management",
    icon: "shield",
    description: "系统设置与管理",
  },
];

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <nav className="w-18 h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-4 shrink-0 transition-colors">
      {/* 用户头像 */}
      <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0 shadow-sm mb-6">
        <span className="text-white dark:text-zinc-900 text-sm font-semibold">六</span>
      </div>

      {/* 这里的全局搜索功能已经提取为悬浮的全局组件 GlobalSearchBar */}
      <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 mb-4"></div>

      {/* 六大智能体入口 */}
      <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto">
        {globalNavItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-white dark:bg-zinc-800 shadow-sm"
                  : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
              )}
              title={item.title}
            >
              {/* 图标 */}
              <MaterialIcon
                icon={item.icon}
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  isActive
                    ? "text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200"
                )}
              />

              {/* 选中指示器 - 左侧小竖线 */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-r-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
