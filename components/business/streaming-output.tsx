/**
 * Streaming Output Panel
 * Right panel component that displays AI-generated content
 * Lobe Chat styled with Markdown rendering and loading states
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingDots } from "@/components/ui/loading";
import { Markdown } from "@/components/ui/markdown";
import { Separator } from "@/components/ui/separator";
import { ContentSkeleton } from "@/components/ui/skeletons";
import { Copy, Download, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StreamingOutputProps {
  title?: string;
  content: string;
  thinkingProcess?: string;
  iterationCount?: number;
  qualityScore?: number;
  isStreaming?: boolean;
  onCopy?: () => void;
  onDownload?: () => void;
}

export function StreamingOutput({
  title = "AI Output",
  content,
  thinkingProcess,
  iterationCount,
  qualityScore,
  isStreaming = false,
  onCopy,
  onDownload,
}: StreamingOutputProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Display content immediately for streaming (no typewriter for real-time feel)
  useEffect(() => {
    setDisplayedContent(content);
  }, [content]);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedContent]);

  // Handle copy
  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(content);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-slate-50 to-blue-50/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <div className="p-2 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">{title}</span>
            {isStreaming && (
              <Badge variant="info" className="gap-1.5 ml-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                生成中
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {iterationCount !== undefined && iterationCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-linear-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
              >
                v{iterationCount}
              </Badge>
            )}
            {qualityScore !== undefined && (
              <Badge
                variant={qualityScore >= 80 ? "success" : "warning"}
                className={
                  qualityScore >= 80
                    ? "bg-green-100 text-green-700 border-0"
                    : "bg-amber-100 text-amber-700 border-0"
                }
              >
                {qualityScore}% 质量
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex-1 rounded-lg hover:bg-white/80 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:border-zinc-800"
          >
            <Copy className="h-4 w-4 mr-1.5" />
            {copied ? "已复制！" : "复制"}
          </Button>
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="flex-1 rounded-lg hover:bg-white/80 transition-all duration-200 border border-transparent hover:border-zinc-200 dark:border-zinc-800"
            >
              <Download className="h-4 w-4 mr-1.5" />
              下载
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 relative bg-linear-to-br from-white to-slate-50/30">
        {displayedContent ? (
          <div ref={contentRef}>
            <Markdown content={displayedContent} className="markdown-content" />
            {isStreaming && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <LoadingDots />
                <span className="text-sm">继续生成中...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            {isStreaming ? (
              <div className="text-center space-y-4">
                <ContentSkeleton />
              </div>
            ) : (
              <div className="text-center space-y-4 text-muted-foreground p-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-sm">
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
                <p className="font-semibold text-lg text-zinc-700 dark:text-zinc-200">
                  AI 架构师已准备就绪
                </p>
                <p className="text-sm max-w-sm mx-auto leading-relaxed">
                  👈 请在左侧输入关键信息，AI 将为您生成专业的商业战略报告
                </p>
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </CardContent>

      {thinkingProcess && (
        <>
          <Separator />
          <div className="p-5 bg-linear-to-r from-amber-50 to-orange-50 border-t border-amber-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowThinking(!showThinking)}
              className="w-full justify-start rounded-lg hover:bg-white/80 transition-all duration-200"
            >
              {showThinking ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  隐藏审稿人反馈
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  显示审稿人反馈
                </>
              )}
            </Button>
            {showThinking && (
              <div className="mt-4 p-5 bg-white rounded-xl border border-amber-200 shadow-sm">
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Badge variant="warning" className="bg-amber-100 text-amber-700 border-0 text-xs">
                    AI 审稿人
                  </Badge>
                  反馈意见：
                </p>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
                  {thinkingProcess}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
