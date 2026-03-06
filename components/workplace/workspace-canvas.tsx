/**
 * L3: Workspace Canvas (主工作画布)
 * Flex-1, scrollable, max-width-[850px] centered
 */

"use client";

import { memo, useState } from "react";
import { Share2, Download, MoreVertical, Copy, Check, Pause, Play } from "lucide-react";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";

interface WorkspaceCanvasProps {
  documentId?: string;
}

export const WorkspaceCanvas = memo(function WorkspaceCanvas({ documentId }: WorkspaceCanvasProps) {
  const { content, isStreaming, isPaused, error, togglePause } = useApiStreaming();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="flex-1 h-screen bg-[#121212] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-12 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-slate-200 truncate max-w-[300px]">
            {content ? "战略分析报告" : "新建战略分析"}
          </h1>
          {isStreaming && !isPaused && (
            <span className="px-2 py-0.5 text-[11px] text-purple-400 bg-purple-500/10 rounded">
              生成中...
            </span>
          )}
          {isPaused && (
            <span className="px-2 py-0.5 text-[11px] text-amber-400 bg-amber-500/10 rounded">
              已暂停
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Pause/Resume Button - Show during streaming */}
          {isStreaming && (
            <button
              onClick={togglePause}
              className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
              title={isPaused ? "继续" : "暂停"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-green-400" />
              ) : (
                <Pause className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Copy & Share Buttons - Show when content exists */}
          {content && (
            <>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
                title={copied ? "已复制" : "复制"}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
              </button>
              <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                <Share2 className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
              <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                <Download className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
              <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[850px] mx-auto px-8 py-6">
          {error ? (
            <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center px-6">
              <div className="w-16 h-16 mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-sm font-medium text-red-300 mb-2">生成出错</h3>
              <p className="text-xs text-red-400 text-center max-w-sm break-all">{error}</p>
            </div>
          ) : content ? (
            <StreamingOutputCanvas content={content} isStreaming={isStreaming} />
          ) : (
            <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 mb-6 rounded-2xl bg-linear-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center border border-white/10">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">开始您的战略分析</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                在左侧填写业务描述和目标，AI 将为您生成专业的商业战略报告
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
});
