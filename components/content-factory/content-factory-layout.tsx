/**
 * Content Factory Layout
 * 内容工厂专用布局组件 - 支持三模式导航
 */

"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";
import type { ContentFactoryMode } from "@/types/content-factory";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export interface ContentFactoryLayoutProps {
  /** 当前模式 */
  mode: ContentFactoryMode;
  /** 切换模式 */
  onModeChange: (mode: ContentFactoryMode) => void;
  /** 是否正在生成 */
  isStreaming?: boolean;
  /** 当前生成的内容 */
  content?: string | null;
  /** 历史内容 */
  historyContent?: string | null;
  /** 错误信息 */
  error?: string | null;
  /** 复制回调 */
  onCopy?: () => void;
  /** 新建回调 */
  onNew?: () => void;
  /** 左栏历史记录组件 */
  historyComponent?: React.ReactNode;
  /** 右栏输出组件 */
  outputComponent: React.ReactNode;
  /** 中栏输入组件 */
  inputComponent: React.ReactNode;
  /** 空状态组件 */
  emptyStateComponent?: React.ReactNode;
}

// 模式配置
const MODES = [
  {
    value: "search" as ContentFactoryMode,
    label: "爆款选题",
    icon: "search",
  },
  {
    value: "create" as ContentFactoryMode,
    label: "内容创作",
    icon: "edit",
  },
  {
    value: "insights" as ContentFactoryMode,
    label: "数据洞察",
    icon: "analytics",
  },
  {
    value: "plan" as ContentFactoryMode,
    label: "发布计划",
    icon: "calendar_today",
  },
];

