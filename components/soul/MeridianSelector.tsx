/**
 * Meridian Selector
 * 六脉选择器 - 让用户勾选本次对话重点参考哪一脉的私有知识
 */

import { useState } from "react";

export interface MeridianType {
  type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
  name: string;
  icon: string;
  color: string;
}

const MERIDIANS: MeridianType[] = [
  { type: "tian", name: "天道·战略", icon: "☁️", color: "text-blue-400" },
  { type: "di", name: "地利·产品", icon: "🏔️", color: "text-green-400" },
  { type: "ren", name: "人和·模式", icon: "👥", color: "text-orange-400" },
  { type: "shen", name: "神韵·内容", icon: "✨", color: "text-purple-400" },
  { type: "cai", name: "财库·成交", icon: "💰", color: "text-yellow-400" },
  { type: "fa", name: "法度·管理", icon: "⚖️", color: "text-red-400" },
];

interface MeridianSelectorProps {
  selectedMeridians?: string[];
  onChange?: (meridians: string[]) => void;
  className?: string;
}

export function MeridianSelector({
  selectedMeridians = [],
  onChange,
  className = "",
}: MeridianSelectorProps) {
  const [selected, setSelected] = useState<string[]>(
    selectedMeridians.length > 0 ? selectedMeridians : MERIDIANS.map((m) => m.type)
  );

  const handleToggle = (meridianType: string) => {
    const newSelected = selected.includes(meridianType)
      ? selected.filter((t) => t !== meridianType)
      : [...selected, meridianType];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-gray-500 text-xs uppercase tracking-wider font-mono">优先参考脉络</span>
      <div className="flex gap-2">
        {MERIDIANS.map((meridian) => (
          <button
            key={meridian.type}
            onClick={() => handleToggle(meridian.type)}
            className={`
              group relative flex items-center gap-1.5 px-3 py-1.5 rounded-md
              transition-all duration-200
              ${
                selected.includes(meridian.type)
                  ? "bg-gray-800 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }
            `}
            title={meridian.name}
          >
            <span className="text-sm">{meridian.icon}</span>
            <span className="text-xs">{meridian.name}</span>

            {/* 选中标记 */}
            {selected.includes(meridian.type) && (
              <span
                className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${meridian.color.replace(
                  "text-",
                  "bg-"
                )}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* 全选/取消按钮 */}
      <button
        onClick={() => {
          const allSelected = selected.length === MERIDIANS.length;
          const newSelected = allSelected ? [] : MERIDIANS.map((m) => m.type);
          setSelected(newSelected);
          onChange?.(newSelected);
        }}
        className="text-gray-500 text-xs hover:text-gray-300 transition-colors font-mono"
      >
        {selected.length === MERIDIANS.length ? "取消全选" : "全选"}
      </button>
    </div>
  );
}
