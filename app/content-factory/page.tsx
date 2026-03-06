/**
 * Content Factory Page - Redesigned
 * 神韵·内容 (Divine Charm - Content)
 * 道生一 → 一生二：战略总纲 → 衍生内容
 *
 * Design: 飞书暗夜模式风格，三栏布局，专业的B2B SaaS产品感
 */

"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Video, Sparkles, Compass, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";
import { getActiveStrategyContext } from "@/lib/strategy-context";

// ============================================================================
// TYPES
// ============================================================================

type ContentType = "video-script" | "article" | "social-post" | "ip-story" | "product-copy";
type Platform = "xiaohongshu" | "douyin" | "wechat" | "weibo" | "general";

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
  contentType: ContentType;
}

// ============================================================================
// DATA
// ============================================================================

const CONTENT_TYPES = [
  { value: "video-script", label: "视频脚本", icon: "🎬", description: "短视频、长视频拍摄脚本" },
  { value: "article", label: "深度文章", icon: "📝", description: "公众号、博客长文" },
  { value: "social-post", label: "社交媒体", icon: "💬", description: "小红书、朋友圈文案" },
  { value: "ip-story", label: "IP 故事", icon: "📖", description: "创始人/品牌 IP 叙事" },
  { value: "product-copy", label: "产品文案", icon: "🎯", description: "产品介绍、卖点提炼" },
] as const;

const PLATFORMS = [
  { value: "xiaohongshu", label: "小红书", color: "red" },
  { value: "douyin", label: "抖音", color: "slate" },
  { value: "wechat", label: "微信", color: "green" },
  { value: "weibo", label: "微博", color: "blue" },
  { value: "general", label: "通用", color: "purple" },
] as const;

