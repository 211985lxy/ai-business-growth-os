# OpenClaw 传感器接入方案

> 通过 OpenClow 让 Agent 拥有"眼睛"，接入真实世界数据
>
> ——— 2026年3月2日 ——— v1.0

---

## 📋 目录

1. [传感器架构](#传感器架构)
2. [传感器类型](#传感器类型)
3. [接入实现](#接入实现)
4. [实时数据流](#实时数据流)
5. [示例场景](#示例场景)

---

## 一、传感器架构

### 1.1 架构图

```
┌─────────────────────────────────────────────────────┐
│                   六脉 Agent                         │
│                      ↓                              │
│            [Sensor Manager (传感器管理器)]            │
│                      ↓                              │
│    ┌─────────────┬─────────────┬──────────────┐      │
│    ↓             ↓             ↓              ↓      │
│  [API Sensor]  [Scraper Sensor]  [DB Sensor]   │      │
│    ↓             ↓             ↓              ↓      │
│  OpenClaw 网关  OpenClaw 网关   OpenClaw 网关         │
└─────────────────────────────────────────────────────┘
```

### 1.2 OpenClow 网关配置

```typescript
// lib/openclaw/gateway.ts

/**
 * OpenClow 网关配置
 *
 * 用于通过 OpenClow 接入外部传感器
 */

export interface OpenClowGatewayConfig {
  // 网关地址
  gatewayUrl: string;

  // API 密钥
  apiKey: string;

  // 传感器路由
  sensorRoutes: {
    [sensorName: string]: string; // sensorName -> endpoint
  };
}

// 传感器路由配置
const SENSOR_ROUTES: OpenClowGatewayConfig["sensorRoutes"] = {
  // 法度·风险传感器
  "行业法规查询": "/openclaw/sensors/law/search",
  "竞品暴雷新闻": "/openclaw/sensors/news/scrape",
  "广告法违禁词": "/openclaw/sensors/risk/keywords",

  // 财帛·转化传感器
  "广告成本查询": "/openclaw/sensors/ad/cost",
  "竞品定价": "/openclaw/sensors/competitor/price",
  "汇率查询": "/openclaw/sensors/finance/rate",

  // 天道·战略传感器
  "市场规模": "/openclaw/sensors/market/size",
  "行业趋势": "/openclaw/sensors/industry/trend",

  // 人和·模式传感器
  "招聘数据": "/openclaw/sensors/hr/jobs",
  "薪资水平": "/openclaw/sensors/hr/salary",
};
```

---

## 二、传感器类型

### 2.1 API 传感器（实时查询）

**用途：** 调用外部 API 获取实时数据

```typescript
// lib/openclaw/sensors/api-sensor.ts

/**
 * API 传感器基类
 */

export interface ApiSensorConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export class ApiSensor {
  private config: ApiSensorConfig;

  constructor(config: ApiSensorConfig) {
    this.config = config;
  }

  /**
   * 查询传感器
   */
  async query(params: Record<string, any>): Promise<any> {
    const url = new URL(this.config.baseUrl);
    Object.keys(params).forEach(key =>
      url.searchParams.append(key, String(params[key]))
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && {
          "Authorization": `Bearer ${this.config.apiKey}`,
        }),
        ...this.config.headers,
      },
      signal: AbortSignal.timeout(10000), // 10秒超时
    });

    if (!response.ok) {
      throw new Error(`Sensor query failed: ${response.status}`);
    }

    return await response.json();
  }
}
```

### 2.2 Scraper 传感器（网页抓取）

**用途：** 从网页抓取公开数据

```typescript
// lib/openclaw/sensors/scraper-sensor.ts

/**
 * Scraper 传感器
 *
 * 通过 OpenClow 的网页抓取能力获取数据
 */

export class ScraperSensor {
  private openclawUrl: string;
  private apiKey: string;

  constructor(openclawUrl: string, apiKey: string) {
    this.openclawUrl = openclawUrl;
    this.apiKey = apiKey;
  }

  /**
   * 抓取网页内容
   */
  async scrape(url: string, selector?: string): Promise<any> {
    const response = await fetch(`${this.openclawUrl}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        url,
        selector,
        extract_type: "content",
      }),
      signal: AbortSignal.timeout(30000), // 30秒超时
    });

    if (!response.ok) {
      throw new Error(`Scrape failed: ${response.status}`);
    }

    return await response.json();
  }
}
```

### 2.3 Database 传感器（数据库查询）

**用途：** 从本地或远程数据库查询数据

```typescript
// lib/openclaw/sensors/db-sensor.ts

