/**
 * Theme Toggle Button
 * 主题切换按钮 - [2025-03-02] 优化：使用MaterialIcon，简化为只切换light/dark
 */

"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // [2025-03-02] 修改：简化为只在light和dark之间切换
  const toggleTheme = () => {
    setTheme(actualTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
        <div className="w-4 h-4 bg-zinc-300 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all duration-200 border border-zinc-200 dark:border-zinc-800 dark:border-white/10 shadow-sm"
      title={actualTheme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
    >
      <MaterialIcon
        icon={actualTheme === "dark" ? "light_mode" : "dark_mode"}
        size={20}
        className="text-zinc-600 dark:text-zinc-300 dark:text-amber-400 transition-colors duration-200"
      />
    </button>
  );
}
