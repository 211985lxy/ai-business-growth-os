/**
 * Strategy Params Section Component
 * 战略参数区域组件
 */

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Compass } from "lucide-react";
import { useState } from "react";
import type { ContentGenerationInput, StrategyContext } from "./content-form-light.types";
import { TagInput } from "./tag-input";

interface StrategyParamsSectionProps {
  formData: ContentGenerationInput;
  onChangeFormData: (data: ContentGenerationInput) => void;
  strategyContext?: StrategyContext | null;
  onRegenerateStrategy?: () => void;
  isLoading?: boolean;
}

export function StrategyParamsSection({
  formData,
  onChangeFormData,
  strategyContext,
  onRegenerateStrategy,
  isLoading = false,
}: StrategyParamsSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [strengthInput, setStrengthInput] = useState("");

  const addStrength = () => {
    if (strengthInput.trim() && !formData.strengths?.includes(strengthInput.trim())) {
      onChangeFormData({
        ...formData,
        strengths: [...(formData.strengths || []), strengthInput.trim()],
      });
      setStrengthInput("");
    }
  };

  const removeStrength = (strength: string) => {
    onChangeFormData({
      ...formData,
      strengths: formData.strengths?.filter((s) => s !== strength),
    });
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left p-2 bg-zinc-50/80 dark:bg-zinc-800/80 dark:bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 dark:border-zinc-900/20 dark:border-zinc-100/20 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/15 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-zinc-900 dark:text-zinc-50 dark:text-amber-400" />
          <span className="text-sm font-medium text-zinc-900 dark:text-white dark:text-amber-200">
            基础信息
          </span>
          {strategyContext && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">（已从战略加载）</span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-zinc-900 dark:text-zinc-50 dark:text-amber-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-900 dark:text-zinc-50 dark:text-amber-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 pl-2">
          {/* 核心赛道 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="niche"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-400"
            >
              核心赛道
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <input
              id="niche"
              type="text"
              placeholder="例如：美业老板培训"
              value={formData.niche}
              onChange={(e) => onChangeFormData({ ...formData, niche: e.target.value })}
              disabled={isLoading}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 transition-all duration-200"
            />
          </div>

          {/* 营收目标 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="revenueGoal"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-400"
            >
              营收目标
            </Label>
            <input
              id="revenueGoal"
              type="text"
              placeholder="例如：年营收 1000 万"
              value={formData.revenueGoal || ""}
              onChange={(e) => onChangeFormData({ ...formData, revenueGoal: e.target.value })}
              disabled={isLoading}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 transition-all duration-200"
            />
          </div>

          {/* 创始人故事 */}
          <div className="space-y-1.5">
            <Label
              htmlFor="founderStory"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-400"
            >
              创始人故事
            </Label>
            <Textarea
              id="founderStory"
              placeholder="例如：我曾经也是美业从业者，深知创业的艰辛..."
              value={formData.founderStory || ""}
              onChange={(e) => onChangeFormData({ ...formData, founderStory: e.target.value })}
              disabled={isLoading}
              rows={2}
              className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-zinc-900/50 dark:border-zinc-100/50 dark:focus:border-zinc-900/30 dark:border-zinc-100/30 resize-none transition-all duration-200"
            />
          </div>

          {/* 信任背书 */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-zinc-400">
              信任背书
            </Label>
            <TagInput
              tags={formData.strengths || []}
              inputPlaceholder="例如：成功案例、专业认证"
              inputValue={strengthInput}
              onInputChange={setStrengthInput}
              onAddTag={addStrength}
              onRemoveTag={removeStrength}
              disabled={isLoading}
              tagColor="fuchsia"
            />
          </div>

          {strategyContext && onRegenerateStrategy && (
            <button
              type="button"
              onClick={onRegenerateStrategy}
              className="text-xs text-zinc-900 dark:text-zinc-50 dark:text-amber-400 hover:text-fuchsia-800 dark:hover:text-amber-200 underline"
            >
              使用天道·战略重新生成基础信息 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