const examplePrompts: ExamplePrompt[] = [
  {
    id: 1,
    text: "为我生成一个小红书种草文案，产品是智能洗地机，目标用户是年轻宝妈",
    category: "种草文案",
    contentType: "social-post",
  },
  {
    id: 2,
    text: "写一个品牌起源故事，讲述创始人如何从0到1打造这个品牌",
    category: "IP叙事",
    contentType: "ip-story",
  },
  {
    id: 3,
    text: "创作一个短视频脚本，展示产品的核心卖点和使用场景",
    category: "视频脚本",
    contentType: "video-script",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

function ContentFactoryContent() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // 读取战略上下文
  const [strategyContext, setStrategyContext] = useState<StrategyContext | null>(null);

  // 表单状态
  const [contentType, setContentType] = useState<ContentType>("video-script");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
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
      await startStreaming("/api/content-factory", {
        // 战略参数
        niche: strategyContext.niche,
        revenueGoal: strategyContext.revenueGoal,
        founderStory: strategyContext.founderStory,
        strengths: strategyContext.strengths,

        // 内容参数
        contentType,
        platform,
        targetAudience,
        contentGoal,
        brandVoice,
        keywords,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const selectExample = (example: ExamplePrompt) => {
    setContentType(example.contentType);
    setTargetAudience(example.text);
  };

  const copyContent = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedContentType = CONTENT_TYPES.find((t) => t.value === contentType) || CONTENT_TYPES[0];

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-[#0D0D0D]">
      {/* 顶部导航栏 */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-300" />
          </button>
          <div className="p-2 bg-fuchsia-500 rounded-lg">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              神韵 · 内容
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-500">AI 内容创作工厂</p>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧输入区 */}
        <div className="w-[400px] flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-white/6">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 战略上下文状态 */}
            {strategyContext ? (
              <div className="flex items-start gap-3 p-4 bg-fuchsia-50/50 dark:bg-fuchsia-500/10 rounded-xl border border-fuchsia-100 dark:border-fuchsia-500/20">
                <Compass className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">已加载战略总纲</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    赛道：{strategyContext.niche}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">需要战略总纲</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    请先前往「天道·战略」生成商业战略
                  </p>
                  <button
                    onClick={() => router.push("/strategy")}
                    className="text-xs text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                  >
                    前往生成 →
                  </button>
                </div>
              </div>
            )}

            {/* 内容类型选择 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                内容类型 <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setContentType(type.value as ContentType)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      contentType === type.value
                        ? "bg-fuchsia-50 dark:bg-fuchsia-500/20 border-fuchsia-300 dark:border-fuchsia-500/50"
                        : "bg-white dark:bg-[#141414] border-slate-200 dark:border-white/6 hover:border-fuchsia-300/50 dark:hover:border-fuchsia-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{type.icon}</span>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{type.label}</p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 平台选择 */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                发布平台
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((plat) => (
                  <button
                    key={plat.value}
                    type="button"
                    onClick={() => setPlatform(plat.value as Platform)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      platform === plat.value
                        ? "bg-fuchsia-500 text-white border-fuchsia-500"
                        : "bg-white dark:bg-[#141414] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/6 hover:border-fuchsia-300/50"
                    }`}
                  >
                    {plat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 高级参数折叠区 */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors duration-200"
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                高级参数（可选）
              </button>

              {showAdvanced && (
                <div className="space-y-3 pl-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* 目标受众 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">目标受众</label>
                    <textarea
                      placeholder="例如：25-35岁的职场女性，注重生活品质..."
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      disabled={isLoading}
                      rows={2}
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 dark:focus:border-fuchsia-500/30 resize-none transition-all duration-200"
                    />
                  </div>

                  {/* 内容目标 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">内容目标</label>
                    <input
                      type="text"
                      placeholder="例如：种草转化、品牌曝光"
                      value={contentGoal}
                      onChange={(e) => setContentGoal(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 dark:focus:border-fuchsia-500/30 transition-all duration-200"
                    />
                  </div>

                  {/* 品牌调性 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">品牌调性</label>
                    <input
                      type="text"
                      placeholder="例如：专业、亲和、幽默"
                      value={brandVoice}
                      onChange={(e) => setBrandVoice(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 dark:focus:border-fuchsia-500/30 transition-all duration-200"
                    />
                  </div>

                  {/* 关键词 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">关键词</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="例如：智能、便捷、高效"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                        disabled={isLoading}
                        className="flex-1 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500/50 dark:focus:border-fuchsia-500/30 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        disabled={isLoading}
                        className="px-3 py-2 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200"
                      >
                        添加
                      </button>
                    </div>
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-fuchsia-50/80 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 rounded-md text-xs font-medium border border-fuchsia-200 dark:border-fuchsia-500/30"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 ml-0.5"
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

            {/* 示例提示卡片 */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">示例提示</p>
              <div className="space-y-2">
                {examplePrompts.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => selectExample(example)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-xl hover:border-fuchsia-300/50 dark:hover:border-fuchsia-500/50 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-500/10 transition-all duration-200 group"
                  >
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">{example.category}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{example.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleSubmit}
              disabled={isLoading || !strategyContext}
              className="w-full py-3 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:bg-slate-200 dark:disabled:bg-white/5 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  正在生成...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  生成{selectedContentType.label}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧输出区 */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0D0D0D]">
          {/* 输出区域顶部 */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-slate-200 dark:border-white/6 bg-white/50 dark:bg-white/[0.02] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">内容生成</h2>
              {isStreaming && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                  正在运用三阶段优化流程创作...
                </p>
              )}
            </div>
            {content && !isStreaming && (
              <button
                onClick={copyContent}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all duration-200 group"
                title="复制全文"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                )}
              </button>
            )}
          </div>

          {/* 输出内容区 */}
          <div className="flex-1 overflow-y-auto">
            <div className="h-full">
              {!strategyContext ? (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <div className="w-12 h-12 rounded-full bg-fuchsia-50/80 dark:bg-fuchsia-500/20 flex items-center justify-center mb-4">
                    <Compass className="w-6 h-6 text-fuchsia-400 dark:text-fuchsia-500" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    需要战略总纲
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 text-center max-w-sm">
                    内容创作需要基于战略总纲，请先前往「天道·战略」生成商业战略
                  </p>
                </div>
              ) : !content && !isStreaming ? (
                <div className="h-full flex flex-col items-center justify-center px-6">
                  <div className="w-12 h-12 rounded-full bg-fuchsia-50/80 dark:bg-fuchsia-500/20 flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-fuchsia-400 dark:text-fuchsia-500" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    AI 创作助手已准备就绪
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 text-center max-w-sm">
                    在左侧配置内容参数，我将运用三阶段优化流程（Draft → Critic → Refiner）为你创作高质量内容
                  </p>
                </div>
              ) : (
                <div className="h-full">
                  <div className="max-w-4xl mx-auto px-8 py-6">
                    <StreamingOutputCanvas content={content} isStreaming={isStreaming} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 底部状态栏 */}
          {content && !isStreaming && (
            <div className="flex-shrink-0 px-6 py-2 border-t border-slate-200 dark:border-white/6 bg-white/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                <span>内容已生成，可复制使用</span>
                <span>{selectedContentType.label}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentFactoryPage() {
  return (
    <Suspense fallback={<div className="h-[calc(100vh-4rem)] flex items-center justify-center text-slate-600 dark:text-slate-400">加载中...</div>}>
      <ContentFactoryContent />
    </Suspense>
  );
}
