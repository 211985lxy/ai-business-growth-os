# OpenClaw 传感器系统 - 使用指南

> 让六脉蜂群拥有"眼睛"，接入真实世界数据
>
> ——— 2026年3月2日 ——— v1.0

---

## 📋 目录

1. [快速开始](#快速开始)
2. [传感器类型](#传感器类型)
3. [使用示例](#使用示例)
4. [环境配置](#环境配置)
5. [在六脉 Agent 中使用](#在六脉-agent-中使用)
6. [最佳实践](#最佳实践)

---

## 一、快速开始

### 1.1 安装依赖

```bash
# 传感器系统已内置，无需额外安装
npm install
```

### 1.2 配置环境变量

在 `.env.local` 中添加：

```bash
# OpenClaw 网关配置
OPENCLAW_GATEWAY_URL=https://gateway.openclaw.com
OPENCLAW_API_KEY=your_openclaw_api_key

# 外部 API 密钥（可选，按需配置）
AD_COST_API_KEY=your_ad_cost_api_key
NEWS_API_KEY=your_news_api_key
```

### 1.3 创建传感器管理器

```typescript
import { createSensorManager } from '@/lib/openclaw';

// 创建预配置的传感器管理器
const sensorManager = createSensorManager();

// 或自定义配置
import { SensorManager } from '@/lib/openclaw';
const manager = new SensorManager(
  'https://gateway.openclaw.com',
  'your_api_key'
);
```

---

## 二、传感器类型

### 2.1 API 传感器

**用途：** 调用外部 API 获取实时数据

**适用场景：**
- 广告成本查询
- 市场规模查询
- 行业趋势分析
- 汇率查询

**示例：**

```typescript
import { ApiSensor } from '@/lib/openclaw';

const sensor = new ApiSensor({
  name: '广告成本查询',
  baseUrl: 'https://api.adcost.com/v1/query',
  apiKey: process.env.AD_COST_API_KEY,
  timeout: 10000,
});

const result = await sensor.query({
  platform: '小红书',
  date_range: 'last_30_days',
});

if (result.success) {
  console.log('CPM:', result.data.cpm);
  console.log('CPC:', result.data.cpc);
}
```

### 2.2 Scraper 传感器

**用途：** 从网页抓取公开数据

**适用场景：**
- 竞品价格监控
- 新闻抓取
- 公开数据收集

**示例：**

```typescript
import { ScraperSensor } from '@/lib/openclaw';

const scraper = new ScraperSensor({
  openclawUrl: process.env.OPENCLAW_GATEWAY_URL!,
  apiKey: process.env.OPENCLAW_API_KEY!,
});

// 抓取单个网页
const result = await scraper.scrape(
  'https://example.com/product-page',
  {
    selector: '.price', // CSS 选择器
    extractType: 'content',
  }
);

if (result.success) {
  console.log('标题:', result.data?.title);
  console.log('内容:', result.data?.content);
}

// 批量抓取
const results = await scraper.scrapeMultiple([
  'https://site1.com',
  'https://site2.com',
  'https://site3.com',
], {
  concurrency: 3, // 并发数
});
```

### 2.3 Database 传感器

**用途：** 查询本地数据库（Supabase）中的历史数据

**适用场景：**
- 广告成本历史分析
- 竞品定价变化追踪
- 业务数据统计

**示例：**

```typescript
import { DatabaseSensor } from '@/lib/openclaw';

const dbSensor = new DatabaseSensor();

// 查询广告成本历史
const adCosts = await dbSensor.queryAdCost('小红书', 30);

// 获取统计数据
const stats = await dbSensor.getAdCostStats('小红书', 30);
console.log('平均 CPM:', stats.avg_cpm);
console.log('趋势:', stats.trend); // 'up' | 'down' | 'stable'

// 查询竞品定价
const pricing = await dbSensor.queryCompetitorPricing('competitor_123');

// 保存新数据
await dbSensor.saveAdCostRecord({
  platform: '小红书',
  date: new Date().toISOString().split('T')[0],
  cpm: 150.5,
  cpc: 2.3,
  ctr: 0.015,
  impressions: 10000,
  clicks: 150,
});
```

---

## 三、使用示例

### 3.1 单个传感器查询

```typescript
import { createSensorManager } from '@/lib/openclaw';

const sensorManager = createSensorManager();

const result = await sensorManager.query('广告成本查询', {
  platform: '小红书',
  days: 30,
});

if (result.success) {
  console.log('数据:', result.data);
} else {
  console.error('错误:', result.error);
}
```

### 3.2 批量查询（并行）

```typescript
// 同时查询多个平台
const results = await sensorManager.queryMultiple([
  { sensorName: '广告成本查询', params: { platform: '小红书', days: 30 } },
  { sensorName: '广告成本查询', params: { platform: '抖音', days: 30 } },
  { sensorName: '广告成本查询', params: { platform: '公众号', days: 30 } },
]);

// 遍历结果
results.forEach((result, sensorName) => {
  if (result.success) {
    console.log(`${sensorName}:`, result.data);
  }
});
```

### 3.3 自定义 API 传感器

```typescript
import { SensorManager, ApiSensor } from '@/lib/openclaw';

const manager = new SensorManager();

// 注册自定义 API 传感器
manager.registerApiSensor('自定义天气查询', {
  name: '自定义天气查询',
  baseUrl: 'https://api.weather.com/v1/current',
  apiKey: 'your_weather_api_key',
  headers: {
    'Accept-Language': 'zh-CN',
  },
});

// 使用
const result = await manager.query('自定义天气查询', {
  city: '北京',
});

// 批量注册
manager.registerApiSensors([
  {
    name: '传感器1',
    config: { name: '传感器1', baseUrl: 'https://api1.com' },
  },
  {
    name: '传感器2',
    config: { name: '传感器2', baseUrl: 'https://api2.com' },
  },
]);
```

---

## 四、环境配置

### 4.1 完整环境变量列表

```bash
# ==========================================
# OpenClaw 传感器配置
# ==========================================
OPENCLAW_GATEWAY_URL=https://gateway.openclaw.com
OPENCLAW_API_KEY=your_openclaw_api_key

# ==========================================
# 外部 API 密钥 (传感器数据源)
# ==========================================

# 法度·风险传感器
LAW_API_KEY=your_law_api_key
NEWS_API_KEY=your_news_api_key
AD_LAW_API_KEY=your_ad_law_api_key

# 财帛·转化传感器
AD_COST_API_KEY=your_ad_cost_api_key
COMPETITOR_API_KEY=your_competitor_api_key

# 天道·战略传感器
MARKET_RESEARCH_API_KEY=your_market_research_key
INDUSTRY_API_KEY=your_industry_api_key

# 人和·模式传感器
JOBS_API_KEY=your_jobs_api_key
SALARY_API_KEY=your_salary_api_key
```

### 4.2 API 密钥获取指南

| API | 用途 | 获取方式 |
|-----|------|---------|
| OPENCLAW_API_KEY | OpenClaw 网关认证 | 联系 OpenClaw 团队 |
| AD_COST_API_KEY | 广告成本查询 | [示例](https://adcost.com) |
| NEWS_API_KEY | 新闻数据 | [NewsAPI](https://newsapi.org) |
| LAW_API_KEY | 法律法规查询 | [示例](https://law.gov.cn/api) |

---

## 五、在六脉 Agent 中使用

### 5.1 财帛·转化 Agent

```typescript
// lib/agents/caibu-agent.ts
import { createSensorManager } from '@/lib/openclaw';

export class CaibuAgent {
  private sensorManager = createSensorManager();

  /**
   * 计算投资回报率（带实时数据）
   */
  async calculateROI(budget: number, platform: '小红书' | '抖音') {
    // 1. 获取实时广告成本
    const adCostResult = await this.sensorManager.query(
      '广告成本查询',
      { platform, days: 30 }
    );

    if (!adCostResult.success) {
      throw new Error(`获取广告成本失败: ${adCostResult.error}`);
    }

    const adCost = adCostResult.data;

    // 2. 计算 ROI
    const estimatedImpressions = Math.round(budget / adCost.cpm * 1000);
    const estimatedClicks = Math.round(budget / adCost.cpc);
    const estimatedConversions = Math.round(estimatedClicks * 0.03);
    const estimatedRevenue = estimatedConversions * 2990;
    const roi = estimatedRevenue / budget;

    return {
      budget,
      platform,
      ad_cost: adCost,
      estimated_impressions: estimatedImpressions,
      estimated_clicks: estimatedClicks,
      estimated_conversions: estimatedConversions,
      estimated_revenue: estimatedRevenue,
      roi: roi.toFixed(2),
      data_source: 'real-time',
      updated_at: new Date().toISOString(),
    };
  }
}
```

### 5.2 法度·风险 Agent

```typescript
// lib/agents/fadu-agent.ts
import { createSensorManager } from '@/lib/openclaw';

export class FaduAgent {
  private sensorManager = createSensorManager();

  /**
   * 风险评估（带实时传感器）
   */
  async assessRisk(content: string, platform: string) {
    // 1. 查询最新法规
    const regulationsResult = await this.sensorManager.query(
      '行业法规查询',
      { industry: '广告', keywords: ['违禁词', '虚假宣传'] }
    );

    // 2. 查询竞品暴雷新闻
    const newsResult = await this.sensorManager.query(
      '竞品暴雷新闻',
      { platform, timeframe: 'last_6_months' }
    );

    return {
      content_risk: this.analyzeContentRisk(content),
      regulatory_risk: regulationsResult.success ? 'LOW' : 'MEDIUM',
      competitor_risk: newsResult.success ? 'LOW' : 'MEDIUM',
      recommendations: [
        '参考最新法规进行内容审核',
        '关注竞品动态',
      ],
      data_source: 'real-time',
      updated_at: new Date().toISOString(),
    };
  }

  private analyzeContentRisk(content: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    // 简化示例
    return 'LOW';
  }
}
```

### 5.3 在 API Route 中使用

```typescript
// app/api/sensors/ad-cost/route.ts
import { createSensorManager } from '@/lib/openclaw';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { platform } = await request.json();

  const sensorManager = createSensorManager();

  try {
    const result = await sensorManager.query('广告成本查询', {
      platform,
      days: 30,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[API] Sensor query failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: '传感器查询失败',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## 六、最佳实践

### 6.1 错误处理

```typescript
const result = await sensorManager.query('广告成本查询', {
  platform: '小红书',
  days: 30,
});

// 始终检查 success 标志
if (!result.success) {
  console.error('传感器查询失败:', result.error);

  // 优雅降级：使用默认值或缓存数据
  return getDefaultAdCost();
}

// 使用数据
return result.data;
```

### 6.2 超时控制

```typescript
// API 传感器默认超时 10 秒
const sensor = new ApiSensor({
  name: '慢速API',
  baseUrl: 'https://slow-api.com',
  timeout: 30000, // 增加到 30 秒
});

// Scraper 传感器默认超时 30 秒
const scraper = new ScraperSensor({
  openclawUrl: process.env.OPENCLAW_GATEWAY_URL!,
  apiKey: process.env.OPENCLAW_API_KEY!,
  timeout: 60000, // 增加到 60 秒
});
```

### 6.3 批量查询优化

```typescript
// ❌ 不好：串行查询
for (const platform of ['小红书', '抖音', '公众号']) {
  const result = await sensorManager.query('广告成本查询', { platform });
}

// ✅ 好：并行查询
const results = await sensorManager.queryMultiple([
  { sensorName: '广告成本查询', params: { platform: '小红书' } },
  { sensorName: '广告成本查询', params: { platform: '抖音' } },
  { sensorName: '广告成本查询', params: { platform: '公众号' } },
]);
```

### 6.4 数据持久化

```typescript
import { DatabaseSensor } from '@/lib/openclaw';

const dbSensor = new DatabaseSensor();

// 定期保存 API 数据到数据库
setInterval(async () => {
  const apiResult = await sensorManager.query('广告成本查询', {
    platform: '小红书',
  });

  if (apiResult.success) {
    await dbSensor.saveAdCostRecord({
      platform: '小红书',
      date: new Date().toISOString().split('T')[0],
      ...apiResult.data,
    });
  }
}, 24 * 60 * 60 * 1000); // 每天一次
```

### 6.5 传感器健康检查

```typescript
// 定期检查传感器状态
async function checkSensorHealth() {
  const stats = sensorManager.getStats();
  console.log('传感器统计:', stats);

  const registered = sensorManager.getRegisteredApiSensors();
  console.log('已注册的 API 传感器:', registered);
}

checkSensorHealth();
```

---

## 七、故障排查

### 7.1 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `API Sensor not found` | 传感器未注册 | 使用 `registerApiSensor()` 注册 |
| `Sensor query failed: 401` | API Key 无效 | 检查环境变量中的 API Key |
| `Scrape failed: timeout` | 网页加载太慢 | 增加超时时间 |
| `Supabase error` | 数据库连接失败 | 检查 Supabase 配置 |

### 7.2 调试技巧

```typescript
// 启用详细日志
const sensorManager = new SensorManager(
  process.env.OPENCLAW_GATEWAY_URL!,
  process.env.OPENCLAW_API_KEY!
);

// 查看传感器统计
console.log(sensorManager.getStats());

// 测试单个传感器
const result = await sensorManager.query('广告成本查询', {
  platform: '小红书',
  days: 30,
});
console.log(JSON.stringify(result, null, 2));
```

---

## 八、总结

### 传感器的价值

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

### 核心优势

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