/**
 * Database 传感器
 *
 * 查询本地数据库（如 Supabase）中的历史数据
 */

import { createClient } from "@/lib/supabase/server";

export class DatabaseSensor {
  /**
   * 查询广告成本历史数据
   */
  async queryAdCost(platform: string, days: number = 30) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("ad_costs_history")
      .select("*")
      .eq("platform", platform)
      .gte("date", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order("date", { ascending: false })
      .limit(100);

    if (error) throw error;

    return data;
  }

  /**
   * 查询竞品定价历史
   */
  async queryCompetitorPricing(competitorId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("competitor_pricing")
      .select("*")
      .eq("competitor_id", competitorId)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return data;
  }
}
```

---

## 三、接入实现

### 3.1 传感器管理器

```typescript
// lib/openclaw/sensor-manager.ts

/**
 * 传感器管理器
 *
 * 统一管理所有传感器，提供统一的查询接口
 */

import { ApiSensor } from "./sensors/api-sensor";
import { ScraperSensor } from "./sensors/scraper-sensor";
import { DatabaseSensor } from "./sensors/db-sensor";

export class SensorManager {
  private apiSensors: Map<string, ApiSensor> = new Map();
  private scraperSensor: ScraperSensor;
  private dbSensor: DatabaseSensor;

  constructor(openclawUrl: string, apiKey: string) {
    // 初始化 Scraper 传感器
    this.scraperSensor = new ScraperSensor(openclawUrl, apiKey);

    // 初始化 Database 传感器
    this.dbSensor = new DatabaseSensor();
  }

  /**
   * 注册 API 传感器
   */
  registerApiSensor(name: string, config: ApiSensorConfig) {
    const sensor = new ApiSensor(config);
    this.apiSensors.set(name, sensor);
  }

  /**
   * 统一查询接口
   */
  async query(
    sensorName: string,
    params: Record<string, any>
  ): Promise<any> {
    console.log(`[Sensor] Querying: ${sensorName}`, params);

    // 根据传感器名称路由到不同的传感器类型
    if (sensorName.includes("查询") || sensorName.includes("API")) {
      // API 传感器
      const sensor = this.apiSensors.get(sensorName);
      if (!sensor) {
        throw new Error(`API Sensor not found: ${sensorName}`);
      }
      return await sensor.query(params);
    } else if (sensorName.includes("抓取") || sensorName.includes("网页")) {
      // Scraper 传感器
      return await this.scraperSensor.scrape(params.url, params.selector);
    } else if (sensorName.includes("历史") || sensorName.includes("数据库")) {
      // Database 传感器
      if (sensorName.includes("广告成本")) {
        return await this.dbSensor.queryAdCost(params.platform, params.days);
      } else if (sensorName.includes("竞品定价")) {
        return await this.dbSensor.queryCompetitorPricing(params.competitorId);
      }
    }

    throw new Error(`Unknown sensor: ${sensorName}`);
  }

  /**
   * 批量查询多个传感器
   */
  async queryMultiple(
    queries: Array<{ sensorName: string; params: Record<string, any> }>
  ): Promise<Map<string, any>> {
    const results = new Map();

    // 并行查询
    await Promise.all(
      queries.map(async ({ sensorName, params }) => {
        try {
          const result = await this.query(sensorName, params);
          results.set(sensorName, result);
        } catch (error) {
          console.error(`[Sensor] Query failed: ${sensorName}`, error);
          results.set(sensorName, { error: error.message });
        }
      })
    );

    return results;
  }
}
```

### 3.2 环境配置

```bash
# .env.local

