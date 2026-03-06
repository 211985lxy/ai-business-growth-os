import { useTheme } from "@/components/theme/theme-provider";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export interface AgentLayoutProps {
  /** The id for this agent, used for active history and storage (e.g. strategy, product) */
  agentId: string;
  /** Title of the agent (e.g. 天道 · 战略) */
  title: string;
  /** Subtitle of the agent (e.g. AI 商业战略生成) */
  subtitle: string;
  /** The lucide-react icon component or string path */
  icon: React.ReactNode;
  /** Accent color classes (e.g. indigo, fuchsia, emerald) for buttons & backgrounds */
  accentColor: "indigo" | "fuchsia" | "emerald" | "amber" | "rose" | "cyan" | "yellow";

  /** Whether the generation is currently streaming */
  isStreaming: boolean;
  /** Current generated content (draft or final) */
  content: string | null;
  /** Historical content (if viewing a past generation) */
  historyContent: string | null;
  /** Whethergeneration has been paused */
  isPaused?: boolean;
  /** Any generation errors */
  error?: string | null;
  /** Check if any record has been saved */
  hasSavedRecord?: boolean;

  onTogglePause?: () => void;
  onCopy?: () => void;
  onNew?: () => void;
  onNavigateNext?: () => void;

  /** Optional override for the history component */
  historyComponent?: React.ReactNode;

  /** Function or Node that requires full width reading mode logic (Canvas) */
  outputComponent: React.ReactNode;
  /** Form or content for the input side */
  inputComponent: React.ReactNode;

  /** Initial welcome/empty state component */
  emptyStateComponent?: React.ReactNode;
}

