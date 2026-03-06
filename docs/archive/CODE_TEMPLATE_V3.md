# 六脉蜂群 - Agent配置代码模板（v3.0）

> 基于重新定义的六脉：战略、产品、模式、内容、转化、风险
> 2026年3月2日更新

---

## 一、Agent类型定义

```typescript
// lib/swarm/agent-types.ts

/**
 * 六脉Agent类型（2026.03重新定义）
 *
 * 核心逻辑：
 * - 天道·战略：方向在哪？（定位）
 * - 地利·产品：产品是啥？（产品矩阵）
 * - 人和·模式：团结谁、对抗谁？（商业模式）
 * - 神韵·内容：内容即流量（品牌IP）
 * - 财帛·转化：怎么赚钱？（变现路径）
 * - 法度·风险：什么不能做？（合规边界）
 */
export type AgentType =
  | "Queen"            // 女王Agent（任务分解、协调）
  | "天道·战略"          // 战略定位与方向
  | "地利·产品"          // 产品定义与矩阵
  | "人和·模式"          // 商业模式与生态
  | "神韵·内容"          // 品牌IP与内容生产
  | "财帛·转化"          // 变现路径与定价
  | "法度·风险";         // 合规审查与边界

/**
 * Agent能力描述
 */
export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  examples: string[];
}

/**
 * Agent配置
 */
export interface AgentConfig {
  agentId: AgentType;
  apiKeyEnv: string;
  description: string;
  difyWorkflowId?: string;
  requiresStrategyContext: boolean;
  requiresProductContext: boolean;
  capabilities: AgentCapability[];
}
```

---

## 二、Agent配置表

