/**
 * Content Generation Form (Refactored)
 * 神韵·内容 - 完整的创作配置表单
 * 整合战略参数 + 内容创作参数
 *
 * 重构后：拆分为多个子组件，降低圈复杂度
 */

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type {
  ContentFormLightProps,
  ContentGenerationInput,
  ContentType,
  Platform,
} from "./content-form-light.types";
import { CONTENT_TYPES } from "./content-form-light.types";
import { ContentTypeSelector } from "./content-type-selector";
import { PlatformSelector } from "./platform-selector";
import { StrategyParamsSection } from "./strategy-params-section";
import { TagInput } from "./tag-input";

export function ContentFormLight({
  onSubmit,
  isLoading = false,
  strategyContext,
  onRegenerateStrategy,
}: ContentFormLightProps) {
  const [keywordInput, setKeywordInput] = useState("");

  // Form state
  const [formData, setFormData] = useState<ContentGenerationInput>({
    // 从战略上下文初始化
    niche: strategyContext?.niche || "",
    revenueGoal: strategyContext?.revenueGoal || "",
    founderStory: strategyContext?.founderStory || "",
    strengths: strategyContext?.strengths || [],

    // 内容参数
    contentType: "video-script",
    platform: undefined,
    targetAudience: "",
    contentGoal: "",
    brandVoice: "",
    keywords: [],
    customPrompt: "",
  });

  // Sync with strategyContext when it changes
  useEffect(() => {
    if (strategyContext) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing strategy context is intentional
      setFormData((prev) => ({
        ...prev,
        niche: strategyContext.niche || prev.niche,
        revenueGoal: strategyContext.revenueGoal || prev.revenueGoal,
        founderStory: strategyContext.founderStory || prev.founderStory,
        strengths: strategyContext.strengths || prev.strengths,
      }));
    }
  }, [strategyContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // 关键词管理
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords?.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...(formData.keywords || []), keywordInput.trim()],
      });
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords?.filter((k) => k !== keyword),
    });
  };

  // 获取当前选中的内容类型
  const selectedContentType = CONTENT_TYPES.find(
    (t: { value: ContentType }) => t.value === formData.contentType
  );

  return (
    <div className="space-y-4">
      {/* 参数说明 */}
      <div className="text-center space-y-1 pb-4 border-b border-zinc-300 dark:border-zinc-700/50 dark:border-white/8">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 dark:text-slate-200">
          内容创作配置
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 dark:text-zinc-600 dark:text-zinc-300">
          配置基础信息和内容参数，AI将为你生成定制化内容
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 战略参数区域 */}
        <StrategyParamsSection
          formData={formData}
          onChangeFormData={setFormData}
          strategyContext={strategyContext}
          onRegenerateStrategy={onRegenerateStrategy}
          isLoading={isLoading}
        />

        {/* 分隔线 */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-zinc-50 dark:bg-transparent text-zinc-500 dark:text-zinc-400 dark:text-zinc-600 dark:text-zinc-300">
              内容参数
            </span>
          </div>
        </div>

        {/* 内容类型选择 */}
        <ContentTypeSelector
          selectedType={formData.contentType}
          onSelectType={(type) => setFormData({ ...formData, contentType: type })}
          disabled={isLoading}
        />

        {/* 发布平台（根据内容类型可选） */}
        {(formData.contentType === "social-post" || formData.contentType === "video-script") && (
          <PlatformSelector
            selectedPlatform={formData.platform}
            onSelectPlatform={(platform) => setFormData({ ...formData, platform })}
            disabled={isLoading}
          />
        )}

        {/* 目标受众 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="targetAudience"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300"
          >
            目标受众
          </Label>
          <input
            id="targetAudience"
            type="text"
            placeholder="例如：25-35岁美业创业者，注重个人品牌"
            value={formData.targetAudience || ""}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            disabled={isLoading}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 transition-all duration-200"
          />
        </div>

        {/* 内容目标 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="contentGoal"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300"
          >
            内容目标
          </Label>
          <Textarea
            id="contentGoal"
            placeholder="例如：建立专业形象、获取潜在客户、展示产品价值..."
            value={formData.contentGoal || ""}
            onChange={(e) => setFormData({ ...formData, contentGoal: e.target.value })}
            disabled={isLoading}
            rows={2}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 resize-none transition-all duration-200"
          />
        </div>

        {/* 品牌调性 */}
        <div className="space-y-1.5">
          <Label
            htmlFor="brandVoice"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300"
          >
            品牌调性
          </Label>
          <input
            id="brandVoice"
            type="text"
            placeholder="例如：专业温暖、幽默风趣、真诚直接"
            value={formData.brandVoice || ""}
            onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
            disabled={isLoading}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 transition-all duration-200"
          />
        </div>

        {/* 关键词标签 */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300">
            关键词标签
          </Label>
          <TagInput
            tags={formData.keywords || []}
            inputPlaceholder="例如：美业创业、IP打造"
            inputValue={keywordInput}
            onInputChange={setKeywordInput}
            onAddTag={addKeyword}
            onRemoveTag={removeKeyword}
            disabled={isLoading}
            tagColor="fuchsia"
          />
        </div>

        {/* 自定义提示词（可选） */}
        <div className="space-y-1.5">
          <Label
            htmlFor="customPrompt"
            className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300"
          >
            自定义要求
            <span className="text-zinc-500 dark:text-zinc-400 font-normal ml-1">（可选）</span>
          </Label>
          <Textarea
            id="customPrompt"
            placeholder="例如：需要包含3个干货要点、结尾引导私信咨询..."
            value={formData.customPrompt || ""}
            onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
            disabled={isLoading}
            rows={2}
            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 resize-none transition-all duration-200"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 rounded-lg bg-zinc-800 dark:bg-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          disabled={isLoading || !formData.niche.trim()}
        >
          {isLoading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin">◌</span>
              生成中...
            </>
          ) : (
            <>
              {selectedContentType && <selectedContentType.icon className="mr-2 h-4 w-4" />}
              生成{selectedContentType?.label || "内容"}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// 重新导出类型
export { CONTENT_TYPES, PLATFORMS } from "./content-form-light.types";
export type { StrategyContext } from "./content-form-light.types";
export type { ContentFormLightProps, ContentGenerationInput, ContentType, Platform };
