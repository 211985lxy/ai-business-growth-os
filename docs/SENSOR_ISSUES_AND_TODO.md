# OpenClaw 传感器系统 - 问题整理与待办事项

> 当前系统状态、已知问题和改进建议
>
> ——— 2026年3月2日 ——— v1.0

---

## 🚨 关键问题（必须解决）

### 1. 数据库表不存在

**问题：** Database 传感器查询的表可能不存在

```typescript
// lib/openclaw/sensors/db-sensor.ts 中使用的表：
- ad_costs_history        // ❌ 不存在
- competitor_pricing      // ❌ 不存在
```

**影响：**
- `queryAdCost()` 会报错
- `queryCompetitorPricing()` 会报错
- `saveAdCostRecord()` 会报错

**解决方案：**
需要创建数据库迁移文件：

```sql
-- supabase/migration_ad_costs.sql
CREATE TABLE IF NOT EXISTS ad_costs_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  cpm DECIMAL(10, 2) NOT NULL,
  cpc DECIMAL(10, 2) NOT NULL,
  ctr DECIMAL(10, 5) NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ad_costs_platform_date ON ad_costs_history(platform, date DESC);

-- supabase/migration_competitor_pricing.sql
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id VARCHAR(100) NOT NULL,
  competitor_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount DECIMAL(5, 2),
  currency VARCHAR(3) DEFAULT 'CNY',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_competitor_pricing_competitor ON competitor_pricing(competitor_id, updated_at DESC);
```

**优先级：** 🔴 高

---

### 2. OpenClaw 网关不存在

**问题：** Scraper 传感器依赖的 OpenClaw 网关可能不存在

```typescript
// lib/openclaw/sensors/scraper-sensor.ts
const response = await fetch(`${this.config.openclawUrl}/scrape`, {
  method: "POST",
  // ...
});
```

**影响：**
- 所有网页抓取功能无法使用
- `scrape()` 会超时或 404

**解决方案：**

**选项 A：使用真实的 OpenClaw 网关**
- 联系 OpenClaw 团队获取网关地址和 API Key

**选项 B：自建简单的网页抓取服务**
```typescript
// 使用 Puppeteer/Playwright 自建
// app/api/scrape/route.ts
export async function POST(request: Request) {
  const { url, selector } = await request.json();
  // 使用 Puppeteer 抓取
}
```

**选项 C：使用现有的网页抓取 API**
- [Apify](https://api.apify.com)
- [ScraperAPI](https://www.scraperapi.com)
- [ZenRows](https://www.zenrows.com)

**优先级：** 🔴 高（如果需要网页抓取功能）

---

### 3. 环境变量未验证

**问题：** 代码启动时不检查必需的环境变量

**影响：**
- 运行时才发现缺少配置
- 错误信息不清晰

**解决方案：**

```typescript
// lib/openclaw/config.ts
export function validateOpenClawConfig() {
  const required = [
    'OPENCLAW_GATEWAY_URL',
    'OPENCLAW_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please set them in .env.local`
    );
  }
}

// 在传感器管理器初始化时调用
constructor() {
  validateOpenClawConfig();
  // ...
}
```

**优先级：** 🟡 中

---

## ⚠️ 潜在问题（建议改进）

### 4. 类型安全不足

**问题：** API 传感器返回类型使用了 `any`

```typescript
// lib/openclaw/sensors/api-sensor.ts
async query<T = any>(params: Record<string, any>): Promise<ApiSensorQueryResult<T>> {
  const data = await response.json(); // ❌ 类型是 any
}
```

**解决方案：**

```typescript
// 为每个 API 定义响应类型
interface AdCostResponse {
  cpm: number;
  cpc: number;
  ctr: number;
  platform: string;
  date: string;
}

// 使用泛型约束
async query<T = unknown>(params: Record<string, unknown>): Promise<ApiSensorQueryResult<T>> {
  const data = await response.json() as T;
  // ...
}
```

**优先级：** 🟡 中

---

### 5. 错误处理过于简单

**问题：** 所有错误都返回简单的字符串

**解决方案：**

```typescript
// 定义错误类型
export enum SensorErrorCode {
  TIMEOUT = 'TIMEOUT',
  AUTH_FAILED = 'AUTH_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export interface SensorError {
  code: SensorErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// 使用结构化错误
if (response.status === 401) {
  return {
    success: false,
    error: {
      code: SensorErrorCode.AUTH_FAILED,
      message: 'Invalid API key',
      details: { sensor: this.config.name },
    },
  };
}
```

**优先级：** 🟢 低

---

### 6. 缺少缓存机制

**问题：** 相同查询每次都请求外部 API

**影响：**
- 浪费 API 配额
- 响应慢
- 可能触发速率限制

**解决方案：**

```typescript
// 添加 Redis 缓存层
export class CachedSensorManager extends SensorManager {
  private cache: Redis;

