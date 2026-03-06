/**
 * Users Page - Coming Soon
 * 人道·用户
 *
 * 该模块正在建设中，敬请期待
 */

"use client";

import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-[#0D0D0D]">
      {/* 顶部导航栏 */}
      <div className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-white/2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-50 dark:group-hover:text-slate-300" />
          </button>
          <div className="p-2 bg-pink-500 rounded-lg">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 dark:text-slate-100">
              人道 · 用户
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">用户画像与增长策略</p>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-500/20 flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-pink-500 dark:text-pink-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 dark:text-slate-100 mb-3">
            该模块正在建设中
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 mb-8">敬请期待</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
