/**
 * Product Page - New Agent Layout
 * 地道·产品 (Earth - Product)
 * 围绕目标人群规划产品矩阵、服务流程。
 *
 * Design: 翡翠绿 (Emerald) 极简风格，专业、生机。
 */

"use client";

import { AgentLayout } from "@/components/business/agent-layout";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext } from "@/lib/strategy-context";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  LayoutGrid,
  Sparkles,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type ProductType = "matrix" | "service-flow" | "pricing";

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
  productType: ProductType;
}

// ============================================================================
// DATA
// ============================================================================

const PRODUCT_TYPES = [
  {
    value: "matrix",
    label: "产品矩阵设计",
    icon: <LayoutGrid className="w-5 h-5 text-emerald-500" />,
    description: "引流款、利润款、爆款规划",
    color: "emerald",
  },
  {
    value: "service-flow",
    label: "服务标准SOP",
    icon: <Briefcase className="w-5 h-5 text-teal-500" />,
    description: "业务交付全流程",
    color: "teal",
  },
  {
    value: "pricing",
    label: "定价策略",
    icon: <Target className="w-5 h-5 text-green-500" />,
    description: "阶梯定价、锁客方案",
    color: "green",
  },
] as const;

const examplePrompts: ExamplePrompt[] = [
  {
    id: 1,
    text: "帮我规划一套美甲店的产品矩阵，包含引流、锁客和高客单服务",
    category: "产品矩阵",
    productType: "matrix",
  },
  {
    id: 2,
    text: "为我的情感咨询工作室制定一份服务SOP，从客户加微信到交付结束",
    category: "服务流程",
    productType: "service-flow",
  },
  {
    id: 3,
    text: "设计一套瑜伽馆的阶梯定价方案，包含体验课、季卡、年卡及私教",
    category: "定价策略",
    productType: "pricing",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function ProductContent() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 读取战略上下文
  const [strategyContext, setStrategyContext] = useState<StrategyContext | null>(null);

  // 表单状态
  const [productType, setProductType] = useState<ProductType>("matrix");
  const [targetAudience, setTargetAudience] = useState("");
  const [productFeatures, setProductFeatures] = useState("");
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
      await startStreaming("/api/product", {
        // 战略参数
        niche: strategyContext.niche,
        revenueGoal: strategyContext.revenueGoal,
        founderStory: strategyContext.founderStory,
        strengths: strategyContext.strengths,

        // 产品参数
        productType,
        targetAudience,
        productFeatures,
      });
    } catch (error) {
      console.error("生成衍生内容失败:", error);
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExample = (example: ExamplePrompt) => {
    setProductType(example.productType);
    setTargetAudience("");
    setProductFeatures(example.text);
  };

  const selectedProductType =
    PRODUCT_TYPES.find((t) => t.value === productType) || PRODUCT_TYPES[0];

  return (
    <AgentLayout
      agentId="product"
      title="地道 · 产品"
      subtitle="AI 产品与服务规划"
      icon={<LayoutGrid className="w-4 h-4 text-white" />}
      accentColor="emerald"
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
            <div className="w-12 h-12 rounded-full bg-emerald-50/80 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">需要战略总纲</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              产品规划需要基于战略总纲，请先前往「天道·战略」生成商业战略
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50/80 flex items-center justify-center mb-4">
              <LayoutGrid className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">分析工具已就绪</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              在左侧配置您的想法，我将为您规划标准化的产品矩阵与交付流。
            </p>
          </div>
        )
      }
      outputComponent={<StreamingOutputCanvas content={content} isStreaming={isStreaming} />}
      inputComponent={
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 战略上下文状态 */}
          {strategyContext ? (
            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <Compass className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">已预装战略总纲</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">赛道：{strategyContext.niche}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200">需要战略总纲</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">请先前往「天道·战略」生成商业战略</p>
                <button
                  type="button"
                  onClick={() => router.push("/strategy")}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  前往生成 →
                </button>
              </div>
            </div>
          )}

          {/* 产品类型选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              规划模块 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRODUCT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setProductType(type.value as ProductType)}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200",
                    productType === type.value
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-emerald-300/50"
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
                    {productType === type.value && <Check className="w-4 h-4 text-emerald-600" />}
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
                {/* 目标受众 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">细分核心人群</label>
                  <textarea
                    placeholder="例如：对价格敏感但追求性价比的大学生..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all duration-200"
                  />
                </div>

                {/* 补充说明 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">特殊要求、已有特点</label>
                  <textarea
                    placeholder="例如：我们目前主打的是高端定制，不想做低价引流..."
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all duration-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 示例提示卡片 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">不知道怎么填？试试这些：</p>
            <div className="space-y-2">
              {examplePrompts.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => selectExample(example)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-emerald-300/50 hover:bg-emerald-50/50 transition-all duration-200 group"
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
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-200 dark:bg-zinc-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 dark:shadow-emerald-900/40 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                推演中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成{selectedProductType.label}
              </>
            )}
          </button>
        </form>
      }
    />
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
          产品工坊准备中...
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
