/**
 * User Page - New Agent Layout
 * 人道·用户 (Human - User)
 * 洞察用户画像，搭建私域运营与裂变体系。
 *
 * Design: 玫瑰红 (Rose) 极简风格，温度、共情。
 */

"use client";

import { AgentLayout } from "@/components/business/agent-layout";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext } from "@/lib/strategy-context";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  HeartHandshake,
  Network,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

type UserModule = "persona" | "private-domain" | "fission";

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
  userModule: UserModule;
}

// ============================================================================
// DATA
// ============================================================================

const USER_MODULES = [
  {
    value: "persona",
    label: "深度用户画像",
    icon: <Users className="w-5 h-5 text-rose-500" />,
    description: "痛点、爽点、痒点分析",
    color: "rose",
  },
  {
    value: "private-domain",
    label: "私域运营体系",
    icon: <HeartHandshake className="w-5 h-5 text-pink-500" />,
    description: "人设打造、朋友圈SOP",
    color: "pink",
  },
  {
    value: "fission",
    label: "裂变增长方案",
    icon: <Network className="w-5 h-5 text-red-500" />,
    description: "老带新、转介绍机制",
    color: "red",
  },
] as const;

const examplePrompts: ExamplePrompt[] = [
  {
    id: 1,
    text: "帮我分析二线城市30岁白领女性在报健身班时的心理抗拒点和核心动因",
    category: "用户画像",
    userModule: "persona",
  },
  {
    id: 2,
    text: "为美妆代购设计一套微信朋友圈运营SOP，包含早中晚发圈内容和互动技巧",
    category: "私域运营",
    userModule: "private-domain",
  },
  {
    id: 3,
    text: "策划一个线下采耳店的开业裂变活动，目标是通过老客户带3个新客户进店",
    category: "裂变增长",
    userModule: "fission",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function UserContent() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 读取战略上下文
  const [strategyContext, setStrategyContext] = useState<StrategyContext | null>(null);

  // 表单状态
  const [userModule, setUserModule] = useState<UserModule>("persona");
  const [targetAudience, setTargetAudience] = useState("");
  const [userDetails, setUserDetails] = useState("");
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
      await startStreaming("/api/user", {
        // 战略参数
        niche: strategyContext.niche,
        revenueGoal: strategyContext.revenueGoal,
        founderStory: strategyContext.founderStory,
        strengths: strategyContext.strengths,

        // 用户参数
        userModule,
        targetAudience,
        userDetails,
      });
    } catch (error) {
      console.error("生成用户洞察失败:", error);
      alert("生成失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const selectExample = (example: ExamplePrompt) => {
    setUserModule(example.userModule);
    setTargetAudience("");
    setUserDetails(example.text);
  };

  const selectedUserModule = USER_MODULES.find((t) => t.value === userModule) || USER_MODULES[0];

  return (
    <AgentLayout
      agentId="user"
      title="人道 · 用户"
      subtitle="AI 洞察与私域运营"
      icon={<Users className="w-4 h-4 text-white" />}
      accentColor="rose"
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
            <div className="w-12 h-12 rounded-full bg-rose-50/80 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">需要战略总纲</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              用户洞察需要基于战略总纲，请先前往「天道·战略」生成商业战略
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-rose-50/80 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="font-sans text-[15px] tracking-wide font-medium text-zinc-700 dark:text-zinc-200 mb-2">洞察工具已就绪</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              在左侧告诉我想了解什么，我将为您生成共情式的用户画像与运营方案。
            </p>
          </div>
        )
      }
      outputComponent={<StreamingOutputCanvas content={content} isStreaming={isStreaming} />}
      inputComponent={
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 战略上下文状态 */}
          {strategyContext ? (
            <div className="flex items-start gap-3 p-4 bg-rose-50/50 rounded-xl border border-rose-100">
              <Compass className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
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
                  className="text-xs text-rose-600 hover:underline"
                >
                  前往生成 →
                </button>
              </div>
            </div>
          )}

          {/* 用户模块选择 */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              分析模块 <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {USER_MODULES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUserModule(type.value as UserModule)}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all duration-200",
                    userModule === type.value
                      ? "bg-rose-50 border-rose-300"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-rose-300/50"
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
                    {userModule === type.value && <Check className="w-4 h-4 text-rose-600" />}
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
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">目前主要客户画像</label>
                  <textarea
                    placeholder="例如：目前进店的主要是周边小区的全职妈妈..."
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    disabled={isLoading}
                    rows={2}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-rose-500/50 resize-none transition-all duration-200"
                  />
                </div>

                {/* 补充说明 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">运营痛点或期望</label>
                  <textarea
                    placeholder="例如：客户加了微信后都是死粉，怎么激活他们？..."
                    value={userDetails}
                    onChange={(e) => setUserDetails(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-500 dark:text-zinc-400 dark:text-zinc-500 focus:outline-none focus:border-rose-500/50 resize-none transition-all duration-200"
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
                  className="w-full text-left p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-rose-300/50 hover:bg-rose-50/50 transition-all duration-200 group"
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
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-200 dark:bg-zinc-700 text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 dark:shadow-rose-900/40 hover:shadow-xl hover:shadow-rose-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                推演中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成{selectedUserModule.label}
              </>
            )}
          </button>
        </form>
      }
    />
  );
}

export default function UserPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-zinc-600 dark:text-zinc-300 dark:text-zinc-300">
          洞察工具准备中...
        </div>
      }
    >
      <UserContent />
    </Suspense>
  );
}
