"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import { useState, useRef } from "react";

interface InsightsModeInputProps {
  isLoading: boolean;
  onAnalyze: (data: any) => void;
}

export function InsightsModeInput({ isLoading, onAnalyze }: InsightsModeInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert("请上传 CSV 格式的数据文件");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    // 实际应用中需要解析 CSV 并将数据传给 AI
    onAnalyze({ filename: file.name, size: file.size });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">数据复盘与洞察</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          上传历史发布数据，AI 将为您分析爆款规律并优化下一步策略
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/50"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
              <MaterialIcon icon="check_circle" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                重新上传
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                  isLoading
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    正在分析...
                  </>
                ) : (
                  <>
                    <MaterialIcon icon="analytics" size={16} />
                    开始深度复盘
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center text-zinc-400">
              <MaterialIcon icon="upload_file" size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">点击上传或拖拽文件到这里</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">支持从抖音、快手等平台导出的 CSV 数据报表</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-6 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-sm"
            >
              选择文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
