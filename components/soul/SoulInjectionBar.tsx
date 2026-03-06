/**
 * Soul Injection Bar
 * 显示当前激活的企业灵魂状态
 * 位于输入框上方，展示知识库激活情况
 */

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface SoulInjectionBarProps {
  companyName?: string;
  activeFileCount?: number;
  totalFileCount?: number;
  version?: string;
  className?: string;
}

export function SoulInjectionBar({
  companyName = "您的企业",
  activeFileCount = 0,
  totalFileCount = 0,
  version = "v2.1",
  className = "",
}: SoulInjectionBarProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // 当文件数量变化时触发脉冲动画
  useEffect(() => {
    setIsPulsing(true);
    const timer = setTimeout(() => setIsPulsing(false), 2000);
    return () => clearTimeout(timer);
  }, [activeFileCount]);

  const getStatusColor = () => {
    if (activeFileCount === 0) return "bg-gray-600";
    if (activeFileCount < totalFileCount * 0.5) return "bg-yellow-600";
    return "bg-blue-600";
  };

  const getStatusText = () => {
    if (activeFileCount === 0) return "待注入";
    if (activeFileCount < totalFileCount) return "部分激活";
    return "已激活";
  };

  return (
    <div
      className={`border-b border-gray-800 p-3 font-mono text-xs ${className} ${
        isPulsing ? "animate-pulse" : ""
      }`}
    >
      {/* 状态指示 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 uppercase tracking-wider">CORE ASSETS</span>
          <Badge variant={activeFileCount > 0 ? "default" : "secondary"} className="text-[10px]">
            {getStatusText()}
          </Badge>
        </div>
        <span className="text-blue-500 font-semibold">
          {activeFileCount} / {totalFileCount} 份文档
        </span>
      </div>

      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-900 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getStatusColor()}`}
            style={{
              width: `${totalFileCount > 0 ? (activeFileCount / totalFileCount) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="text-gray-600 text-[10px]">
          {totalFileCount > 0 ? Math.round((activeFileCount / totalFileCount) * 100) : 0}%
        </span>
      </div>

      {/* 激活提示 */}
      {activeFileCount > 0 && (
        <div className="mt-2 text-[10px] text-gray-600 flex items-center gap-1">
          <svg
            className="w-3 h-3 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>
            当前已激活：[{companyName}] 战略大脑 {version}（基于 {activeFileCount} 份核心文档）
          </span>
        </div>
      )}
    </div>
  );
}