export function ContentFactoryLayout({
  mode,
  onModeChange,
  isStreaming = false,
  content,
  historyContent,
  error,
  onCopy,
  onNew,
  historyComponent,
  outputComponent,
  inputComponent,
  emptyStateComponent,
}: ContentFactoryLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [inputWidthMode, setInputWidthMode] = React.useState<"full" | "narrow" | "collapsed">(
    "full"
  );
  const [isFocusedReading, setIsFocusedReading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { theme: _theme, setTheme, actualTheme } = useTheme();

  // Auto-narrow when generation completes
  React.useEffect(() => {
    if (!isStreaming && content && content.length > 100 && !isFocusedReading) {
      setInputWidthMode("narrow");
    }
  }, [isStreaming, content, isFocusedReading]);

  // Handle local copy fallback if not provided
  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
      return;
    }
    const textToCopy = historyContent || content;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const _handleNew = () => {
    if (onNew) onNew();
    setInputWidthMode("full");
    setIsFocusedReading(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* 左栏：导航 + 历史 */}
      <aside
        className={`shrink-0 bg-[#F9FAFB]/80 dark:bg-zinc-900/60 border-r backdrop-blur-xl border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-18" : "w-70"}`}
      >
        {/* 标题区 */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md">
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                title="展开侧边栏"
              >
                <MaterialIcon
                  icon="menu"
                  size={20}
                  className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                />
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                title="回到主页"
              >
                <MaterialIcon
                  icon="home"
                  size={20}
                  className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                />
              </button>
              <button
                onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                title="切换主题"
              >
                <MaterialIcon
                  icon={actualTheme === "dark" ? "light_mode" : "dark_mode"}
                  size={20}
                  className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-outfit text-[15px] font-semibold tracking-wide text-zinc-700 dark:text-zinc-200">
                  神韵 · 内容
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">AI 内容创作工厂</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push("/")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                  title="回到主页"
                >
                  <MaterialIcon
                    icon="home"
                    size={18}
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                  />
                </button>
                <button
                  onClick={() => setTheme(actualTheme === "dark" ? "light" : "dark")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                  title="切换主题"
                >
                  <MaterialIcon
                    icon={actualTheme === "dark" ? "light_mode" : "dark_mode"}
                    size={18}
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                  />
                </button>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-200"
                  title="收起侧边栏"
                >
                  <MaterialIcon
                    icon="chevron_left"
                    size={18}
                    className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!sidebarCollapsed ? (
            <div className="px-5 py-4 flex flex-col h-full">
              {/* 模式导航 */}
              <div className="space-y-2 mb-4">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2 font-outfit">
                  功能模式
                </p>
                {MODES.map((m) => {
                  const isActive = mode === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => onModeChange(m.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2",
                        isActive
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <MaterialIcon
                        icon={m.icon}
                        size={18}
                        className={isActive ? "text-amber-400 dark:text-amber-600" : ""}
                      />
                      <span className="text-[13px] font-medium tracking-wide">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 历史记录 */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                  🕘 最近生成
                </p>
                {historyComponent || (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs py-8">
                    暂无历史记录
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-3">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 transition-all duration-200 group"
                title="展开侧边栏"
              >
                <MaterialIcon icon="menu" size={24} />
              </button>
              <div className="w-10 h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex flex-col items-center space-y-2 px-2">
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setSidebarCollapsed(false);
                      onModeChange(m.value);
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group ${mode === m.value ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900" : "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700"}`}
                    title={m.label}
                  >
                    <MaterialIcon
                      icon={m.icon}
                      size={20}
                      className={
                        mode === m.value
                          ? "text-amber-400 dark:text-amber-600"
                          : "text-zinc-500 dark:text-zinc-400"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        {!sidebarCollapsed && (
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md space-y-2">
            {(content || historyContent) && !isStreaming && (
              <button
                onClick={handleCopy}
                className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg hover:bg-zinc-50 dark:bg-zinc-800/50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    已复制
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="content_copy" size={16} />
                    复制全文
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </aside>

      {/* 中栏：输入区 */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="flex flex-1 min-h-0">
          {/* 输入区 */}
          <div
            className={`relative shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-zinc-950 ${isFocusedReading || inputWidthMode === "collapsed" ? "w-0 border-r-0" : "w-96"}`}
          >
            {(isFocusedReading || inputWidthMode === "collapsed") && (
              <div className="flex-1 flex items-center justify-center py-6">
                <button
                  onClick={() => {
                    if (isFocusedReading) {
                      setIsFocusedReading(false);
                    } else {
                      setInputWidthMode("full");
                    }
                  }}
                  className="writing-vertical-rl text-xs text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors duration-200 font-medium"
                >
                  展开编辑
                </button>
              </div>
            )}

            <div
              className={`flex-1 overflow-y-auto transition-all duration-300 ${isFocusedReading || inputWidthMode === "collapsed" ? "opacity-0 overflow-hidden" : "px-6 py-8"}`}
            >
              {inputComponent}
            </div>
          </div>

          {/* 输出区 */}
          <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-zinc-950 relative">
            {(content || historyContent || isStreaming) && !error && (
              <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between min-h-[48px]">
                <button
                  onClick={() => setIsFocusedReading(!isFocusedReading)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
                >
                  <MaterialIcon
                    icon={isFocusedReading ? "left_panel_open" : "fullscreen"}
                    size={16}
                  />
                  {isFocusedReading ? "显示输入" : "专注阅读"}
                </button>
                {!isStreaming && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200"
                  >
                    <MaterialIcon icon={copied ? "check" : "content_copy"} size={16} />
                    {copied ? "已复制" : "复制全文"}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <MaterialIcon icon="error_outline" size={24} className="text-red-400" />
                </div>
                <h3 className="text-sm font-medium text-red-700 mb-2">生成出错</h3>
                <p className="text-xs text-red-600 text-center max-w-sm break-all">{error}</p>
              </div>
            )}

            {!content && !historyContent && !isStreaming && !error && (
              <div className="flex-1 flex flex-col items-center justify-center px-6">
                {emptyStateComponent || (
                  <>
                    <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
                      <MaterialIcon
                        icon="lightbulb"
                        size={32}
                        className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500"
                      />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 dark:text-zinc-100 mb-2">
                      准备就绪
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md leading-relaxed">
                      在左侧选择模式并开始操作
                    </p>
                  </>
                )}
              </div>
            )}

            {(content || historyContent || isStreaming) && !error && (
              <div className="flex-1 overflow-y-auto" style={{ userSelect: "text" }}>
                <div className="max-w-4xl mx-auto px-8 py-8 h-full">{outputComponent}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
