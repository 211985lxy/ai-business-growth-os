/**
 * Trending Widget
 * 实时热点动态组件 - 在搜索模式空状态时展示最新热点
 * 自动加载 ai-news-radar 数据，无需用户输入关键词
 */

"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { useCallback, useEffect, useState } from "react";

interface TrendingItem {
  title: string;
  url: string;
  site: string;
  time?: string;
  score?: number;
  tags: string[];
}

interface TrendingData {
  total: number;
  articles: TrendingItem[];
  generated_at?: string;
}

interface TrendingWidgetProps {
  onSelectTopic?: (topic: string) => void;
}

export function TrendingWidget({ onSelectTopic }: TrendingWidgetProps) {
  const [data, setData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/news-radar?keyword=&limit=12");
      const json = await resp.json();
      if (json.error) {
        setError(json.error);
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">正在获取实时热点...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <MaterialIcon icon="cloud_off" size={24} className="text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">暂时无法获取热点数据</p>
        <button
          onClick={fetchTrending}
          className="text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white underline transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data || data.articles.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
            <MaterialIcon icon="trending_up" size={18} className="text-white dark:text-zinc-900" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">实时热点雷达</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              全网 {data.total} 条热点
              {data.generated_at &&
                ` · 更新于 ${new Date(data.generated_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchTrending}
          className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <MaterialIcon icon="refresh" size={14} />
          刷新
        </button>
      </div>

      {/* 热点列表 */}
      <div className="grid gap-3 md:grid-cols-2">
        {data.articles.map((item, i) => (
          <div
            key={i}
            className="group relative p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer"
            onClick={() => onSelectTopic?.(item.title)}
          >
            <div className="flex items-start gap-3">
              {/* 排名指示器 */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <span
                  className={`text-[11px] font-bold w-5 h-5 rounded flex items-center justify-center ${
                    i < 3
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {i + 1}
                </span>
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200 line-clamp-2 mb-1.5 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-snug">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                  <span className="flex items-center gap-0.5">
                    <MaterialIcon icon="language" size={10} />
                    {item.site}
                  </span>
                  {item.time && (
                    <span className="flex items-center gap-0.5">
                      <MaterialIcon icon="schedule" size={10} />
                      {new Date(item.time).toLocaleDateString("zh-CN", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                {/* 标签 */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag, ti) => (
                      <span
                        key={ti}
                        className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 潜力分 + 使用按钮 */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {item.score !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.score >= 85
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {item.score}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  点击选题
                  <MaterialIcon icon="arrow_forward" size={10} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="text-center pt-2">
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          💡 点击任意热点可直接作为选题 · 左侧搜索框可按关键词精准筛选
        </p>
      </div>
    </div>
  );
}
