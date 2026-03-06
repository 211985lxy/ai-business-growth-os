/**
 * Citation Badge
 * 引用徽章 - 在 AI 输出中显示脚注引用 [1], [2]...
 */

interface CitationBadgeProps {
  number: number;
  onClick?: () => void;
  className?: string;
}

export function CitationBadge({ number, onClick, className = "" }: CitationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-4 h-4 text-[10px] font-mono font-semibold
        text-blue-400 hover:text-blue-300
        transition-colors
        ${onClick ? "cursor-pointer" : "cursor-default"}
        ${className}
      `}
      title={`查看引用来源 ${number}`}
    >
      [{number}]
    </button>
  );
}