  async query<T>(sensorName: string, params: Record<string, any>, ttl: number = 3600) {
    const cacheKey = `sensor:${sensorName}:${JSON.stringify(params)}`;

    // 尝试从缓存读取
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 查询传感器
    const result = await super.query(sensorName, params);

    // 缓存成功结果
    if (result.success) {
      await this.cache.setex(cacheKey, ttl, JSON.stringify(result));
    }

    return result;
  }
}
```

**优先级：** 🟢 低

---

### 7. 缺少监控和日志

**问题：** 难以追踪传感器使用情况和性能

**解决方案：**

```typescript
// 添加监控
export class MonitoredSensorManager extends SensorManager {
  private metrics = {
    queryCount: 0,
    successCount: 0,
    failureCount: 0,
    avgResponseTime: 0,
  };

  async query(sensorName: string, params: Record<string, any>) {
    this.metrics.queryCount++;
    const startTime = Date.now();

    try {
      const result = await super.query(sensorName, params);
      const duration = Date.now() - startTime;

      if (result.success) {
        this.metrics.successCount++;
        console.log(`[Sensor] ${sensorName} succeeded in ${duration}ms`);
      } else {
        this.metrics.failureCount++;
        console.error(`[Sensor] ${sensorName} failed:`, result.error);
      }

      // 更新平均响应时间
      this.metrics.avgResponseTime =
        (this.metrics.avgResponseTime * (this.metrics.queryCount - 1) + duration) /
        this.metrics.queryCount;

      return result;
    } catch (error) {
      this.metrics.failureCount++;
      throw error;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

**优先级：** 🟢 低

---

### 8. API 密钥可能无效

**问题：** .env.example 中的很多 API 可能不存在

```
AD_COST_API_KEY      # ❌ 可能不存在真实服务
LAW_API_KEY          # ❌ 可能不存在真实服务
NEWS_API_KEY         # ✅ NewsAPI 存在
MARKET_RESEARCH_API_KEY  # ❌ 可能不存在真实服务
```

**解决方案：**

**选项 A：使用真实服务**
- [NewsAPI](https://newsapi.org) - 新闻数据
- [ScraperAPI](https://www.scraperapi.com) - 网页抓取
- [RapidAPI](https://rapidapi.com) - 各种 API

**选项 B：使用 Mock 数据（开发阶段）**
```typescript
// lib/openclaw/sensors/mock-sensor.ts
export class MockApiSensor extends ApiSensor {
  async query(params: any) {
    // 返回模拟数据
    return {
      success: true,
      data: {
        cpm: 150.5,
        cpc: 2.3,
        ctr: 0.015,
      },
    };
  }
}
```

**优先级：** 🟡 中

---

## 📋 待办事项清单

### 立即执行（本周）

- [ ] 创建数据库迁移文件 `migration_ad_costs.sql`
- [ ] 创建数据库迁移文件 `migration_competitor_pricing.sql`
- [ ] 在 Supabase 中执行迁移
- [ ] 添加环境变量验证函数
- [ ] 决定 OpenClaw 网关方案（真实/自建/替代）

### 短期计划（本月）

- [ ] 实现简单缓存机制（Redis）
- [ ] 添加基础监控和日志
- [ ] 为常用 API 添加类型定义
- [ ] 编写单元测试
- [ ] 创建 Mock 传感器用于开发

### 长期计划（下月）

- [ ] 实现错误重试机制
- [ ] 添加速率限制保护
- [ ] 实现传感器健康检查
- [ ] 创建传感器管理后台 UI
- [ ] 性能优化和基准测试

---

## 🎯 推荐的实施顺序

```
1. 数据库表创建（最重要）
   ↓
2. 环境变量验证（防止运行时错误）
   ↓
3. Mock 传感器（允许开发继续）
   ↓
4. 决定 OpenClaw 方案（技术选型）
   ↓
5. 缓存和监控（性能优化）
   ↓
6. 类型安全和错误处理（代码质量）
```

---

## 💡 快速修复方案

如果需要快速让系统运行起来：

```typescript
// lib/openclaw/sensor-manager-dev.ts
import { SensorManager } from './sensor-manager';

/**
 * 开发环境传感器管理器
 * 使用 Mock 数据，不依赖真实 API
 */
export function createDevSensorManager(): SensorManager {
  const manager = new SensorManager();

  // 注册 Mock 传感器
  manager.registerApiSensor('广告成本查询', {
    name: '广告成本查询',
    baseUrl: 'mock://adcost',
  });

  // 重写 query 方法，返回 Mock 数据
  const originalQuery = manager.query.bind(manager);
  manager.query = async (sensorName, params) => {
    // 返回模拟数据
    return {
      sensorName,
      success: true,
      data: getMockData(sensorName),
      timestamp: new Date().toISOString(),
      source: 'mock',
    };
  };

  return manager;
}

function getMockData(sensorName: string) {
  const mockData: Record<string, any> = {
    '广告成本查询': { cpm: 150.5, cpc: 2.3, ctr: 0.015 },
    '竞品定价': { price: 2990, currency: 'CNY' },
    '行业法规查询': { risk_level: 'LOW', forbidden_words: [] },
  };

  return mockData[sensorName] || {};
}
```

---

> **总结：**
> - 🔴 2 个关键问题（数据库表、OpenClaw 网关）
> - 🟡 4 个潜在问题（类型、错误处理、缓存、API 密钥）
> - 🟢 2 个优化项（监控、日志）
>
> 建议优先解决数据库表问题，其他可以逐步改进
>
> ——— 2026年3月2日
> ——— 版本：v1.0
