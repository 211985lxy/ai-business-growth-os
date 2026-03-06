/**
 * Rule Page - New Agent Layout
 * 法道·规章 (Law - Rule)
 * 沉淀内部SOP、管理制度与合规流程。
 *
 * Design: 琥珀黄 (Amber) 极简风格，严谨、秩序。
 */

"use client";

import { AgentLayout } from "@/components/business/agent-layout";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext } from "@/lib/strategy-context";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type RuleModule = "sop" | "management" | "compliance";

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
  ruleModule: RuleModule;
}

// ============================================================================
// DATA
// ============================================================================

const RULE_MODULES = [
  {
    value: "sop",
    label: "业务SOP沉淀",
    icon: <BookOpen className="w-5 h-5 text-amber-500" />,
    description: "将经验转化为标准化流程",
    color: "amber",
  },
  {
    value: "management",
    label: "管理与激励制度",
    icon: <Scale className="w-5 h-5 text-orange-500" />,
    description: "薪酬、晋升、分润机制",
    color: "orange",
  },
  {
    value: "compliance",
    label: "风控与合规指南",
    icon: <ShieldCheck className="w-5 h-5 text-yellow-600" />,
    description: "财税合规、法律风险防范",
    color: "yellow",
  },
] as const;

const examplePrompts: ExamplePrompt[] = [
  {
    id: 1,
    text: "帮我拟定一份销售团队的日常跟单SOP，包含早会、客户跟进和晚复盘",
    category: "业务SOP",
    ruleModule: "sop",
  },
  {
    id: 2,
    text: "设计一套美发店的提成和晋升机制，要能留住核心发型师",
    category: "管理制度",
    ruleModule: "management",
  },
  {
    id: 3,
    text: "我们做知识付费的，梳理一下容易踩坑的合规问题及防范建议",
    category: "风控合规",
    ruleModule: "compliance",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function RuleContent() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 读取战略上下文
  const [strategyContext, setStrategyContext] = useState<StrategyContext | null>(null);

  // 表单状态
  const [ruleModule, setRuleModule] = useState<RuleModule>("sop");
  const [targetTeam, setTargetTeam] = useState("");
  const [ruleDetails, setRuleDetails] = useState("");
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
      await startStreaming("/api/rule", {
        // 战略参数
        niche: strategyContext.niche,
        revenueGoal: strategyContext.revenueGoal,
        founderStory: strategyContext.founderStory,
        strengths: strategyContext.strengths,

        // 规章参数
        ruleModule,
        targetTeam,
        ruleDetails,
      });
    } catch (error) {
      console.error("生成规章失败:", error);
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExample = (example: ExamplePrompt) => {
    setRuleModule(example.ruleModule);
    setTargetTeam("");
    setRuleDetails(example.text);
  };

  const selectedRuleModule = RULE_MODULES.find((t) => t.value === ruleModule) || RULE_MODULES[0];

  return (
    <AgentLayout
      agentId="rule"
      title="法道 · 规章"
      subtitle="AI 制度与标准建设"
      icon={<Scale className="w-4 h-4 text-white" />}
      accentColor="amber"
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
            <div className="w-12 h-12 rounded-full bg-amber-50/80 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">需要战略总纲</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              规章制定需要基于战略总纲，请先前往「天道·战略」生成商业战略
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-amber-50/80 flex items-center justify-center mb-4">
              <Scale className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">法度工具已就绪</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              在左侧描述管理痛点或需求，我将为您输出严谨、可落地的内部规范。
            </p>
          </div>
        )
      }
      outputComponent={<StreamingOutputCanvas content={content} isStreaming={isStreaming} />}
      inputComponent={
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 战略上下文状态 */}
          {strategyContext ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <Compass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
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
                  className="text-xs text-amber-600 hover:underline"
                >
                  前往生成 →
                </button>
              </div>
            </div>
          )}

          {/* 模块选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              规章模块 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {RULE_MODULES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRuleModule(type.value as RuleModule)}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200",
                    ruleModule === type.value
                      ? "bg-amber-50 border-amber-300"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-amber-300/50"
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
                    {ruleModule === type.value && <Check className="w-4 h-4 text-amber-600" />}
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
                {/* 适用对象 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">适用团队/岗位</label>
                  <input
                    type="text"
                    placeholder="例如：新入职的客服人员、内容团队..."
                    value={targetTeam}
                    onChange={(e) => setTargetTeam(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-amber-500/50 transition-all duration-200"
                  />
                </div>

                {/* 补充说明 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">核心痛点或具体诉求</label>
                  <textarea
                    placeholder="例如：目前的提成制度大家都在吃大锅饭，没有动力..."
                    value={ruleDetails}
                    onChange={(e) => setRuleDetails(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none transition-all duration-200"
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
                  className="w-full text-left p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-amber-300/50 hover:bg-amber-50/50 transition-all duration-200 group"
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
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-200 dark:bg-zinc-700 text-white font-medium rounded-xl shadow-lg shadow-amber-500/25 dark:shadow-amber-900/40 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                推演中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成{selectedRuleModule.label}
              </>
            )}
          </button>
        </form>
      }
    />
  );
}

export default function RulePage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
          法度工具准备中...
        </div>
      }
    >
      <RuleContent />
    </Suspense>
  );
}