# OpenClow 配置
OPENCLAW_GATEWAY_URL=https://gateway.openclaw.com
OPENCLAW_API_KEY=your_openclaw_api_key

# 外部 API 密钥
LAW_API_KEY=your_law_api_key            # 法律法规 API
NEWS_API_KEY=your_news_api_key          # 新闻 API
AD_COST_API_KEY=your_ad_cost_api_key    # 广告成本 API
```

---

## 四、实时数据流

### 4.1 数据流图

```
用户请求
   ↓
六脉 Agent 接收任务
   ↓
判断：是否需要实时数据？
   ↓
   ├─ 是 → 通过 SensorManager 调用传感器
   │         ↓
   │    OpenClow 网关 → 外部 API/Scraper/Database
   │         ↓
   │    实时数据返回
   │         ↓
   └─ 否 → 使用历史数据或通用知识
   ↓
数据 + 通用知识 = 完整回答
   ↓
返回给用户
```

### 4.2 Agent 中的使用

```typescript
// lib/agents/caibu-agent.ts

import { SensorManager } from "@/lib/openclaw/sensor-manager";

export class CaibuAgent {
  private sensorManager: SensorManager;

  constructor() {
    this.sensorManager = new SensorManager(
      process.env.OPENCLAW_GATEWAY_URL!,
      process.env.OPENCLAW_API_KEY!
    );

    // 注册 API 传感器
    this.sensorManager.registerApiSensor("广告成本查询", {
      name: "广告成本查询",
      baseUrl: "https://api.adcost.com/v1/query",
      apiKey: process.env.AD_COST_API_KEY,
    });
  }

  /**
   * 计算投资回报率（带实时数据）
   */
  async calculateROI(budget: number, platform: "小红书" | "抖音") {
    // 1. 通过传感器获取实时广告成本
    const adCostData = await this.sensorManager.query("广告成本查询", {
      platform,
      date_range: "last_30_days",
    });

    // 2. 结合实时数据计算 ROI
    const estimatedImpressions = budget / adCostData.cpm * 1000;
    const estimatedClicks = budget / adCostData.cpc;
    const estimatedConversions = estimatedClicks * 0.03; // 3% 转化率

    return {
      budget,
      platform,
      ad_cost: adCostData,
      estimated_impressions: Math.round(estimatedImpressions),
      estimated_clicks: Math.round(estimatedClicks),
      estimated_conversions: Math.round(estimatedConversions),
      roi: (estimatedConversions * 2990) / budget, // 假设客单价 2990 元
      data_source: "real-time",
      updated_at: new Date().toISOString(),
    };
  }
}
```

---

## 五、示例场景

### 5.1 法度·风险：红蓝对抗

```typescript
// lib/agents/fadu-agent.ts

/**
 * 法度·风险 Agent - 红蓝对抗
 */

export class FaduAgent {
  /**
   * 风险评估（带实时传感器）
   */
  async assessRisk(content: string, platform: string) {
    // 1. 通过传感器查询最新法规
    const latestRegulations = await this.sensorManager.query("行业法规查询", {
      industry: "广告",
      keywords: ["违禁词", "虚假宣传"],
    });

    // 2. 通过传感器查询竞品暴雷新闻
    const competitorViolations = await this.sensorManager.query("竞品暴雷新闻", {
      platform,
      timeframe: "last_6_months",
    });

    // 3. 基于实时数据生成风险评估
    const riskAssessment = {
      content_risk: "LOW",  // 基于内容分析
      regulatory_risk: latestRegulations.risk_level,
      competitor_risk: competitorViolations.violation_count > 0 ? "MEDIUM" : "LOW",
      recommendations: [
        "避免使用：" + latestRegulations.forbidden_words.join("、"),
        "参考竞品案例：" + competitorViolations.top_case,
      ],
      data_source: "real-time",
      updated_at: new Date().toISOString(),
    };

    return riskAssessment;
  }
}
```

### 5.2 财帛·转化：动态 ROI 表

```typescript
// lib/agents/caibu-agent.ts

