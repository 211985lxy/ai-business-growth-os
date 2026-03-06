/**
 * Streaming Output Canvas
 * 右侧内容画布组件 - 简洁设计，直接显示内容
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/ui/markdown";
import { LoadingDots } from "@/components/ui/loading";
import { FileText } from "lucide-react";

interface StreamingOutputCanvasProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingOutputCanvas({
  content,
  isStreaming = false,
}: StreamingOutputCanvasProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [content]);

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="w-20 h-20 mb-6 rounded-2xl bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-sm">
          <FileText className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 dark:text-zinc-100 mb-2">AI 架构师已准备就绪</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 dark:text-zinc-300 max-w-md">
          在左侧填写战略参数或上传文档，AI 将为您生成专业的商业战略报告
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-4 select-text"
      style={{
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text",
        userSelect: "text",
      }}
    >
      {/* 内容区域 */}
      <div
        ref={contentRef}
        className="select-text"
        style={{
          WebkitUserSelect: "text",
          MozUserSelect: "text",
          msUserSelect: "text",
          userSelect: "text",
        }}
      >
        <Markdown content={content} className="markdown-content" />
      </div>

      {/* 加载指示器 */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 py-4">
          <LoadingDots />
          <span className="text-sm">正在生成中...</span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
