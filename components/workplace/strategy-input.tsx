/**
 * Strategy Input Panel
 * Middle panel for strategy generation input
 */

"use client";

import { memo, useState, useRef, FormEvent } from "react";
import { ChevronDown, ChevronUp, Sparkles, Send, Loader2, Pause, Play } from "lucide-react";
import { useApiStreaming } from "@/hooks/use-api-streaming";

interface AdvancedParams {
  revenueGoal: string;
  founderStory: string;
  strengths: string[];
}

export const StrategyInput = memo(function StrategyInput() {
  const { content, isStreaming, isPaused, startStreaming, togglePause, error } = useApiStreaming();
  const [question, setQuestion] = useState("");
  const [advancedParams, setAdvancedParams] = useState<AdvancedParams>({
    revenueGoal: "",
    founderStory: "",
    strengths: [],
  });
  const [strengthInput, setStrengthInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    await startStreaming("/api/strategy", {
      niche: question,
      revenueGoal: advancedParams.revenueGoal || undefined,
      founderStory: advancedParams.founderStory || undefined,
      strengths: advancedParams.strengths || undefined,
    });
  };

  const addStrength = () => {
    if (strengthInput.trim() && !advancedParams.strengths.includes(strengthInput.trim())) {
      setAdvancedParams({
        ...advancedParams,
        strengths: [...advancedParams.strengths, strengthInput.trim()],
      });
      setStrengthInput("");
    }
  };

  const removeStrength = (index: number) => {
    setAdvancedParams({
      ...advancedParams,
      strengths: advancedParams.strengths.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="w-[400px] h-screen bg-[#0D0D0D] flex flex-col border-r border-white/5">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-sm font-medium text-slate-200">战略生成</h2>
        </div>
      </div>

      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              业务描述 <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              ref={textareaRef}
              placeholder="描述你的业务和目标，例如：&#10;&#10;我是做美业培训的，主要服务二三线城市的女性创业者，帮助她们建立个人品牌和标准化服务流程..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isStreaming}
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all resize-y"
            />
          </div>

          {/* Advanced Parameters */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-300 transition-colors"
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>收起高级参数</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>展开高级参数</span>
                </>
              )}
            </button>

            {showAdvanced && (
              <div className="space-y-4 animate-in slide-in-from-top">
                {/* Revenue Goal */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 block">年营收目标</label>
                  <input
                    type="text"
                    placeholder="例如：100万、500万"
                    value={advancedParams.revenueGoal}
                    onChange={(e) =>
                      setAdvancedParams({ ...advancedParams, revenueGoal: e.target.value })
                    }
                    disabled={isStreaming}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                  />
                </div>

                {/* Founder Story */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 block">创始人故事</label>
                  <textarea
                    placeholder="分享你的创业经历和背景..."
                    value={advancedParams.founderStory}
                    onChange={(e) =>
                      setAdvancedParams({ ...advancedParams, founderStory: e.target.value })
                    }
                    disabled={isStreaming}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all resize-y"
                  />
                </div>

                {/* Strengths */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 block">核心优势</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="输入优势后按回车添加"
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addStrength()}
                      disabled={isStreaming}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addStrength}
                      disabled={isStreaming}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-xs rounded-lg transition-colors"
                    >
                      添加
                    </button>
                  </div>
                  {advancedParams.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {advancedParams.strengths.map((strength, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                        >
                          {strength}
                          <button
                            type="button"
                            onClick={() => removeStrength(index)}
                            className="hover:text-purple-200 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isStreaming || !question.trim()}
            className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>生成战略报告</span>
              </>
            )}
          </button>

          {/* Pause/Resume Button - Only show during streaming */}
          {isStreaming && (
            <button
              type="button"
              onClick={togglePause}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>继续生成</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>暂停生成</span>
                </>
              )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 break-all">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
});
