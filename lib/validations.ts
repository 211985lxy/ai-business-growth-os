/**
 * Zod Validation Schemas
 * 运行时类型验证，确保用户输入的数据符合预期
 */

import { z } from "zod";

/**
 * Strategy Research Form Schema
 * 用于战略研究中心的表单验证
 */
export const strategyResearchSchema = z.object({
  goal: z.string().min(10, "商业目标至少需要 10 个字符").max(1000, "商业目标不能超过 1000 个字符"),
  timeframe: z.string().optional(),
  budget: z.string().optional(),
  focus_areas: z.array(z.string()).optional(),
});

/**
 * Script Draft Form Schema
 * 用于内容工场的脚本生成表单验证
 */
export const scriptDraftSchema = z.object({
  topic: z.string().min(5, "主题至少需要 5 个字符").max(500, "主题不能超过 500 个字符"),
  duration: z
    .number()
    .int("时长必须是整数")
    .min(15, "视频时长最少 15 秒")
    .max(300, "视频时长最多 300 秒（5分钟）")
    .optional(),
  platform: z.enum(["douyin", "xiaohongshu", "weibo", "generic"], {
    message: "请选择有效的平台",
  }),
  content_type: z.enum(["educational", "entertainment", "promotional", "story"], {
    message: "请选择有效的内容类型",
  }),
});

/**
 * XHS Generator Form Schema
 * 用于小红书生成器的表单验证
 */
export const xhsGeneratorSchema = z.object({
  source_content: z
    .string()
    .min(50, "源内容至少需要 50 个字符")
    .max(5000, "源内容不能超过 5000 个字符"),
  include_emoji: z.boolean().optional(),
  hashtag_count: z
    .number()
    .int("标签数量必须是整数")
    .min(1, "至少需要 1 个标签")
    .max(20, "最多支持 20 个标签")
    .optional(),
  target_engagement: z.enum(["high", "medium", "low"]).optional(),
});

/**
 * Brand Asset Schemas
 * 用于品牌资产管理的表单验证
 */

// Persona 品牌人设
export const personaAssetSchema = z.object({
  tone: z.string().min(1, "请输入语调风格"),
  values: z.array(z.string()).min(1, "至少需要一个价值观"),
  voice: z.string().min(1, "请输入声音风格"),
  expertise: z.array(z.string()).optional(),
  personality: z.string().optional(),
});

// Product Selling Points 产品卖点
export const productAssetSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string().min(1, "请输入产品名称"),
        tagline: z.string().min(1, "请输入产品标语"),
        features: z.array(z.string()).min(1, "至少需要一个特性"),
        benefits: z.array(z.string()).min(1, "至少需要一个优势"),
        differentiators: z.array(z.string()).min(1, "至少需要一个差异化点"),
        price_range: z.string().optional(),
        target_market: z.string().optional(),
      })
    )
    .min(1, "至少需要一个产品"),
});

// Target Audience 目标受众
export const audienceAssetSchema = z.object({
  demographics: z.object({
    age_range: z.string().optional(),
    gender: z.string().optional(),
    location: z.string().optional(),
    income_level: z.string().optional(),
    education: z.string().optional(),
    occupation: z.array(z.string()).optional(),
  }),
  psychographics: z.object({
    interests: z.array(z.string()).optional(),
    values: z.array(z.string()).optional(),
    pain_points: z.array(z.string()).optional(),
    goals: z.array(z.string()).optional(),
    fears: z.array(z.string()).optional(),
  }),
  behaviors: z.object({
    preferred_platforms: z.array(z.string()).optional(),
    content_consumption: z.array(z.string()).optional(),
    purchase_factors: z.array(z.string()).optional(),
  }),
});

// Writing Style 写作风格
export const writingStyleAssetSchema = z.object({
  style: z.string().min(1, "请输入写作风格"),
  tone: z.string().min(1, "请输入语调"),
  structure: z.string().min(1, "请输入内容结构"),
  language: z.object({
    formality: z.enum(["formal", "casual", "mixed"]),
    use_emoji: z.boolean(),
    use_hashtags: z.boolean(),
    preferred_phrases: z.array(z.string()).optional(),
    avoided_phrases: z.array(z.string()).optional(),
  }),
  formatting: z.object({
    use_bullets: z.boolean(),
    paragraph_length: z.enum(["short", "medium", "long"]),
    cta_style: z.string().optional(),
  }),
});

// 从 schema 推断 TypeScript 类型
export type StrategyResearchForm = z.infer<typeof strategyResearchSchema>;
export type ScriptDraftForm = z.infer<typeof scriptDraftSchema>;
export type XHSGeneratorForm = z.infer<typeof xhsGeneratorSchema>;
export type PersonaAssetForm = z.infer<typeof personaAssetSchema>;
export type ProductAssetForm = z.infer<typeof productAssetSchema>;
export type AudienceAssetForm = z.infer<typeof audienceAssetSchema>;
export type WritingStyleAssetForm = z.infer<typeof writingStyleAssetSchema>;
