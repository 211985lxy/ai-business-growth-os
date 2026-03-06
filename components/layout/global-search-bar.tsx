"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchResult {
  content: Array<{
    id: string;
    type: string;
    title: string;
    preview: string;
    created_at: string;
    url: string;
  }>;
  knowledge: Array<{
    id: string;
    type: string;
    name: string;
    content: string;
    created_at: string;
    url: string;
  }>;
  navigation: Array<{
    title: string;
    path: string;
    icon: string;
  }>;
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "content" | "knowledge" | "navigation">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length === 0) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await response.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery("");
  };

  const getWorkflowTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      strategy_research: "战略研究",
      script_draft: "脚本草稿",
      script_critic: "脚本审核",
      script_refiner: "脚本优化",
      xhs_generator: "小红书",
    };
    return labels[type] || type;
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      persona: "人设",
      product_selling_points: "产品卖点",
      target_audience: "目标受众",
      writing_style: "写作风格",
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalResults = results
    ? results.content.length + results.knowledge.length + results.navigation.length
    : 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-10 px-4 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-3 shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors group cursor-pointer"
        title="全局搜索 (⌘K)"
      >
        <MaterialIcon
          icon="search"
          size={20}
          className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
        />
        <span className="text-sm text-zinc-500 dark:text-zinc-400 w-48 text-left hidden sm:block">
          搜索全站内容...
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded hidden sm:block">
          ⌘K
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            ref={modalRef}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <MaterialIcon icon="search" size={20} className="text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索内容、知识库或页面..."
                className="flex-1 bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none text-base"
              />
              {isLoading && (
                <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
              >
                <MaterialIcon icon="close" size={18} className="text-zinc-400" />
              </button>
            </div>

            {query.trim().length > 0 && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "all"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  全部 ({totalResults})
                </button>
                <button
                  onClick={() => setActiveTab("content")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "content"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  内容 ({results?.content.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "knowledge"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  知识库 ({results?.knowledge.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("navigation")}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === "navigation"
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  页面 ({results?.navigation.length || 0})
                </button>
              </div>
            )}

            <div className="max-h-[50vh] overflow-y-auto">
              {query.trim().length === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  <MaterialIcon icon="search" size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">输入关键词开始搜索</p>
                  <p className="text-xs mt-2 text-zinc-400">
                    支持搜索：已生成内容、知识库资产、页面导航
                  </p>
                </div>
              ) : totalResults === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  <MaterialIcon icon="search_off" size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">未找到相关结果</p>
                  <p className="text-xs mt-2 text-zinc-400">试试其他关键词</p>
                </div>
              ) : (
                <div className="py-2">
                  {(activeTab === "all" || activeTab === "navigation") &&
                    results?.navigation &&
                    results.navigation.length > 0 && (
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-zinc-400 mb-2">页面导航</p>
                        {results.navigation.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleNavigate(item.path)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                          >
                            <MaterialIcon
                              icon={item.icon as any}
                              size={18}
                              className="text-zinc-400"
                            />
                            <span className="text-zinc-700 dark:text-zinc-300">{item.title}</span>
                            <MaterialIcon
                              icon="chevron_right"
                              size={16}
                              className="ml-auto text-zinc-400"
                            />
                          </button>
                        ))}
                      </div>
                    )}

                  {(activeTab === "all" || activeTab === "content") &&
                    results?.content &&
                    results.content.length > 0 && (
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-zinc-400 mb-2">已生成内容</p>
                        {results.content.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.url)}
                            className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                          >
                            <MaterialIcon
                              icon="description"
                              size={18}
                              className="text-zinc-400 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                                  {item.title}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
                                  {getWorkflowTypeLabel(item.type)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {item.preview}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatDate(item.created_at)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {(activeTab === "all" || activeTab === "knowledge") &&
                    results?.knowledge &&
                    results.knowledge.length > 0 && (
                      <div className="px-4 py-2">
                        <p className="text-xs font-medium text-zinc-400 mb-2">知识库资产</p>
                        {results.knowledge.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleNavigate(item.url)}
                            className="w-full flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left"
                          >
                            <MaterialIcon
                              icon="auto_awesome"
                              size={18}
                              className="text-zinc-400 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                                  {item.name}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded">
                                  {getAssetTypeLabel(item.type)}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 truncate mt-0.5">
                                {item.content}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↵</kbd> 确认
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">↑↓</kbd> 导航
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">esc</kbd> 关闭
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