/**
 * 财帛·转化 Agent - 动态 ROI 表
 */

export class CaibuAgent {
  /**
   * 生成动态 ROI 预测表
   */
  async generateDynamicROITable(budget: number) {
    // 1. 并行查询多个平台的广告成本
    const platforms = ["小红书", "抖音", "公众号"];
    const adCosts = await this.sensorManager.queryMultiple(
      platforms.map(platform => ({
        sensorName: "广告成本查询",
        params: { platform, days: 30 },
      }))
    );

    // 2. 生成 ROI 表
    const roiTable = {
      budget,
      platforms: platforms.map(platform => ({
        platform,
        cpm: adCosts.get(`${platform}-广告成本查询`)?.cpm || 0,
        cpc: adCosts.get(`${platform}-广告成本查询`)?.cpc || 0,
        estimated_impressions: 0,
        estimated_clicks: 0,
        estimated_conversions: 0,
        estimated_revenue: 0,
        roi: 0,
      })),
      data_source: "real-time",
      updated_at: new Date().toISOString(),
    };

    // 3. 计算每个平台的 ROI
    roiTable.platforms = roiTable.platforms.map(p => ({
      ...p,
      estimated_impressions: Math.round(budget / p.cpm * 1000),
      estimated_clicks: Math.round(budget / p.cpc),
      estimated_conversions: Math.round(budget / p.cpc * 0.03),
      estimated_revenue: Math.round(budget / p.cpc * 0.03 * 2990),
      roi: (Math.round(budget / p.cpc * 0.03 * 2990) / budget).toFixed(2),
    }));

    return roiTable;
  }
}
```

### 5.3 天道·战略：市场趋势

```typescript
// lib/agents/tiandao-agent.ts

/**
 * 天道·战略 Agent - 市场趋势
 */

export class TiandaoAgent {
  /**
   * 分析市场趋势（带实时传感器）
   */
  async analyzeMarketTrend(industry: string) {
    // 1. 通过传感器查询市场规模
    const marketSize = await this.sensorManager.query("市场规模", {
      industry,
      year: new Date().getFullYear(),
    });

    // 2. 通过传感器查询行业趋势
    const industryTrend = await this.sensorManager.query("行业趋势", {
      industry,
      timeframe: "last_12_months",
    });

    // 3. 结合实时数据生成分析
    return {
      industry,
      market_size: marketSize,
      growth_rate: industryTrend.growth_rate,
      key_trends: industryTrend.trends,
      data_source: "real-time",
      updated_at: new Date().toISOString(),
    };
  }
}
```

---

## 六、使用示例

### 6.1 在 API Route 中使用

```typescript
// app/api/sensors/ad-cost/route.ts

import { SensorManager } from "@/lib/openclaw/sensor-manager";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { platform } = await request.json();

  const sensorManager = new SensorManager(
    process.env.OPENCLAW_GATEWAY_URL!,
    process.env.OPENCLAW_API_KEY!
  );

  try {
    const adCost = await sensorManager.query("广告成本查询", {
      platform,
      date_range: "last_30_days",
    });

    return NextResponse.json({
      success: true,
      data: adCost,
    });
  } catch (error) {
    console.error("[API] Sensor query failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "传感器查询失败",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
```

---

## 七、总结

### 7.1 传感器的价值

```
传统 Agent：
  ❌ 只能使用训练时的知识（可能过时）
  ❌ 无法获取实时数据
  ❌ 无法应对快速变化的市场

传感器增强的 Agent：
  ✅ 实时数据（永远最新）
  ✅ 真实世界感知（不瞎编）
  ✅ 动态适应（应对变化）
```

### 7.2 核心优势

```
1. 实时性：数据永远最新
2. 准确性：基于真实数据，不是幻觉
3. 战略性：能够感知市场温度
4. 竞争力：提供无法通过静态知识获得的价值
```

---

> 这是传感器的"眼睛"
> 让 Agent 从"瞎编"变成"看见"
>
> ——— 2026年3月2日
> ——— 版本：v1.0
