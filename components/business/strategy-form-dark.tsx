/**
 * Strategy Research Form (Dark Theme)
 * 深色主题的表单组件，用于左侧控制台
 */

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StrategyResearchInput } from "@/types/db";
import { Check, File, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface StrategyFormDarkProps {
  onSubmit: (data: StrategyResearchInput) => void;
  isLoading?: boolean;
}

export function StrategyFormDark({ onSubmit, isLoading = false }: StrategyFormDarkProps) {
  const [formData, setFormData] = useState<StrategyResearchInput>({
    niche: "",
    revenueGoal: "",
    founderStory: "",
    strengths: [],
    file_id: undefined,
  });

  const [strengthInput, setStrengthInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addStrength = () => {
    if (strengthInput.trim() && !formData.strengths?.includes(strengthInput.trim())) {
      setFormData({
        ...formData,
        strengths: [...(formData.strengths || []), strengthInput.trim()],
      });
      setStrengthInput("");
    }
  };

  const removeStrength = (strength: string) => {
    setFormData({
      ...formData,
      strengths: formData.strengths?.filter((s) => s !== strength),
    });
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);
    setUploadError("");

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("userId", "anonymous");

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "文件上传失败");
      }

      setFormData({ ...formData, file_id: data.file_id });
    } catch (error) {
      console.error("文件上传错误:", error);
      setUploadError(error instanceof Error ? error.message : "文件上传失败");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFormData({ ...formData, file_id: undefined });
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* 核心赛道 */}
      <div className="space-y-1.5">
        <Label htmlFor="niche" className="text-xs font-medium text-slate-300">
          核心赛道
          {!file && <span className="text-red-400 ml-1">*</span>}
          {file && formData.file_id && (
            <span className="text-zinc-500 dark:text-zinc-400 font-normal ml-1">（选填）</span>
          )}
        </Label>
        <input
          id="niche"
          type="text"
          placeholder="例如：美业老板培训"
          value={formData.niche}
          onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
          required={!file}
          disabled={isLoading}
          className="w-full bg-zinc-800/50 border border-zinc-600 dark:border-zinc-400/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 dark:text-zinc-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200 disabled:opacity-50"
        />
      </div>

      {/* 营收目标 */}
      <div className="space-y-1.5">
        <Label htmlFor="revenueGoal" className="text-xs font-medium text-slate-300">
          营收目标
        </Label>
        <input
          id="revenueGoal"
          type="text"
          placeholder="例如：年营收 1000 万"
          value={formData.revenueGoal || ""}
          onChange={(e) => setFormData({ ...formData, revenueGoal: e.target.value })}
          disabled={isLoading}
          className="w-full bg-zinc-800/50 border border-zinc-600 dark:border-zinc-400/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 dark:text-zinc-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200 disabled:opacity-50"
        />
      </div>

      {/* 创始人故事 */}
      <div className="space-y-1.5">
        <Label htmlFor="founderStory" className="text-xs font-medium text-slate-300">
          创始人故事
        </Label>
        <Textarea
          id="founderStory"
          placeholder="例如：我曾经也是美业从业者，深知创业的艰辛..."
          value={formData.founderStory || ""}
          onChange={(e) => setFormData({ ...formData, founderStory: e.target.value })}
          disabled={isLoading}
          rows={3}
          className="bg-zinc-800/50 border border-zinc-600 dark:border-zinc-400/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 dark:text-zinc-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200 resize-none disabled:opacity-50"
        />
      </div>

      {/* 信任背书 */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-300">信任背书</Label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="例如：成功案例、专业认证"
            value={strengthInput}
            onChange={(e) => setStrengthInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStrength())}
            disabled={isLoading}
            className="flex-1 bg-zinc-800/50 border border-zinc-600 dark:border-zinc-400/50 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 dark:text-zinc-400 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all duration-200 disabled:opacity-50"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addStrength}
            disabled={isLoading}
            className="px-3 h-9 bg-slate-700/50 border-zinc-600 dark:border-zinc-400/50 text-white hover:bg-slate-700 transition-all duration-200 text-xs"
          >
            添加
          </Button>
        </div>
        {formData.strengths && formData.strengths.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {formData.strengths.map((strength) => (
              <span
                key={strength}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-200 rounded-md text-xs font-medium border border-amber-500/30"
              >
                {strength}
                <button
                  type="button"
                  onClick={() => removeStrength(strength)}
                  className="hover:text-red-400 transition-colors duration-200"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 分隔线 */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700/50"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-zinc-900 text-zinc-500 dark:text-zinc-400">或上传参考文档</span>
        </div>
      </div>

      {/* 文件上传 */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-300">
          参考文档
          <span className="text-amber-500 font-normal ml-2">（推荐）</span>
        </Label>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={isLoading || uploading}
          accept=".pdf,.doc,.docx,.txt,.md"
          className="hidden"
          id="file-upload-dark"
        />

        {!file ? (
          <label
            htmlFor="file-upload-dark"
            className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-zinc-600 dark:border-zinc-400/50 rounded-lg cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800/30 transition-all duration-200"
          >
            <Upload className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">点击上传文档</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">PDF, Word, TXT, MD</p>
            </div>
          </label>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-zinc-800/50 border border-slate-700/50 rounded-lg">
            <File className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {uploading ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : formData.file_id ? (
              <div className="flex items-center gap-1 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-xs">已上传</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-4 h-4 text-zinc-500 dark:text-zinc-400 hover:text-red-400" />
              </button>
            )}
          </div>
        )}

        {uploadError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠️</span>
            {uploadError}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 rounded-lg bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
        disabled={isLoading || (!formData.file_id && !formData.niche.trim())}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <span className="mr-2">✨</span>
            {formData.file_id ? "基于文档生成" : "生成战略"}
          </>
        )}
      </Button>
    </div>
  );
}
