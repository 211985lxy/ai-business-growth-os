/**
 * Knowledge Retrieval Indicator
 * 知识库检索指示器 - 当触发知识库检索时显示微弱的脉冲动画
 */

import { useEffect, useState } from "react";

interface KnowledgeRetrievalIndicatorProps {
  isRetrieving?: boolean;
  className?: string;
}

export function KnowledgeRetrievalIndicator({
  isRetrieving = false,
  className = "",
}: KnowledgeRetrievalIndicatorProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isRetrieving) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRetrieving]);

  if (!isActive && !isRetrieving) {
    return null;
  }

  return (
    <div
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-md
        bg-gradient-to-r from-blue-500/10 to-purple-500/10
        border border-blue-500/20
        ${className}
      `}
    >
      {/* 脉冲圆圈 */}
      <div className="relative">
        <div
          className={`
            w-2 h-2 rounded-full bg-blue-500
            ${isRetrieving ? "animate-ping" : ""}
          `}
        />
        {isRetrieving && <div className="absolute inset-0 w-2 h-2 rounded-full bg-blue-500/30" />}
      </div>

      {/* 文本 */}
      <span className="text-xs text-blue-400 font-mono">
        {isRetrieving ? "灵魂检索中..." : "检索完成"}
      </span>
    </div>
  );
}
