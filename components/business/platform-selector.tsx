/**
 * Platform Selector Component
 * 平台选择器
 */

import { PLATFORMS, type Platform } from "./content-form-light.types";

interface PlatformSelectorProps {
  selectedPlatform?: Platform;
  onSelectPlatform: (platform: Platform) => void;
  disabled?: boolean;
}

export function PlatformSelector({
  selectedPlatform,
  onSelectPlatform,
  disabled = false,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200 dark:text-slate-300">
        发布平台
      </label>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => (
          <button
            key={platform.value}
            type="button"
            onClick={() => onSelectPlatform(platform.value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
              selectedPlatform === platform.value
                ? "bg-zinc-100 dark:bg-zinc-800 text-white border-zinc-900 dark:border-zinc-100"
                : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50"
            }`}
          >
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
