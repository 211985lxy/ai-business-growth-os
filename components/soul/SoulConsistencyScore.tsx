/**
 * Soul Consistency Score
 * 灵魂一致性评分 - 显示 AI 建议与企业 SOP 的契合程度
 */

interface SoulConsistencyScoreProps {
  score?: number; // 0-100
  className?: string;
  showLabel?: boolean;
}

export function SoulConsistencyScore({
  score = 0,
  className = "",
  showLabel = true,
}: SoulConsistencyScoreProps) {
  const getScoreColor = () => {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = () => {
    if (score >= 90) return "高度一致";
    if (score >= 70) return "基本一致";
    if (score >= 50) return "部分一致";
    return "低一致性";
  };

  const getIcon = () => {
    if (score >= 90)
      return (
        <svg
          className="w-4 h-4 text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    if (score >= 70)
      return (
        <svg
          className="w-4 h-4 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    if (score >= 50)
      return (
        <svg
          className="w-4 h-4 text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    return (
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 图标 */}
      <div className="flex items-center justify-center">{getIcon()}</div>

      {/* 分数 */}
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-bold font-mono ${getScoreColor()}`}>{score}</span>
        <span className="text-gray-500 text-xs">%</span>
      </div>

      {/* 标签 */}
      {showLabel && (
        <span className={`text-xs font-medium ${getScoreColor()}`}>{getScoreLabel()}</span>
      )}

      {/* 进度条 */}
      <div className="flex-1 bg-gray-900 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            score >= 90
              ? "bg-green-600"
              : score >= 70
                ? "bg-blue-600"
                : score >= 50
                  ? "bg-yellow-600"
                  : "bg-red-600"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