```typescript
// lib/swarm/agent-config.ts

/**
 * 六脉Agent配置表
 *
 * 更新说明：
 * 1. 地道·产业 → 地利·产品（核心是产品，产品足够长就是产业）
 * 2. 人道·流量 → 人和·模式（核心是商业模式：团结谁、对抗谁）
 * 3. 神韵·内容更强调（内容时代，内容即流量）
 */
export const AGENT_CONFIG: Record<AgentType, AgentConfig> = {
  Queen: {
    agentId: "Queen",
    apiKeyEnv: "DIFY_QUEEN_KEY",
    description: "女王Agent - 任务分解、协调、决策",
    requiresStrategyContext: false,
    requiresProductContext: false,
    capabilities: [
      {
        name: "task_decomposition",
        description: "理解用户意图，分解为Agent任务",
        inputSchema: {
          type: "object",
          properties: {
            userQuery: { type: "string" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                agentId: { type: "string" },
                task: { type: "string" },
                dependencies: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
        examples: [
          "我想做美业培训",
          "如何从0到100万营收？",
          "我的产品如何定价？",
        ],
      },
      {
        name: "result_synthesis",
        description: "整合多个Agent的输出，生成综合报告",
        inputSchema: {
          type: "object",
          properties: {
            agentResults: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            details: { type: "object" },
            recommendations: { type: "array", items: { type: "string" } },
            confidence: { type: "number" },
          },
        },
        examples: [],
      },
    ],
  },

  // ========================================
  // 天道·战略（天）
  // ========================================
  "天道·战略": {
    agentId: "天道·战略",
    apiKeyEnv: "DIFY_STRATEGY_KEY",
    description: "天道·战略 - 方向在哪？（定位）",
    requiresStrategyContext: false,
    requiresProductContext: false,
    capabilities: [
      {
        name: "analyze_niche",
        description: "分析赛道定位与差异化",
        inputSchema: {
          type: "object",
          properties: {
            niche: { type: "string", description: "赛道描述" },
            revenueGoal: { type: "string", description: "营收目标" },
            founderStory: { type: "string", description: "创始人故事" },
            strengths: { type: "array", items: { type: "string" }, description: "核心优势" },
          },
          required: ["niche"],
        },
        outputSchema: {
          type: "object",
          properties: {
            positioning: { type: "string", description: "定位" },
            differentiation: { type: "string", description: "差异化" },
            targetAudience: { type: "string", description: "目标用户" },
            roadmap: { type: "array", items: { type: "string" }, description: "路线图" },
          },
        },
        examples: [
          "美业培训如何差异化定位？",
          "餐饮B2B的赛道分析",
          "从0到100万的战略路径",
        ],
      },
    ],
  },

  // ========================================
  // 地利·产品（地）
  // ========================================
  "地利·产品": {
    agentId: "地利·产品",
    apiKeyEnv: "DIFY_PRODUCT_KEY",
    description: "地利·产品 - 产品是啥？（产品矩阵）",
    requiresStrategyContext: true,   // 需要战略定位
    requiresProductContext: false,
    capabilities: [
      {
        name: "define_product",
        description: "定义产品与产品矩阵",
        inputSchema: {
          type: "object",
          properties: {
            positioning: { type: "string", description: "战略定位" },
            currentProduct: { type: "string", description: "现有产品" },
            targetRevenue: { type: "string", description: "营收目标" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            coreProduct: { type: "string", description: "核心产品" },
            productMatrix: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  timing: { type: "string" },
                  revenuePotential: { type: "string" },
                },
              },
              description: "产品矩阵（单一爆品 → 产品线 → 产业链）",
            },
            moat: { type: "string", description: "产品护城河" },
          },
        },
        examples: [
          "如何从单一课程扩展到产品矩阵？",
          "美业培训的产品线设计",
          "什么产品能形成产业壁垒？",
        ],
      },
    ],
  },

  // ========================================
  // 人和·模式（人）
  // ========================================
  "人和·模式": {
    agentId: "人和·模式",
    apiKeyEnv: "DIFY_MODEL_KEY",
    description: "人和·模式 - 团结谁、对抗谁？（商业模式）",
    requiresStrategyContext: true,   // 需要战略定位
    requiresProductContext: true,    // 需要产品定义
    capabilities: [
      {
        name: "design_business_model",
        description: "设计商业模式与生态",
        inputSchema: {
          type: "object",
          properties: {
            positioning: { type: "string", description: "定位" },
            coreProduct: { type: "string", description: "核心产品" },
            targetRevenue: { type: "string", description: "营收目标" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            businessModel: {
              type: "object",
              properties: {
                revenueStreams: {
                  type: "array",
                  items: { type: "string" },
                  description: "收入来源（产品/服务/广告/数据）",
                },
                customerSegments: {
                  type: "array",
                  items: { type: "string" },
                  description: "客户细分",
                },
                channels: {
                  type: "array",
                  items: { type: "string" },
                  description: "获客渠道",
                },
              },
            },
            allies: {
              type: "array",
              items: { type: "string" },
              description: "潜在盟友（可以团结的伙伴）",
            },
            competitors: {
              type: "array",
              items: { type: "string" },
              description: "竞争对手与对抗策略",
            },
            ecosystem: {
              type: "string",
              description: "生态设计（如何团结更多人）",
            },
          },
        },
        examples: [
          "如何设计一个能团结更多人的商业模式？",
          "美业培训的盟友是谁？竞争对手是谁？",
          "如何从单点生意扩展到生态?",
        ],
      },
    ],
  },

  // ========================================
  // 神韵·内容（神）
  // ========================================
  "神韵·内容": {
    agentId: "神韵·内容",
    apiKeyEnv: "DIFY_CONTENT_KEY",
    description: "神韵·内容 - 内容即流量（品牌IP）",
    requiresStrategyContext: true,   // 需要战略定位
    requiresProductContext: true,    // 需要产品定义
    capabilities: [
      {
        name: "build_brand_ip",
        description: "打造品牌IP与内容生产系统",
        inputSchema: {
          type: "object",
          properties: {
            positioning: { type: "string", description: "定位" },
            coreProduct: { type: "string", description: "核心产品" },
            targetAudience: { type: "string", description: "目标用户" },
            tone: { type: "string", description: "品牌调性" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            brandPersona: {
              type: "string",
              description: "品牌人设（专家/朋友/导师？）",
            },
            contentMatrix: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", description: "平台（小红书/抖音/公众号）" },
                  contentType: { type: "string", description: "内容类型（图文/视频/直播）" },
                  frequency: { type: "string", description: "频率" },
                  topics: {
                    type: "array",
                    items: { type: "string" },
                    description: "内容主题",
                  },
                },
              },
              description: "内容矩阵",
            },
            contentExamples: {
              type: "array",
              items: { type: "string" },
              description: "内容示例（直接可用）",
            },
          },
        },
        examples: [
          "美业培训如何打造品牌IP？",
          "小红书内容生产系统",
          "如何用内容获取免费流量？",
        ],
      },
    ],
  },

  // ========================================
  // 财帛·转化（财）
  // ========================================
  "财帛·转化": {
    agentId: "财帛·转化",
    apiKeyEnv: "DIFY_MONEY_KEY",
    description: "财帛·转化 - 怎么赚钱？（变现路径）",
    requiresStrategyContext: true,
    requiresProductContext: true,
    capabilities: [
      {
        name: "design_monetization",
        description: "设计变现路径与定价策略",
        inputSchema: {
          type: "object",
          properties: {
            coreProduct: { type: "string", description: "核心产品" },
            businessModel: { type: "object", description: "商业模式" },
            targetRevenue: { type: "string", description: "营收目标" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            monetizationPath: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string", description: "阶段" },
                  product: { type: "string", description: "产品" },
                  price: { type: "string", description: "定价" },
                  conversion: { type: "string", description: "转化策略" },
                },
              },
              description: "变现路径（免费→低价→中价→高价）",
            },
            pricingStrategy: {
              type: "object",
              properties: {
                approach: { type: "string", description: "定价方法（成本/价值/竞争）" },
                tiers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "number" },
                      target: { type: "string" },
                      features: { type: "array", items: { type: "string" } },
                    },
                  },
                  description: "价格阶梯",
                },
              },
            },
            funnel: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stage: { type: "string" },
                  conversionRate: { type: "number" },
                  actions: { type: "array", items: { type: "string" } },
                },
              },
              description: "转化漏斗",
            },
            ltvStrategy: {
              type: "string",
              description: "客户终身价值（LTV）策略",
            },
          },
        },
        examples: [
          "如何设计从免费到付费的转化路径？",
          "美业培训的定价策略",
          "如何提高客户复购率？",
        ],
      },
    ],
  },

  // ========================================
  // 法度·风险（法）
  // ========================================
  "法度·风险": {
    agentId: "法度·风险",
    apiKeyEnv: "DIFY_LAW_KEY",
    description: "法度·风险 - 什么不能做？（合规边界）",
    requiresStrategyContext: false,
    requiresProductContext: false,
    capabilities: [
      {
        name: "risk_assessment",
        description: "合规审查与风险控制",
        inputSchema: {
          type: "object",
          properties: {
            content: { type: "string", description: "需要审查的内容" },
            platform: { type: "string", description: "发布平台" },
            context: { type: "string", description: "业务场景" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string", description: "风险类别（广告法/平台规则/法律）" },
                  severity: { type: "string", description: "严重程度（高/中/低）" },
                  issue: { type: "string", description: "问题描述" },
                  recommendation: { type: "string", description: "建议修改" },
                },
              },
              description: "风险清单",
            },
            compliance: {
              type: "array",
              items: { type: "string" },
              description: "合规建议",
            },
            approved: {
              type: "boolean",
              description: "是否通过审查",
            },
          },
        },
        examples: [
          "这个文案违反广告法吗？",
          "小红书发布需要注意什么？",
          "如何避免夸大宣传？",
        ],
      },
    ],
  },
};
