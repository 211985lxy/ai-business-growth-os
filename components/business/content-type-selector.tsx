/**
 * Content Type Selector Component
 * 内容类型选择器
 */

import { CONTENT_TYPES, type ContentType } from "./content-form-light.types";

interface ContentTypeSelectorProps {
  selectedType: ContentType;
  onSelectType: (type: ContentType) => void;
  disabled?: boolean;
}

export function ContentTypeSelector({
  selectedType,
  onSelectType,
  disabled = false,
}: ContentTypeSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300">
        内容类型
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelectType(type.value)}
              disabled={disabled}
              className={`p-2.5 rounded-lg border text-left transition-all duration-200 ${
                isSelected
                  ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 text-white shadow-lg"
                  : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-zinc-900/50 dark:border-zinc-100/50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-100 dark:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-4 h-4 ${isSelected ? "text-white" : "text-zinc-900 dark:text-zinc-50 dark:text-amber-400"}`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium ${isSelected ? "text-white" : "text-zinc-700 dark:text-zinc-200 dark:text-slate-300"}`}
                  >
                    {type.label}
                  </p>
                  <p
                    className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-zinc-500 dark:text-zinc-400 dark:text-zinc-600 dark:text-zinc-300"}`}
                  >
                    {type.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
