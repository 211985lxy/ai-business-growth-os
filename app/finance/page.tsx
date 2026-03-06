/**
 * Finance Page - New Agent Layout
 * 财道·财务 (Wealth - Finance)
 * 测算投资回报、日常营收与成本结构。
 *
 * Design: 黄金 (Gold) 极简风格，财富、稳健。
 */

"use client";

import { AgentLayout } from "@/components/business/agent-layout";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext } from "@/lib/strategy-context";
import { cn } from "@/lib/utils";
import {
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  LineChart,
  PieChart,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type FinanceModule = "roi" | "cashflow" | "cost-structure";

interface StrategyContext {
  niche: string;
  revenueGoal?: string;
  founderStory?: string;
  strengths?: string[];
  outputContent?: string;
  generatedAt: string;
}

interface ExamplePrompt {
  id: number;
  text: string;
  category: string;
  financeModule: FinanceModule;
}

// ============================================================================
// DATA
// ============================================================================

const FINANCE_MODULES = [
  {
    value: "roi",
    label: "投资回报测算 (ROI)",
    icon: <LineChart className="w-5 h-5 text-yellow-500" />,
    description: "回本周期、投入产出比",
    color: "yellow",
  },
  {
    value: "cashflow",
    label: "现金流规划",
    icon: <Calculator className="w-5 h-5 text-amber-500" />,
    description: "日常营运资金、风险备用金",
    color: "amber",
  },
  {
    value: "cost-structure",
    label: "成本利润模型",
    icon: <PieChart className="w-5 h-5 text-orange-500" />,
    description: "固定成本、变动成本、毛利率",
    color: "orange",
  },
] as const;

const examplePrompts: ExamplePrompt[] = [
  {
    id: 1,
    text: "我想开一家社区咖啡店，前期投入大概30万，帮我测算一下单月盈利目标和回本周期",
    category: "回报测算",
    financeModule: "roi",
  },
  {
    id: 2,
    text: "我们是一个5人的小型代运营工作室，帮我规划一下日常账目的现金流管理标准",
    category: "现金流管理",
    financeModule: "cashflow",
  },
  {
    id: 3,
    text: "拆解一下做同城家政保洁的成本结构，怎么定价才能保证合理的毛利率？",
    category: "成本模型",
    financeModule: "cost-structure",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function FinanceContent() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 读取战略上下文
  const [strategyContext, setStrategyContext] = useState<StrategyContext | null>(null);

  // 表单状态
  const [financeModule, setFinanceModule] = useState<FinanceModule>("roi");
  const [currentCapital, setCurrentCapital] = useState("");
  const [financeDetails, setFinanceDetails] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const loadStrategyContext = async () => {
      const context = await getActiveStrategyContext();
      if (context) {
        setStrategyContext({
          niche: context.niche,
          revenueGoal: context.revenue_goal || undefined,
          founderStory: context.founder_story || undefined,
          strengths: context.strengths || undefined,
          outputContent: context.output_content || undefined,
          generatedAt: context.created_at,
        });
      }
    };
    loadStrategyContext();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyContext) return;

    setIsLoading(true);
    try {
      await startStreaming("/api/finance", {
        // 战略参数
        niche: strategyContext.niche,
        revenueGoal: strategyContext.revenueGoal,
        founderStory: strategyContext.founderStory,
        strengths: strategyContext.strengths,

        // 财务参数
        financeModule,
        currentCapital,
        financeDetails,
      });
    } catch (error) {
      console.error("生成财务规划失败:", error);
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExample = (example: ExamplePrompt) => {
    setFinanceModule(example.financeModule);
    setCurrentCapital("");
    setFinanceDetails(example.text);
  };

  const selectedFinanceModule =
    FINANCE_MODULES.find((t) => t.value === financeModule) || FINANCE_MODULES[0];

  return (
    <AgentLayout
      agentId="finance"
      title="财道 · 财务"
      subtitle="AI 成本测算与盈利规划"
      icon={<LineChart className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />}
      accentColor="yellow"
      isStreaming={isStreaming}
      content={content}
      historyContent={null}
      hasSavedRecord={!!strategyContext}
      error={null}
      onNavigateNext={undefined}
      historyComponent={
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 text-xs py-8">
          暂无历史记录
        </div>
      }
      emptyStateComponent={
        !strategyContext ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-yellow-50/80 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">需要战略总纲</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              财务测算需要基于战略总纲，请先前往「天道·战略」生成商业战略
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-yellow-50/80 flex items-center justify-center mb-4">
              <LineChart className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">测算引擎已就绪</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              在左侧输入您的启动资金或财务困惑，我将为您建立清晰的账本结构。
            </p>
          </div>
        )
      }
      outputComponent={<StreamingOutputCanvas content={content} isStreaming={isStreaming} />}
      inputComponent={
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 战略上下文状态 */}
          {strategyContext ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-50/50 rounded-xl border border-yellow-200">
              <Compass className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">已预装战略总纲</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">赛道：{strategyContext.niche}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <Compass className="w-5 h-5 text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">需要战略总纲</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">请先前往「天道·战略」生成商业战略</p>
                <button
                  type="button"
                  onClick={() => router.push("/strategy")}
                  className="text-xs text-yellow-600 hover:underline"
                >
                  前往生成 →
                </button>
              </div>
            </div>
          )}

          {/* 测算模块选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              测算模块 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {FINANCE_MODULES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFinanceModule(type.value as FinanceModule)}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200",
                    financeModule === type.value
                      ? "bg-yellow-50/50 border-yellow-400"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-yellow-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{type.label}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">{type.description}</p>
                      </div>
                    </div>
                    {financeModule === type.value && <Check className="w-4 h-4 text-yellow-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 高级参数折叠区 */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300 hover:text-zinc-900 dark:text-zinc-50 transition-colors duration-200"
            >
              {showAdvanced ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              详情补充（可选）
            </button>

            {showAdvanced && (
              <div className="space-y-3 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* 资金情况 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
                    目前准备的启动资金/月流水
                  </label>
                  <input
                    type="text"
                    placeholder="例如：准备了50万启动资金..."
                    value={currentCapital}
                    onChange={(e) => setCurrentCapital(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-yellow-500/50 transition-all duration-200"
                  />
                </div>

                {/* 补充说明 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">核心痛点或具体诉求</label>
                  <textarea
                    placeholder="例如：每个月感觉都在赚钱，但年底一看银行卡没钱..."
                    value={financeDetails}
                    onChange={(e) => setFinanceDetails(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-yellow-500/50 resize-none transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 示例提示卡片 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">灵感库：</p>
            <div className="space-y-2">
              {examplePrompts.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => selectExample(example)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-yellow-400 hover:bg-yellow-50/30 transition-all duration-200 group"
                >
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 mb-1 uppercase tracking-wider">
                    {example.category}
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-200 line-clamp-2">{example.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            type="submit"
            disabled={isLoading || !strategyContext}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 dark:text-zinc-50 disabled:bg-zinc-200 dark:bg-zinc-700 disabled:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 font-medium rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-xl hover:shadow-yellow-500/30 transition-all duration-200 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-transparent rounded-full animate-spin" />
                推演中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成{selectedFinanceModule.label}
              </>
            )}
          </button>
        </form>
      }
    />
  );
}

export default function FinancePage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
          测算引擎准备中...
        </div>
      }
    >
      <FinanceContent />
    </Suspense>
  );
}
