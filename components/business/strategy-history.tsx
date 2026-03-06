/**
 * Strategy History Component - Google AI Studio Style
 * 战略历史记录列表 - Google AI Studio 风格
 *
 * Features:
 * - Grouped layout: New Strategy button + Recent (5 items) + View All link
 * - Hover interaction: "..." more button appears on hover
 * - Active state: bg-zinc-100 with darker text
 * - Reads from strategy_contexts table (correct data source)
 * - Falls back to localStorage for unauthenticated users
 * - Supports delete for logged-in users
 */

import { MaterialIcon } from "@/components/ui/material-icon";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface HistoryRecord {
  id: string;
  created_at: string;
  output_content: string;
  niche: string;
  source: "supabase" | "local";
}

interface StrategyHistoryProps {
  onLoadRecord: (content: string) => void;
  currentRecordId?: string;
}

const STORAGE_KEY = "strategy_history";

/**
 * Load history from localStorage (fallback for unauthenticated users)
 */
function loadLocalHistory(): HistoryRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load local history:", error);
    return [];
  }
}

/**
 * Delete record from localStorage
 */
function deleteFromLocalHistory(id: string): void {
  try {
    const history = loadLocalHistory();
    const updated = history.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete from local history:", error);
  }
}

export function StrategyHistory({ onLoadRecord, currentRecordId }: StrategyHistoryProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 根据搜索查询过滤记录
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = records.filter(
        (record) =>
          record.niche.toLowerCase().includes(query) ||
          record.output_content.toLowerCase().includes(query)
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(records);
    }
  }, [searchQuery, records]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Logged in: load from Supabase
          setIsAuthenticated(true);

          const { data, error } = await supabase
            .from("strategy_contexts")
            .select("id, created_at, output_content, niche")
            .eq("user_id", user.id)
            .not("output_content", "is", null)
            .order("created_at", { ascending: false })
            .limit(5);

          if (error) throw error;

          // Transform data to HistoryRecord format
          const transformed = (data || []).map((record: any) => ({
            id: record.id,
            created_at: record.created_at,
            output_content: record.output_content || "",
            niche: record.niche,
            source: "supabase" as const,
          }));

          setRecords(transformed);
        } else {
          // Not logged in: load from localStorage
          setIsAuthenticated(false);
          const localHistory = loadLocalHistory();
          setRecords(localHistory.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load history:", error);
        // Fallback to localStorage on error
        const localHistory = loadLocalHistory();
        setRecords(localHistory.slice(0, 5));
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDelete = async (id: string, source: "supabase" | "local") => {
    try {
      if (source === "supabase" && isAuthenticated) {
        // Delete from Supabase
        const supabase = createClient();
        const { error } = await supabase.from("strategy_contexts").delete().eq("id", id);

        if (error) throw error;
      } else {
        // Delete from localStorage
        deleteFromLocalHistory(id);
      }

      // Update local state
      setRecords(records.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  const truncateTitle = (title: string, maxLength: number = 28) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col h-full select-text">
      {/* 全局搜索框 */}
      <div className="mb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-500 dark:text-zinc-400 transition-all duration-200"
          />
          <MaterialIcon
            icon="search"
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 pointer-events-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:text-zinc-300 transition-colors duration-150"
            >
              <MaterialIcon icon="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 中间：最近 的组 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {searchQuery ? `搜索结果 (${filteredRecords.length})` : "最近"}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 px-3">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-zinc-100 flex items-center justify-center">
              <MaterialIcon
                icon="description"
                size={20}
                className="text-zinc-500 dark:text-zinc-400"
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? "没有找到匹配的历史记录"
                : isAuthenticated
                  ? "暂无历史记录"
                  : "生成战略后将保存在本地"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRecords.map((record) => {
              const isActive = record.id === currentRecordId;

              return (
                <div
                  key={record.id}
                  className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive ? "bg-zinc-100" : "hover:bg-zinc-50"
                  }`}
                  onClick={() => onLoadRecord(record.output_content || "")}
                >
                  {/* 文档图标 */}
                  <div
                    className={`shrink-0 w-7 h-7 rounded flex items-center justify-center transition-colors duration-150 ${
                      isActive ? "bg-indigo-100" : "bg-zinc-200 group-hover:bg-zinc-300"
                    }`}
                  >
                    <MaterialIcon
                      icon="description"
                      size={14}
                      className="text-zinc-600 dark:text-zinc-300"
                    />
                  </div>

                  {/* 标题和日期 */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium truncate transition-colors duration-150 ${
                        isActive
                          ? "text-zinc-900 dark:text-zinc-50"
                          : "text-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {truncateTitle(record.niche)}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {formatDate(record.created_at)}
                    </p>
                  </div>

                  {/* Hover 时显示的删除按钮 */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(record.id, record.source);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 -mr-1.5 hover:bg-white rounded transition-all duration-150"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 底部：查看所有历史记录 */}
      {records.length > 0 && (
        <div className="pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-800">
          <button
            className="w-full py-2 px-3 text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 rounded-lg transition-all duration-150 flex items-center justify-center gap-1.5 group"
            onClick={() => {
              // TODO: 导航到全屏历史管理页面
              console.log("Navigate to full history view");
            }}
          >
            查看所有历史记录
            <MaterialIcon
              icon="arrow_forward"
              size={14}
              className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-300 transition-colors duration-150"
            />
          </button>
        </div>
      )}
    </div>
  );
}
