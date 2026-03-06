/**
 * Tag Input Component
 * 可复用的标签输入组件
 */

import { Button } from "@/components/ui/button";

interface TagInputProps {
  tags: string[];
  inputPlaceholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  disabled?: boolean;
  tagColor?: "purple" | "fuchsia" | "emerald" | "amber" | "rose" | "cyan";
}

const tagColorClasses = {
  purple: {
    bg: "bg-purple-50 dark:bg-purple-500/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-500/30",
  },
  fuchsia: {
    bg: "bg-zinc-100 dark:bg-zinc-800/50 dark:bg-zinc-100 dark:bg-zinc-800/20",
    text: "text-zinc-900 dark:text-white dark:text-amber-200",
    border: "border-zinc-300 dark:border-zinc-700 dark:border-zinc-900/30 dark:border-zinc-100/30",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-500/30",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-500/30",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-500/20",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-500/30",
  },
};

export function TagInput({
  tags,
  inputPlaceholder,
  inputValue,
  onInputChange,
  onAddTag,
  onRemoveTag,
  disabled = false,
  tagColor = "purple",
}: TagInputProps) {
  const colorClasses = tagColorClasses[tagColor];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), onAddTag())}
          disabled={disabled}
          className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 dark:text-slate-300 placeholder:text-zinc-500 dark:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-zinc-300 focus:outline-none focus:border-amber-500/50 dark:focus:border-amber-500/30 transition-all duration-200"
        />
        <Button
          type="button"
          variant="outline"
          onClick={onAddTag}
          disabled={disabled}
          className="px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-white/10 transition-all duration-200 text-xs"
        >
          添加
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 ml-0.5"
                disabled={disabled}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