export function AgentLayout({
  agentId,
  title,
  subtitle,
  icon,
  accentColor,
  isStreaming,
  content,
  historyContent,
  isPaused,
  error,
  hasSavedRecord,
  onTogglePause,
  onCopy,
  onNew,
  onNavigateNext,
  historyComponent,
  outputComponent,
  inputComponent,
  emptyStateComponent,
}: AgentLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [inputWidthMode, setInputWidthMode] = React.useState<"full" | "narrow" | "collapsed">(
    "full"
  );
  const [isFocusedReading, setIsFocusedReading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const { theme, setTheme, actualTheme } = useTheme();

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

  const handleNew = () => {
    if (onNew) onNew();
    setInputWidthMode("full");
    setIsFocusedReading(false);
  };

  const colorMap = {
    indigo: {
      bg: "bg-indigo-600 hover:bg-indigo-500",
      text: "text-indigo-600",
      borderHover: "hover:border-indigo-300",
      lightBg: "bg-indigo-50 hover:bg-indigo-100",
    },
    fuchsia: {
      bg: "bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800",
      text: "text-zinc-900 dark:text-zinc-50",
      borderHover: "hover:border-amber-500/30",
      lightBg: "bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:bg-zinc-800",
    },
    emerald: {
      bg: "bg-emerald-600 hover:bg-emerald-500",
      text: "text-emerald-600",
      borderHover: "hover:border-emerald-300",
      lightBg: "bg-emerald-50 hover:bg-emerald-100",
    },
    amber: {
      bg: "bg-amber-600 hover:bg-amber-500",
      text: "text-amber-600",
      borderHover: "hover:border-amber-300",
      lightBg: "bg-amber-50 hover:bg-amber-100",
    },
    rose: {
      bg: "bg-rose-600 hover:bg-rose-500",
      text: "text-rose-600",
      borderHover: "hover:border-rose-300",
      lightBg: "bg-rose-50 hover:bg-rose-100",
    },
    cyan: {
      bg: "bg-cyan-600 hover:bg-cyan-500",
      text: "text-cyan-600",
      borderHover: "hover:border-cyan-300",
      lightBg: "bg-cyan-50 hover:bg-cyan-100",
    },
    yellow: {
      bg: "bg-yellow-500 hover:bg-yellow-400",
      text: "text-yellow-600",
      borderHover: "hover:border-yellow-300",
      lightBg: "bg-yellow-50 hover:bg-yellow-100",
    },
  };

  const currentColors = colorMap[accentColor];

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* L2: Module Panel (280px or collapsed to 72px) */}
      <aside
        className={`shrink-0 bg-[#F9FAFB]/80 dark:bg-zinc-900/60 border-r backdrop-blur-xl border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarCollapsed ? "w-18" : "w-70"
        }`}
      >
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
                  className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-300"
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
                  className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-300"
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
                  className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-300"
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-outfit text-[15px] font-semibold tracking-wide text-zinc-700 dark:text-zinc-200">
                  {title}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
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
                    className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-300"
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
                    className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-300"
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
                    className="text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:text-zinc-300 dark:text-zinc-300"
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!sidebarCollapsed ? (
            <div className="p-4 flex flex-col h-full">
              <button
                onClick={handleNew}
                className={`w-full py-2 px-3 mb-3 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-${accentColor}-500/20 dark:shadow-${accentColor}-900/30 ${currentColors.bg} hover:shadow-lg hover:shadow-${accentColor}-500/30`}
              >
                <MaterialIcon icon="add" size={16} />
                新建
              </button>
              <div className="flex-1 overflow-y-auto min-h-0">{historyComponent}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-3">
              <button
                onClick={handleNew}
                className={`w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 group ${currentColors.bg}`}
                title="新建"
              >
                <MaterialIcon icon="add" size={24} className="text-white" />
              </button>
              <div className="w-10 h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex flex-col items-center space-y-2 px-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:bg-zinc-800/50 transition-all duration-200 group ${currentColors.borderHover}`}
                  title="历史记录"
                >
                  <MaterialIcon
                    icon="history"
                    size={18}
                    className={`text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 group-hover:${currentColors.text} transition-colors duration-200`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md space-y-2">
            {isStreaming && onTogglePause && (
              <button
                onClick={onTogglePause}
                className="w-full py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg hover:bg-zinc-50 dark:bg-zinc-800/50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                {isPaused ? (
                  <>
                    <MaterialIcon icon="play_arrow" size={16} />
                    继续生成
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="pause" size={16} />
                    暂停生成
                  </>
                )}
              </button>
            )}

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

            {hasSavedRecord && onNavigateNext && (
              <button
                onClick={onNavigateNext}
                className={`w-full py-2 px-3 text-white text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-${accentColor}-500/20 dark:shadow-${accentColor}-900/30 ${currentColors.bg} hover:shadow-lg hover:shadow-${accentColor}-500/30`}
              >
                前往下一步骤
                <MaterialIcon icon="arrow_forward" size={16} />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* L3: Core Canvas */}
      <main className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="flex flex-1 min-h-0">
          {/* Input Area */}
          <div
            className={`relative shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-zinc-950 ${
              isFocusedReading || inputWidthMode === "collapsed" ? "w-0 border-r-0" : "w-96"
            }`}
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
                  className="writing-vertical-rl text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200 transition-colors duration-200"
                  style={{ writingMode: "vertical-rl" }}
                >
                  展开编辑
                </button>
              </div>
            )}

            {/* Collapse / Expand Toggle — sits on the right edge of the input panel */}
            {!isFocusedReading && (
              <button
                onClick={() =>
                  setInputWidthMode(inputWidthMode === "collapsed" ? "full" : "collapsed")
                }
                className={`absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 w-5 h-16 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-700 shadow-lg flex items-center justify-center z-20 transition-all duration-200 hover:scale-110 hover:shadow-xl ${currentColors.borderHover}`}
                title={inputWidthMode === "collapsed" ? "展开输入区" : "收起输入区"}
              >
                <MaterialIcon
                  icon={inputWidthMode === "collapsed" ? "chevron_right" : "chevron_left"}
                  size={16}
                  className={`text-zinc-500 dark:text-zinc-400 hover:${currentColors.text} transition-colors`}
                />
              </button>
            )}

            <div
              className={`flex-1 overflow-y-auto transition-all duration-300 ${
                isFocusedReading || inputWidthMode === "collapsed"
                  ? "opacity-0 overflow-hidden"
                  : "p-6"
              }`}
            >
              {inputComponent}
            </div>
          </div>

          {/* Output Area */}
          <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-zinc-950 relative">
            {/* Show expand button on output side when input is hidden */}
            {(isFocusedReading || inputWidthMode === "collapsed") && (
              <button
                onClick={() => {
                  if (isFocusedReading) setIsFocusedReading(false);
                  else setInputWidthMode("full");
                }}
                className={`absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:border-zinc-700 shadow-lg flex items-center justify-center z-20 transition-all duration-200 hover:scale-110 ${currentColors.borderHover}`}
                title="展开输入区"
              >
                <MaterialIcon
                  icon="chevron_right"
                  size={16}
                  className={`text-zinc-500 dark:text-zinc-400 hover:${currentColors.text} transition-colors`}
                />
              </button>
            )}

            {(content || historyContent || isStreaming) && !error && (
              <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between min-h-[48px]">
                <button
                  onClick={() => setIsFocusedReading(!isFocusedReading)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-all duration-200"
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-all duration-200"
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
                      在左侧输入参数并开始生成
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
