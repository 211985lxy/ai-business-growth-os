/**
 * L2: Module Sidebar (模块侧边栏)
 * Default 280px, min 200px, max 450px
 * Collapsible with localStorage persistence
 */

"use client";

import { memo, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface HistoryRecord {
  id: string;
  title: string;
  createdAt: string;
}

interface ModuleSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

const mockHistory: HistoryRecord[] = [
  { id: "1", title: "美业培训战略分析", createdAt: "2小时前" },
  { id: "2", title: "餐饮供应链转型", createdAt: "昨天" },
  { id: "3", title: "B2B服务平台规划", createdAt: "3天前" },
  { id: "4", title: "个人IP打造方案", createdAt: "1周前" },
];

export const ModuleSidebar = memo(function ModuleSidebar({
  collapsed = false,
  onCollapse,
}: ModuleSidebarProps) {
  const router = useRouter();
  const [moduleTitle, setModuleTitle] = useState("天道·战略");

  // Persist collapse state to localStorage
  useEffect(() => {
    const stored = localStorage.getItem("module-sidebar-collapsed");
    if (stored === "true" && onCollapse) {
      onCollapse();
    }
  }, [onCollapse]);

  const handleCollapse = () => {
    const newState = !collapsed;
    localStorage.setItem("module-sidebar-collapsed", String(newState));
    if (onCollapse) onCollapse();
  };

  if (collapsed) {
    return (
      <div className="w-0 overflow-hidden relative group">
        {/* Hidden trigger zone */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[1px] hover:w-2 transition-all cursor-col-resize z-10"
          onClick={handleCollapse}
        />
      </div>
    );
  }

  return (
    <aside className="w-[280px] min-w-[200px] max-w-[450px] h-screen bg-[#0D0D0D] flex flex-col border-r border-white/5">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-medium text-slate-200">{moduleTitle}</h2>
        <button
          onClick={handleCollapse}
          className="p-1 hover:bg-white/[0.06] rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-slate-300" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <input
          type="text"
          placeholder="搜索历史记录..."
          className="w-full bg-white/5 border-0 rounded-md px-3 py-2 text-sm text-slate-300 placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
        />
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="space-y-1">
          {mockHistory.map((record) => (
            <div
              key={record.id}
              className="group relative flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.06] rounded-lg cursor-pointer transition-colors"
              onClick={() => router.push("/strategy")}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-300 shrink-0" />
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400 truncate">{record.title}</span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all">
                <MoreHorizontal className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 shrink-0">
        <p className="text-[11px] text-zinc-600 dark:text-zinc-300">共 {mockHistory.length} 条历史记录</p>
      </div>
    </aside>
  );
});
