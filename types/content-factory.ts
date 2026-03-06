// ============================================================================
// Content Factory Types
// 内容工厂相关类型定义
// ============================================================================

// 模式类型
export type ContentFactoryMode = "search" | "create" | "insights" | "plan";

// 内容类目
export type ContentCategory =
  | "personal-story"
  | "business-showcase"
  | "problem-solving"
  | "opinion-sharing"
  | "themed-series";

// 内容子类型
export type ContentSubType = string;

// 平台类型
export type Platform = "xiaohongshu" | "douyin" | "wechat" | "shipinhao";

// 选题洞察报告
export interface TopicReport {
  id: string;
  user_id: string;
  keyword: string;
  top_articles: TopArticle[];
  insights: TopicInsight[];
  word_cloud: WordCloudItem[];
  created_at: string;
  updated_at: string;
}

// Top 爆款文章
export interface TopArticle {
  title: string;
  url: string;
  likes: number;
  comments: number;
  shares: number;
  summary: string;
}

// 选题建议
export interface TopicInsight {
  id: string;
  title: string;
  description: string;
  reason: string;
  potential_score: number;
}

// 词云数据
export interface WordCloudItem {
  word: string;
  weight: number;
}

// 文章状态
export type ArticleStatus = "draft" | "published";

// 生成的文章
export interface Article {
  id: string;
  user_id: string;
  title: string;
  content: string;
  images: string[];
  status: ArticleStatus;
  platform: Platform;
  topic_report_id?: string;
  category?: ContentCategory;
  sub_type?: ContentSubType;
  metadata: {
    identity?: string;
    brand_voice?: string;
    extra_context?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// 搜索模式输入
export interface SearchModeInput {
  keyword: string;
}

// 创作模式输入
export interface CreateModeInput {
  category: ContentCategory;
  sub_type: ContentSubType;
  identity: string;
  topic: string;
  brand_voice?: string;
  extra_context?: string;
  topic_report_id?: string; // 从选题报告导入
}

// 发布模式输入
export interface PublishModeInput {
  article_id: string;
  platform: Platform;
  scheduled_at?: string;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  type: "topic_report" | "article";
  title: string;
  created_at: string;
  mode: ContentFactoryMode;
}
