/**
 * Content Form Types & Constants
 * 提取类型定义和常量配置
 */

import { Video, FileText, Sparkles, Compass, Edit3 } from "lucide-react";

// 内容类型定义
export type ContentType = "video-script" | "article" | "social-post" | "ip-story" | "product-copy";
export type Platform = "xiaohongshu" | "douyin" | "wechat" | "weibo" | "general";

// 战略上下文接口
export interface StrategyContext {
  niche: string;
  revenueGoal?: string;
  founderStory?: string;
  strengths?: string[];
  outputContent?: string;
  generatedAt: string;
}

// 内容生成输入接口
export interface ContentGenerationInput {
  // 战略参数
  niche: string;
  revenueGoal?: string;
  founderStory?: string;
  strengths?: string[];

  // 内容参数
  contentType: ContentType;
  platform?: Platform;
  targetAudience?: string;
  contentGoal?: string;
  brandVoice?: string;
  keywords?: string[];
  customPrompt?: string;
}

export interface ContentFormLightProps {
  onSubmit: (data: ContentGenerationInput) => void;
  isLoading?: boolean;
  strategyContext?: StrategyContext | null;
  onRegenerateStrategy?: () => void;
}

// 内容类型配置
export const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  icon: any;
  description: string;
}[] = [
  { value: "video-script", label: "视频脚本", icon: Video, description: "短视频、长视频拍摄脚本" },
  { value: "article", label: "深度文章", icon: FileText, description: "公众号、博客长文" },
  { value: "social-post", label: "社交媒体", icon: Sparkles, description: "小红书、朋友圈文案" },
  { value: "ip-story", label: "IP 故事", icon: Compass, description: "创始人/品牌 IP 叙事" },
  { value: "product-copy", label: "产品文案", icon: Edit3, description: "产品介绍、卖点提炼" },
];

// 平台配置
export const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: "xiaohongshu", label: "小红书", color: "red" },
  { value: "douyin", label: "抖音", color: "slate" },
  { value: "wechat", label: "微信", color: "green" },
  { value: "weibo", label: "微博", color: "blue" },
  { value: "general", label: "通用", color: "purple" },
];
