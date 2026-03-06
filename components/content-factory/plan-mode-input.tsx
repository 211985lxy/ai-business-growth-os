"use client";

import { MaterialIcon } from "@/components/ui/material-icon";

interface PlanModeInputProps {
  isLoading: boolean;
}

export function PlanModeInput({ isLoading }: PlanModeInputProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">智能发布计划</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          基于历史数据为您生成最佳发布时间表
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
          <MaterialIcon icon="calendar_month" size={32} />
        </div>

        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">功能开发中</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          未来我们将支持根据您的账号画像，结合全网流量高峰时段，为您智能排期并一键发布到多个平台。
        </p>

        <div className="pt-6">
          <button
            disabled={true}
            className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            敬请期待
          </button>
        </div>
      </div>
    </div>
  );
}
