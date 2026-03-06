/**
 * Script Draft Form
 * Form component for the Content Factory module
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ScriptDraftInput } from "@/types/db";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ScriptFormProps {
  onSubmit: (data: ScriptDraftInput) => void;
  isLoading?: boolean;
}

export function ScriptForm({ onSubmit, isLoading = false }: ScriptFormProps) {
  const [formData, setFormData] = useState<ScriptDraftInput>({
    topic: "",
    duration: 60,
    platform: "douyin",
    content_type: "entertainment",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">脚本生成器</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          使用 AI 写手-审稿循环生成引人入胜的视频脚本
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div className="space-y-2.5">
            <Label
              htmlFor="topic"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              视频主题 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="topic"
              placeholder="例如：如何在家冲煮一杯完美的咖啡"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
              rows={4}
              disabled={isLoading}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
            />
          </div>

          {/* Platform Selection */}
          <div className="space-y-2.5">
            <Label
              htmlFor="platform"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              平台 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.platform}
              onValueChange={(value) =>
                setFormData({ ...formData, platform: value as ScriptDraftInput["platform"] })
              }
              disabled={isLoading}
            >
              <SelectTrigger
                id="platform"
                className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 h-11"
              >
                <SelectValue placeholder="选择平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="douyin">抖音 (Douyin)</SelectItem>
                <SelectItem value="xiaohongshu">小红书 (Xiaohongshu)</SelectItem>
                <SelectItem value="weibo">微博 (Weibo)</SelectItem>
                <SelectItem value="generic">通用 (Generic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content Type Selection */}
          <div className="space-y-2.5">
            <Label
              htmlFor="content_type"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              内容类型 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  content_type: value as ScriptDraftInput["content_type"],
                })
              }
              disabled={isLoading}
            >
              <SelectTrigger
                id="content_type"
                className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 h-11"
              >
                <SelectValue placeholder="选择内容类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="educational">知识科普</SelectItem>
                <SelectItem value="entertainment">娱乐搞笑</SelectItem>
                <SelectItem value="promotional">产品推广</SelectItem>
                <SelectItem value="story">故事叙述</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Duration Input */}
          <div className="space-y-2.5">
            <Label
              htmlFor="duration"
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              目标时长（秒）
            </Label>
            <Input
              id="duration"
              type="number"
              min="15"
              max="300"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })
              }
              disabled={isLoading}
              className="rounded-xl border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 h-11"
            />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              💡 建议：抖音 30-60 秒，小红书 60-120 秒
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            disabled={isLoading || !formData.topic.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                正在生成脚本...
              </>
            ) : (
              <>
                <span className="mr-2">🎬</span>
                生成脚本
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
