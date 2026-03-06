/**
 * Strategy Research Form
 * Form component for the Strategy Center module
 */

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, File, X, Check } from "lucide-react";
import type { StrategyResearchInput } from "@/types/db";

interface StrategyFormProps {
  onSubmit: (data: StrategyResearchInput) => void;
  isLoading?: boolean;
}

export function StrategyForm({ onSubmit, isLoading = false }: StrategyFormProps) {
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
    // 如果有文件，只使用文件生成；如果没有文件，使用表单数据
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
      uploadFormData.append("userId", "anonymous"); // 免登录模式使用匿名用户

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
    <Card className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
      <CardHeader className="space-y-1.5 px-3 py-3 pb-3">
        <CardTitle className="text-lg font-bold tracking-tight">战略研究</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          上传参考文档或填写表单信息，AI 将为您生成全面的商业战略
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 核心赛道 */}
          <div className="space-y-2">
            <Label htmlFor="niche" className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              核心赛道
              {!file && <span className="text-destructive ml-1">*</span>}
              {file && formData.file_id && (
                <span className="text-muted-foreground font-normal ml-1">（选填）</span>
              )}
            </Label>
            <Input
              id="niche"
              placeholder="例如：美业老板培训"
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              required={!file}
              disabled={isLoading}
              className="rounded-lg border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-9 placeholder:text-muted-foreground/70"
            />
          </div>

          {/* 营收目标 */}
          <div className="space-y-2">
            <Label htmlFor="revenueGoal" className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              营收目标
            </Label>
            <Input
              id="revenueGoal"
              placeholder="例如：年营收 1000 万"
              value={formData.revenueGoal || ""}
              onChange={(e) => setFormData({ ...formData, revenueGoal: e.target.value })}
              disabled={isLoading}
              className="rounded-lg border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-9 placeholder:text-muted-foreground/70"
            />
          </div>

          {/* 创始人故事 */}
          <div className="space-y-2">
            <Label htmlFor="founderStory" className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              创始人故事
            </Label>
            <Textarea
              id="founderStory"
              placeholder="例如：我曾经也是美业从业者，深知创业的艰辛..."
              value={formData.founderStory || ""}
              onChange={(e) => setFormData({ ...formData, founderStory: e.target.value })}
              disabled={isLoading}
              rows={3}
              className="rounded-lg border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none placeholder:text-muted-foreground/70"
            />
          </div>

          {/* 信任背书 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">信任背书</Label>
            <div className="flex gap-2">
              <Input
                placeholder="例如：成功案例、专业认证"
                value={strengthInput}
                onChange={(e) => setStrengthInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addStrength())}
                disabled={isLoading}
                className="rounded-lg border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-9 flex-1 placeholder:text-muted-foreground/70"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addStrength}
                disabled={isLoading}
                className="rounded-lg hover:bg-zinc-100 transition-all duration-200 px-4 h-9"
              >
                添加
              </Button>
            </div>
            {formData.strengths && formData.strengths.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.strengths.map((strength) => (
                  <span
                    key={strength}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-blue-50 to-purple-50 text-zinc-700 dark:text-zinc-200 rounded-md text-xs font-medium border border-blue-100 hover:border-blue-200 transition-all duration-200"
                  >
                    {strength}
                    <button
                      type="button"
                      onClick={() => removeStrength(strength)}
                      className="hover:text-red-500 transition-colors duration-200"
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
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-zinc-500 dark:text-zinc-400">或者上传参考文档</span>
            </div>
          </div>

          {/* 文件上传 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              参考文档上传
              <span className="text-blue-600 font-normal ml-2">（推荐）</span>
            </Label>

            {/* 文件上传区域 */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={isLoading || uploading}
                accept=".pdf,.doc,.docx,.txt,.md"
                className="hidden"
                id="file-upload"
              />
            </div>

            {/* 上传状态显示 */}
            {!file ? (
              // 未选择文件状态
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                  transition-all duration-200
                  ${
                    isLoading || uploading
                      ? "border-zinc-200 dark:border-zinc-800 bg-zinc-50 cursor-not-allowed"
                      : "border-blue-300 bg-blue-50/30 hover:border-blue-500 hover:bg-blue-50/50"
                  }
                `}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
                  {uploading ? "上传中..." : "点击上传参考文档"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">支持 PDF、Word、TXT、MD 格式，最大 10MB</p>
              </div>
            ) : (
              // 已选择文件状态
              <div className="flex items-center gap-3 p-3 bg-linear-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="bg-linear-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                  <File className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 truncate">{file.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : formData.file_id ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-xs">已上传</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors duration-200"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-zinc-500 dark:text-zinc-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            )}

            {/* 上传错误提示 */}
            {uploadError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {uploadError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || (!formData.file_id && !formData.niche.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在深度思考...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                {formData.file_id ? "基于文档生成战略" : "生成战略"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
