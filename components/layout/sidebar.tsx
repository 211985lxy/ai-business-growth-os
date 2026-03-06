/**
 * Feishu Style Sidebar Navigation
 * 飞书风格左侧边栏 - 简洁现代设计（仅浅色主题）
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserMenu } from "@/components/auth/user-menu";

interface NavItem {
  title: string;
  href: string;
  icon: string; // Material Symbol icon name
  badge?: string | number; // 支持数字徽标
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: "仪表盘",
    href: "/",
    icon: "dashboard",
    description: "数据总览",
  },
  {
    title: "天道 · 战略",
    href: "/strategy",
    icon: "explore",
    description: "AI 商业战略生成",
  },
  {
    title: "地利 · 产品",
    href: "/products",
    icon: "landscape",
    description: "核心赛道与产品资产",
  },
  {
    title: "人和 · 模式",
    href: "/model",
    icon: "groups",
    description: "团结视频专业人士",
  },
  {
    title: "神韵 · 内容",
    href: "/content-factory",
    icon: "videocam",
    description: "视频脚本生成器",
    badge: 3, // 示例数字徽标
  },
  {
    title: "财库 · 成交",
    href: "/closing",
    icon: "payments",
    description: "成交转化系统",
  },
  {
    title: "法度 · 管理",
    href: "/management",
    icon: "shield",
    description: "系统设置与管理",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar - L2 过渡面板 */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-60 h-screen bg-white border-r border-zinc-200 dark:border-zinc-800/50",
          className
        )}
      >
        {/* Avatar + Add 区域 */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          {/* 32px 圆形头像 */}
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-xs font-semibold">六</span>
          </div>

          {/* 16px 灰色 +号 */}
          <button
            className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-zinc-300 transition-colors shrink-0"
            aria-label="添加"
          >
            <MaterialIcon icon="add" size={12} className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-3 pb-3">
          <button
            className={cn(
              "w-full h-8 px-3 flex items-center gap-2",
              "bg-white rounded-lg",
              "text-zinc-500 dark:text-zinc-400",
              "hover:bg-zinc-50",
              "transition-colors duration-150"
            )}
          >
            <MaterialIcon icon="search" size={16} />
            <span className="text-xs">搜索</span>
            <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">⌘K</span>
          </button>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-3 h-9.5 rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-white text-zinc-900 dark:text-zinc-50 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-50"
                )}
              >
                {/* Material Symbol 图标 - 20px */}
                <MaterialIcon
                  icon={item.icon}
                  size={20}
                  className={cn(
                    "transition-colors duration-150",
                    isActive ? "text-blue-600" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-200"
                  )}
                />

                {/* 文字 */}
                <span className="flex-1 text-sm font-medium truncate">{item.title}</span>

                {/* 徽标 Badge */}
                {item.badge && (
                  <span
                    className={cn(
                      "flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full",
                      "bg-[#F54A45] text-white text-xs font-semibold",
                      "shadow-sm"
                    )}
                  >
                    {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section (Bottom) */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/50">
          <UserMenu />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg border border-zinc-200 dark:border-zinc-800"
          >
            {mobileOpen ? (
              <MaterialIcon icon="close" size={20} className="text-zinc-600 dark:text-zinc-300" />
            ) : (
              <MaterialIcon icon="menu" size={20} className="text-zinc-600 dark:text-zinc-300" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0 gap-0 bg-white border-r border-zinc-200 dark:border-zinc-800/50">
          <SheetHeader className="p-3 border-b border-zinc-200 dark:border-zinc-800/50">
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
          </SheetHeader>

          {/* Mobile Avatar + Add */}
          <div className="flex items-center gap-2 px-3 py-3">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white text-xs font-semibold">六</span>
            </div>
            <button
              className="w-4 h-4 rounded-full bg-zinc-200 flex items-center justify-center shrink-0"
              aria-label="添加"
            >
              <MaterialIcon icon="add" size={12} className="text-zinc-500 dark:text-zinc-400" />
            </button>
          </div>

          {/* Mobile 搜索框 */}
          <div className="px-3 pb-3">
            <button
              className={cn(
                "w-full h-8 px-3 flex items-center gap-2",
                "bg-white rounded-lg",
                "text-zinc-500 dark:text-zinc-400"
              )}
            >
              <MaterialIcon icon="search" size={16} />
              <span className="text-xs">搜索</span>
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">⌘K</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 h-9.5 rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-white text-zinc-900 dark:text-zinc-50 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-50"
                  )}
                >
                  <MaterialIcon
                    icon={item.icon}
                    size={20}
                    className={cn(
                      "transition-colors duration-150",
                      isActive ? "text-blue-600" : "text-zinc-500 dark:text-zinc-400"
                    )}
                  />
                  <span className="flex-1 text-sm font-medium">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full",
                        "bg-[#F54A45] text-white text-xs font-semibold"
                      )}
                    >
                      {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/50 bg-white/50">
            <UserMenu />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
