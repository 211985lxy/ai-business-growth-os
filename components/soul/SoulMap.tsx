/**
 * Soul Map Visualization
 * 灵魂快照可视化 - 使用 Mermaid 展示企业的六脉知识分布
 */

"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export interface MeridianData {
  type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
  name: string;
  fileCount: number;
  wordCount: number;
  percentage: number; // 该脉占总知识的百分比
}

interface SoulMapProps {
  companyName?: string;
  meridianData: MeridianData[];
  className?: string;
}

export function SoulMap({ companyName = "您的企业", meridianData, className = "" }: SoulMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // 计算总文件数
  const totalFiles = meridianData.reduce((sum, m) => sum + m.fileCount, 0);
  const totalWords = meridianData.reduce((sum, m) => sum + m.wordCount, 0);

  // 生成 Mermaid 图表代码
  const generateMermaidChart = () => {
    const nodes = [
      `Center("${companyName}\\n${totalFiles} 份文档\\n${Math.round(totalWords / 10000)} 万字")`,
    ];

    meridianData.forEach((meridian) => {
      nodes.push(
        `${meridian.type}["${meridian.name}\\n${meridian.fileCount} 份"]:::${meridian.type}`
      );
    });

    const connections = meridianData.map(
      (m) => `Center -->|"${Math.round(m.percentage)}%"| ${m.type}`
    );

    return `
      %%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#3b82f6', 'primaryTextColor': '#9ca3af' }}}
      flowchart TD
        ${nodes.join("\n        ")}
        ${connections.join("\n        ")}

        style Center fill:#1e293b,stroke:#3b82f6,stroke-width:3px,color:#60a5fa
        style tian fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#93c5fd
        style di fill:#134e4a,stroke:#34d399,stroke-width:2px,color:#6ee7b7
        style ren fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#fb923c
        style shen fill:#581c87,stroke:#c084fc,stroke-width:2px,color:#d8b4fe
        style cai fill:#713f12,stroke:#f59e0b,stroke-width:2px,color:#fbbf24
        style fa fill:#7f1d1d,stroke:#f87171,stroke-width:2px,color:#fda4af
      `;
  };

  // 初始化 Mermaid（只在客户端执行一次）
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });
    isInitializedRef.current = true;
  }, []);

  // 渲染 Mermaid 图表
  useEffect(() => {
    if (!isInitializedRef.current || !chartRef.current) return;

    const renderChart = async () => {
      try {
        const chart = generateMermaidChart();
        const { svg } = await mermaid.render("soul-map-chart-" + Date.now(), chart);
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid 渲染失败:", error);
      }
    };

    renderChart();
  }, [meridianData, companyName]);

  const handleExport = async () => {
    try {
      const chart = generateMermaidChart();
      const { svg } = await mermaid.render("soul-map-chart-export-" + Date.now(), chart);

      // 创建下载链接
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName}-灵魂图谱.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出图谱失败:", error);
    }
  };

  return (
    <div className={`border-b border-gray-800 p-4 ${className}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-300">灵魂快照</h3>
          <p className="text-[10px] text-gray-500 mt-1">企业大脑知识分布图谱</p>
        </div>
        <button
          onClick={handleExport}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          导出图谱
        </button>
      </div>

      {/* Mermaid 图表容器 */}
      <div className="relative bg-gray-900/50 rounded-lg p-4 overflow-hidden">
        <div ref={chartRef} className="min-h-[300px] flex items-center justify-center" />
      </div>

      {/* 统计信息 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">总文档数</div>
          <div className="text-2xl font-bold text-blue-400 font-mono">{totalFiles}</div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">总字数</div>
          <div className="text-2xl font-bold text-green-400 font-mono">
            {(totalWords / 10000).toFixed(1)} 万
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">最强脉络</div>
          <div className="text-lg font-bold text-purple-400">
            {meridianData.length > 0
              ? meridianData.reduce((max, m) => (m.fileCount > max.fileCount ? m : max)).name
              : "暂无数据"}
          </div>
        </div>
      </div>

      {/* 脉络详细列表 */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">脉络知识分布</h4>
        <div className="grid grid-cols-2 gap-2">
          {meridianData.map((meridian) => (
            <div
              key={meridian.type}
              className="bg-gray-900/30 rounded-md p-2 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{getMeridianIcon(meridian.type)}</span>
                <span className="text-xs text-gray-300">{meridian.name}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-blue-400">{meridian.fileCount} 份</div>
                <div className="text-[10px] text-gray-500">{Math.round(meridian.percentage)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getMeridianIcon(type: string) {
  const icons: Record<string, string> = {
    tian: "☁️",
    di: "🏔️",
    ren: "👥",
    shen: "✨",
    cai: "💰",
    fa: "⚖️",
  };
  return icons[type] || "📄";
}
