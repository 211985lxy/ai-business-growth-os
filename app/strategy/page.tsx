/**
 * Strategy Generator Page - Three-Tier Architecture
 * 天道 · 战略 - 麦肯锡式商业咨询
 *
 * Architecture:
 * - L1: GlobalNav (72px) - Global navigation (in layout.tsx)
 * - L2: Module Panel (280px, #F9FAFB) - History + actions
 * - L3: Core Canvas (flex-1, #FFFFFF) - Input (400px) + Output (flex-1)
 *
 * Features:
 * - History records from Supabase
 * - Streaming AI generation with pause functionality
 * - Feishu-style color hierarchy
 */

"use client";

import { AgentLayout } from "@/components/business/agent-layout";
import { StrategyHistory } from "@/components/business/strategy-history";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { MaterialIcon } from "@/components/ui/material-icon";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext, saveStrategyContextWithOutput } from "@/lib/strategy-context";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface AdvancedParams {
  revenueGoal: string;
  founderStory: string;
  strengths: string[];
  generateIpStrategy?: boolean;
}

interface ExampleQuestion {
  id: number;
  text: string;
  category: string;
}

// ============================================================================
// DATA
// ============================================================================

const exampleQuestions: ExampleQuestion[] = [
  {
    id: 1,
    text: "我是做美业培训的，想打造个人IP，年营收目标100万，应该如何制定战略？",
    category: "IP打造",
  },
  {
    id: 2,
    text: "我有10年餐饮供应链经验，想转型做B2B服务平台，核心优势是仓储和配送",
    category: "B2B转型",
  },
  {
    id: 3,
    text: "我的瑜伽馆开了3年，客户复购率很低，想建立私域流量体系",
    category: "私域运营",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function StrategyPage() {
  const { content, isStreaming, isPaused, startStreaming, togglePause, error, reset } =
    useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const [strategySaved, setStrategySaved] = useState(false);
  const [question, setQuestion] = useState("");
  const [advancedParams, setAdvancedParams] = useState<AdvancedParams>({
    revenueGoal: "",
    founderStory: "",
    strengths: [],
    generateIpStrategy: true,
  });
  const [strengthInput, setStrengthInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [historyContent, setHistoryContent] = useState<string | null>(null);

  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 检查是否有已保存的战略
  useEffect(() => {
    const checkSavedStrategy = async () => {
      const context = await getActiveStrategyContext();
      setStrategySaved(!!context);
    };
    checkSavedStrategy();
  }, []);

  // 当流式响应完成时，自动保存完整上下文
  useEffect(() => {
    const saveCompleteStrategy = async () => {
      if (!isStreaming && content && question.trim()) {
        const nicheMatch = content.match(/赛道[：:]\s*([^\n]+)/);
        const niche = nicheMatch ? nicheMatch[1].trim() : question.slice(0, 50);

        const contextData = {
          niche,
          revenue_goal: advancedParams.revenueGoal,
          founder_story: advancedParams.founderStory,
          strengths: advancedParams.strengths,
          output_content: content,
        };

        try {
          const contextId = await saveStrategyContextWithOutput(contextData);
          if (contextId) {
            setStrategySaved(true);
          }
        } catch (error) {
          console.error("❌ 保存失败:", error);
        }
      }
    };

    saveCompleteStrategy();
  }, [
    isStreaming,
    content,
    question,
    advancedParams.revenueGoal,
    advancedParams.founderStory,
    advancedParams.strengths,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);

    try {
      await startStreaming("/api/strategy", {
        niche: question,
        revenueGoal: advancedParams.revenueGoal || undefined,
        founderStory: advancedParams.founderStory || undefined,
        strengths: advancedParams.strengths || undefined,
        generateIpStrategy: advancedParams.generateIpStrategy,
      });
    } finally {
      setIsLoading(false);
    }
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

  const removeStrength = (strength: string) => {
    setAdvancedParams({
      ...advancedParams,
      strengths: advancedParams.strengths.filter((s) => s !== strength),
    });
  };

  const selectExample = (example: ExampleQuestion) => {
    setQuestion(example.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleLoadHistory = (historyContent: string) => {
    setHistoryContent(historyContent);
  };

  const handleNew = () => {
    reset();
    setQuestion("");
    setHistoryContent(null);
    setAdvancedParams({
      revenueGoal: "",
      founderStory: "",
      strengths: [],
    generateIpStrategy: true,
  });
  };

  return (
    <AgentLayout
      agentId="strategy"
      title="天道 · 战略"
      subtitle="AI 商业战略生成"
      icon={<MaterialIcon icon="lightbulb" size={24} className="text-white" />}
      accentColor="indigo"
      isStreaming={isStreaming}
      content={content}
      historyContent={historyContent}
      isPaused={isPaused}
      error={error}
      hasSavedRecord={strategySaved}
      onTogglePause={togglePause}
      onNew={handleNew}
      onNavigateNext={() => router.push("/content-factory")}
      historyComponent={<StrategyHistory onLoadRecord={handleLoadHistory} />}
      emptyStateComponent={
        <>
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
            <MaterialIcon icon="lightbulb" size={32} className="text-indigo-500" />
          </div>
          <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 dark:text-zinc-100 mb-2">AI 架构师已准备就绪</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md leading-relaxed">
            运用麦肯锡、波特五力等战略分析框架，为你的业务生成完整的商业战略总纲
          </p>
        </>
      }
      outputComponent={
        <StreamingOutputCanvas content={historyContent || content} isStreaming={isStreaming} />
      }
      inputComponent={
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 主输入框 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              赛道/行业描述 <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              ref={textareaRef}
              placeholder="描述你的业务和目标，例如：&#10;&#10;我是做美业培训的，主要服务二三线城市的女性创业者，帮助她们建立个人品牌和标准化服务流程..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              rows={6}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-y transition-all duration-200"
              style={{ minHeight: "120px", maxHeight: "200px" }}
            />
          </div>

          {/* 高级参数折叠区 */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300 hover:text-zinc-900 dark:text-zinc-50 transition-colors duration-200"
            >
              {showAdvanced ? (
                <MaterialIcon icon="expand_less" size={16} />
              ) : (
                <MaterialIcon icon="expand_more" size={16} />
              )}
              高级参数（可选）
            </button>

            {showAdvanced && (
              <div className="space-y-3 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">营收目标</label>
                  <input
                    type="text"
                    placeholder="例如：年营收 100 万"
                    value={advancedParams.revenueGoal}
                    onChange={(e) =>
                      setAdvancedParams({ ...advancedParams, revenueGoal: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">创始人故事</label>
                  <textarea
                    placeholder="例如：我曾经也是这个行业的从业者，深知创业的艰辛..."
                    value={advancedParams.founderStory}
                    onChange={(e) =>
                      setAdvancedParams({ ...advancedParams, founderStory: e.target.value })
                    }
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">核心优势</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="例如：10年行业经验"
                      value={strengthInput}
                      onChange={(e) => setStrengthInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addStrength())}
                      disabled={isLoading}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={addStrength}
                      disabled={isLoading}
                      className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800/50 transition-all duration-200"
                    >
                      添加
                    </button>
                  </div>
                  {advancedParams.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {advancedParams.strengths.map((strength) => (
                        <span
                          key={strength}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-200"
                        >
                          {strength}
                          <button
                            type="button"
                            onClick={() => removeStrength(strength)}
                            className="hover:text-red-600 transition-colors duration-200 ml-0.5"
                            disabled={isLoading}
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

          {/* 示例问题卡片 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">示例问题</p>
            <div className="space-y-2">
              {exampleQuestions.map((example) => (
                <div
                  key={example.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => !isLoading && selectExample(example)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                      e.preventDefault();
                      selectExample(example);
                    }
                  }}
                  className={cn(
                    "w-full text-left p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all duration-200 select-text cursor-pointer",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{example.category}</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-200 line-clamp-2">{example.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-200 dark:bg-zinc-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && !isPaused ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                正在分析...
              </>
            ) : isLoading && isPaused ? (
              <>
                <MaterialIcon icon="pause" size={16} />
                已暂停 - 点击继续
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成战略总纲
              </>
            )}
          </button>
        </form>
      }
    />
  );
}
