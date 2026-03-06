/**
 * News Radar API Route
 * 代理 ai-news-radar 数据源，支持关键词过滤和 AI 潜力打分
 *
 * 数据来源: https://github.com/LearnPrompt/ai-news-radar
 * JSON 格式: { items: [{ title, title_zh, url, site, time, tags }] }
 *
 * 使用方式:
 *   GET /api/news-radar?keyword=AI&limit=10
 */

import { NextRequest } from "next/server";

// ai-news-radar 输出的 JSON 结构
interface NewsItem {
  title: string;
  title_zh?: string;
  url: string;
  site?: string;
  time?: string;
  tags?: string[];
  score?: number;
  description?: string;
}

interface NewsRadarData {
  items: NewsItem[];
  generated_at?: string;
  window_hours?: number;
}

// 数据源：可以用你自己 fork 后的仓库替换
const NEWS_RADAR_URL =
  process.env.NEWS_RADAR_JSON_URL ||
  "https://raw.githubusercontent.com/LearnPrompt/ai-news-radar/main/data/latest-24h.json";

// 潜力关键词权重（用于打分）
const HIGH_VALUE_KEYWORDS = [
  "AI",
  "人工智能",
  "ChatGPT",
  "GPT",
  "Claude",
  "大模型",
  "创业",
  "增长",
  "变现",
  "副业",
  "流量",
  "私域",
  "用户",
  "转化",
  "ROI",
  "爆款",
  "病毒",
  "裂变",
  "出圈",
  "涨粉",
  "热门",
  "趋势",
];

/**
 * 计算文章潜力分（0-100）
 * 综合考虑：关键词匹配度 + 时效性 + 标题长度
 */
function calcPotentialScore(item: NewsItem, keyword: string): number {
  let score = 50; // 基础分

  const titleText = `${item.title} ${item.title_zh ?? ""}`.toLowerCase();
  const kw = keyword.toLowerCase();

  // 关键词精确匹配 +20
  if (titleText.includes(kw)) score += 20;

  // 高价值词命中 +5 each (max 20)
  const hitCount = HIGH_VALUE_KEYWORDS.filter((w) => titleText.includes(w.toLowerCase())).length;
  score += Math.min(hitCount * 5, 20);

  // 标题长度适中 (15-40字) +5
  const zhTitle = item.title_zh ?? item.title;
  if (zhTitle.length >= 15 && zhTitle.length <= 40) score += 5;

  // 有来源信息 +5
  if (item.site) score += 5;

  return Math.min(score, 100);
}

/**
 * 根据文章标题生成选题建议
 * 简单的模板生成（可升级为 Dify AI 分析）
 */
function generateInsightFromArticle(item: NewsItem, keyword: string, index: number) {
  const title = item.title_zh ?? item.title;

  const templates = [
    {
      suffix: "的真相与误区",
      description: "纠正行业常见错误认知，帮助受众建立正确方法论",
      reason: "纠偏类内容容易引发共鸣和转发，适合作为破圈选题",
    },
    {
      suffix: "的底层逻辑",
      description: "深入讲解背后的运作原理，建立知识权威感",
      reason: "深度知识型内容在专业群体中广泛传播，打造 IP 信任度",
    },
    {
      suffix: "的 3 个关键转变",
      description: "从个人视角分享亲历的认知迭代过程",
      reason: "成长故事 + 数字化标题，完播率和互动率双高",
    },
    {
      suffix: "如何影响普通人",
      description: "将专业趋势与日常生活场景结合，降低理解门槛",
      reason: "接地气的选题更容易打动非专业受众，扩大传播面",
    },
    {
      suffix: "的机遇与挑战",
      description: "分析趋势机会，为受众提供可操作的行动建议",
      reason: "机会型内容在创业/职场类受众中分享率极高",
    },
  ];

  const template = templates[index % templates.length];
  const score = item.score ?? 80;

  return {
    id: String(index + 1),
    title: `${keyword}${template.suffix}`,
    description: template.description,
    reason: template.reason,
    potential_score: score,
    source_url: item.url,
    source_title: title,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "8", 10), 20);

  // ── 请求 ai-news-radar JSON ──────────────────────────────────────────────
  let rawData: NewsRadarData;
  try {
    const resp = await fetch(NEWS_RADAR_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (ai-business-growth-os/1.0)",
        Accept: "application/json",
      },
      // Next.js 缓存 30 分钟（与数据刷新间隔一致）
      next: { revalidate: 1800 },
    });

    if (!resp.ok) {
      throw new Error(`GitHub 返回 ${resp.status}`);
    }

    rawData = await resp.json();
  } catch (err) {
    return Response.json(
      {
        error: `无法获取热点数据：${err instanceof Error ? err.message : String(err)}`,
        fallback: true,
      },
      { status: 502 }
    );
  }

  const allItems: NewsItem[] = rawData.items ?? [];

  // ── 关键词过滤 + 打分 ─────────────────────────────────────────────────────
  const scored = allItems
    .filter((item) => {
      if (!keyword) return true; // 无关键词时返回全部
      const text =
        `${item.title} ${item.title_zh ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      return text.includes(keyword.toLowerCase());
    })
    .map((item) => ({
      ...item,
      score: calcPotentialScore(item, keyword),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

  // ── 生成 AI 选题建议 ──────────────────────────────────────────────────────
  // 取前 5 篇文章作为 context 生成选题
  const insightSources = scored.slice(0, 5);
  const insights = insightSources.map((item, i) =>
    generateInsightFromArticle(item, keyword || "AI", i)
  );

  return Response.json({
    keyword,
    total: allItems.length,
    filtered: scored.length,
    generated_at: rawData.generated_at,
    articles: scored.map((item) => ({
      title: item.title_zh ?? item.title,
      title_en: item.title,
      url: item.url,
      site: item.site ?? "未知来源",
      time: item.time,
      score: item.score,
      tags: item.tags ?? [],
    })),
    insights,
  });
}
