/**
 * Citation Card
 * 引用卡片 - 显示详细的引用来源信息
 */

interface CitationCardProps {
  number: number;
  fileName?: string;
  page?: number;
  content?: string;
  confidence?: number;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function CitationCard({
  number,
  fileName = "未知文件",
  page,
  content,
  confidence,
  isOpen = false,
  onClose,
  className = "",
}: CitationCardProps) {
  if (!isOpen) {
    return null;
  }

  const getConfidenceColor = () => {
    if (!confidence) return "bg-gray-600";
    if (confidence >= 0.8) return "bg-green-600";
    if (confidence >= 0.5) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getConfidenceText = () => {
    if (!confidence) return "未知";
    if (confidence >= 0.8) return "高置信";
    if (confidence >= 0.5) return "中等";
    return "低置信";
  };

  return (
    <div
      className={`
        absolute bottom-full left-0 mb-2 z-50
        w-80 p-3 rounded-lg
        bg-gray-900 border border-gray-700
        shadow-xl
        ${className}
      `}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* 引用编号 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-blue-400 font-mono text-sm font-semibold">[{number}]</span>
        <div className={`px-2 py-0.5 rounded-full ${getConfidenceColor()} text-[10px] text-white`}>
          {getConfidenceText()}
        </div>
      </div>

      {/* 文件名 */}
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span className="text-xs text-gray-300 font-medium truncate flex-1">{fileName}</span>
        {page && <span className="text-[10px] text-gray-500 font-mono">第 {page} 页</span>}
      </div>

      {/* 内容预览 */}
      {content && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="text-[11px] text-gray-400 leading-relaxed max-h-32 overflow-y-auto">
            {content}
          </div>
        </div>
      )}

      {/* 置信度条 */}
      {confidence && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">匹配度</span>
            <span className="text-[10px] text-gray-400 font-mono">
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full ${getConfidenceColor()}`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <p className="text-[10px] text-gray-500 italic">来源：企业内部知识库</p>
      </div>
    </div>
  );
}
