"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { useState } from "react";

interface SearchModeInputProps {
  isLoading: boolean;
  onSearch: (keyword: string) => void;
  onSelectTopic: (topic: string) => void;
}

export function SearchModeInput({ isLoading, onSearch, onSelectTopic }: SearchModeInputProps) {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = () => {
    if (!keyword.trim()) return;
    onSearch(keyword);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          发现全网爆款选题
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          输入您的行业或产品关键词，AI将为您挖掘最新的热门话题
        </p>
      </div>

      <div className="relative flex items-center group">
        <div className="absolute left-4 text-zinc-400 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors">
          <MaterialIcon icon="search" size={24} />
        </div>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          placeholder="例如：AI副业、护肤品测评、私域增长..."
          className="w-full pl-12 pr-32 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !keyword.trim()}
          className={`absolute right-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isLoading || !keyword.trim()
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              搜索中
            </div>
          ) : (
            "全网挖掘"
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-2">热门搜索：</span>
        {["AI变现", "小红书起号", "个人IP打造", "私域运营"].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setKeyword(tag);
              onSearch(tag);
            }}
            className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700/50"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
