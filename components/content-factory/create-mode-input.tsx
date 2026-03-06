"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { useState } from "react";
import type { CreateModeInput as CreateModeInputType } from "@/types/content-factory";

interface CreateModeInputProps {
  isLoading: boolean;
  onSubmit: (input: CreateModeInputType) => void;
  onWenmaiSubmit?: (input: { identity?: string; topic: string; coreDraft?: string; extraContext?: string }) => void;
}

export function CreateModeInput({ isLoading, onSubmit, onWenmaiSubmit }: CreateModeInputProps) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState<"爆款短视频" | "高赞图文" | "神韵文脉长文" | "wenmai" | string>("爆款短视频");
  const [subType] = useState("口播脚本");
  const [identity, setIdentity] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [coreDraft, setCoreDraft] = useState("");

  // 文脉模式
  const isWenmai = category === "神韵文脉长文";

  const handleSubmit = () => {
    if (!topic.trim()) return;

    if (isWenmai && onWenmaiSubmit) {
      onWenmaiSubmit({
        identity,
        topic,
        coreDraft,
        extraContext
      });
      return;
    }

    onSubmit({
      category: category as any,
      sub_type: subType,
      topic,
      identity,
      brand_voice: brandVoice,
      extra_context: extraContext,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* 模式选择 */}
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-fit">
        <button
          onClick={() => setCategory("爆款短视频")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            category === "爆款短视频"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          爆款短视频
        </button>
        <button
          onClick={() => setCategory("高赞图文")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            category === "高赞图文"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          高赞图文
        </button>
        <button
          onClick={() => setCategory("神韵文脉长文")}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
            category === "神韵文脉长文"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-purple-600 dark:text-purple-400"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          <MaterialIcon icon="auto_awesome" size={14} />
          神韵文脉长文
        </button>
      </div>

      {/* 核心话题 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">核心话题 / 主题</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：如何使用AI工具提升工作效率..."
          className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
        />
      </div>

      {isWenmai ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">主稿内容（选填）</label>
            <textarea
              value={coreDraft}
              onChange={(e) => setCoreDraft(e.target.value)}
              placeholder="请在此粘贴神韵生成的深度长文，或者输入你想发布的想法或素材..."
              rows={5}
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-shadow resize-none"
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">人设 / 身份</label>
            <input
              type="text"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="例如：资深增长黑客"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">品牌调性</label>
            <input
              type="text"
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="例如：专业、干练、接地气"
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">附加要求（选填）</label>
        <textarea
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          placeholder="任何额外的要求、格式限制或参考资料..."
          rows={3}
          className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-shadow resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !topic.trim()}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            isLoading || !topic.trim()
              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
              : isWenmai
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              正在生成...
            </>
          ) : (
            <>
              <MaterialIcon icon="auto_awesome" size={16} />
              {isWenmai ? "生成神韵长文" : "开始智能创作"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
