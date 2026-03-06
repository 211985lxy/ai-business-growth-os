# 传感器系统 - 快速开始指南

> 已包含 Mock 传感器，可立即开始开发
>
> ——— 2026年3月2日

---

## ✅ 当前状态

```bash
✅ Mock 传感器已实现并测试通过
✅ 数据库迁移文件已创建
⚠️  需要在 Supabase 中执行迁移
⚠️  OpenClaw 配置暂未设置（使用 Mock 代替）
```

---

## 🚀 5分钟快速开始

### 1️⃣ 验证环境

```bash
npx tsx scripts/check-sensor-config.ts
```

**预期输出：**
```
Supabase 配置：✅ 有效
外部 API：8/8 已配置
OpenClaw 配置：⚠️ 无效（正常，会使用 Mock）
```

### 2️⃣ 测试 Mock 传感器

```bash
npx tsx scripts/test-sensor-mock.ts
```

**预期输出：**
```
✅ 广告成本查询 - 成功
✅ 竞品定价 - 成功
✅ 行业法规查询 - 成功
✅ 市场规模 - 成功
```

### 3️⃣ 在代码中使用

```typescript
// app/api/sensors/test/route.ts
import { createDevSensorManager } from '@/lib/openclaw/index.dev';

export async function POST(request: Request) {
  const { platform } = await request.json();

  // 自动选择真实或 Mock 传感器
  const sensorManager = createDevSensorManager();

  const result = await sensorManager.query('广告成本查询', {
    platform,
    days: 30,
  });

  return Response.json(result);
}
```

---

## 📊 可用的传感器

### 财帛·转化传感器

| 传感器 | 参数 | 返回数据 |
|--------|------|---------|
| 广告成本查询 | platform, days | CPM, CPC, CTR |
| 竞品定价 | competitorId | 产品价格列表 |
| 汇率查询 | from, to | 汇率 |

### 法度·风险传感器

| 传感器 | 参数 | 返回数据 |
|--------|------|---------|
| 行业法规查询 | industry | 风险等级、违禁词 |
| 竞品暴雷新闻 | platform, timeframe | 违规案例 |
| 广告法违禁词 | - | 违禁词列表 |

### 天道·战略传感器

| 传感器 | 参数 | 返回数据 |
|--------|------|---------|
| 市场规模 | industry, year | 市场规模、增长率 |
| 行业趋势 | industry, timeframe | 趋势列表 |

### 人和·模式传感器

| 传感器 | 参数 | 返回数据 |
|--------|------|---------|
| 招聘数据 | position, city | 薪资、职位数 |
| 薪资水平 | position, level | 薪资范围 |

---

## 🗄️ 数据库迁移（可选）

如果需要使用 Database 传感器查询历史数据：

### 方法 1：在 Supabase SQL Editor 中执行

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 进入项目 → SQL Editor
3. 依次执行：
   - `supabase/migration_ad_costs_history.sql`
   - `supabase/migration_competitor_pricing.sql`

### 方法 2：使用脚本（需要配置环境变量）

```bash
# 设置环境变量
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_KEY=your-service-key

# 运行迁移
bash supabase/run-migrations.sh
```

---

## 💡 使用示例

### 示例 1：查询广告成本

```typescript
import { createDevSensorManager } from '@/lib/openclaw/index.dev';

const sensorManager = createDevSensorManager();

const result = await sensorManager.query('广告成本查询', {
  platform: '小红书',
  days: 30,
});

if (result.success) {
  console.log('CPM:', result.data.cpm);      // 150
  console.log('CPC:', result.data.cpc);      // 2.3
  console.log('CTR:', result.data.ctr);      // 0.015
  console.log('趋势:', result.data.trend);   // up/down
}
```

### 示例 2：批量查询多个平台

```typescript
const results = await sensorManager.queryMultiple([
  { sensorName: '广告成本查询', params: { platform: '小红书' } },
  { sensorName: '广告成本查询', params: { platform: '抖音' } },
  { sensorName: '广告成本查询', params: { platform: '公众号' } },
]);

results.forEach((result, sensorName) => {
  console.log(`${sensorName}: ${result.data.cpm}`);
});
```

### 示例 3：在六脉 Agent 中使用

```typescript
// lib/agents/caibu-agent.ts
import { createDevSensorManager } from '@/lib/openclaw/index.dev';

export class CaibuAgent {
  private sensorManager = createDevSensorManager();

  async calculateROI(budget: number, platform: string) {
    const result = await this.sensorManager.query('广告成本查询', {
      platform,
      days: 30,
    });

    if (!result.success) {
      throw new Error(`获取广告成本失败: ${result.error}`);
    }

    const adCost = result.data;
    const estimatedImpressions = Math.round(budget / adCost.cpm * 1000);
    const roi = (estimatedImpressions * adCost.ctr * 2990) / budget;

    return {
      budget,
      platform,
      estimated_impressions: estimatedImpressions,
      roi: roi.toFixed(2),
      data_source: result.source, // 'mock-sensor' 或真实数据源
    };
  }
}
```

---

## 🔄 从 Mock 切换到真实传感器

当你准备好使用真实传感器时：

### 1. 配置 OpenClaw（如果使用网页抓取）

```bash
# .env.local
OPENCLAW_GATEWAY_URL=https://gateway.openclaw.com
OPENCLAW_API_KEY=your_real_api_key
```

### 2. 配置外部 API（可选）

```bash
# .env.local
NEWS_API_KEY=your_real_news_api_key
AD_COST_API_KEY=your_real_ad_cost_api_key
# ... 其他 API 密钥
```

### 3. 代码无需修改！

```typescript
// createDevSensorManager 会自动选择
const sensorManager = createDevSensorManager();

// 如果配置有效 → 使用真实传感器
// 如果配置无效 → 使用 Mock 传感器
```

---

## 📁 文件说明

### 核心文件

| 文件 | 说明 |
|------|------|
| [lib/openclaw/index.dev.ts](lib/openclaw/index.dev.ts) | 开发环境入口（自动切换） |
| [lib/openclaw/sensor-manager.ts](lib/openclaw/sensor-manager.ts) | 真实传感器管理器 |
| [lib/openclaw/sensors/mock-sensor.ts](lib/openclaw/sensors/mock-sensor.ts) | Mock 传感器 |

### 测试脚本

| 文件 | 说明 |
|------|------|
| [scripts/check-sensor-config.ts](scripts/check-sensor-config.ts) | 检查配置状态 |
| [scripts/test-sensor-mock.ts](scripts/test-sensor-mock.ts) | 测试 Mock 传感器 |

### 数据库

| 文件 | 说明 |
|------|------|
| [supabase/migration_ad_costs_history.sql](supabase/migration_ad_costs_history.sql) | 广告成本表 |
| [supabase/migration_competitor_pricing.sql](supabase/migration_competitor_pricing.sql) | 竞品定价表 |

---

## ❓ 常见问题

### Q: Mock 数据和真实数据有什么区别？

**A:**
- **Mock 数据**：固定的模拟数据，用于开发和测试
- **真实数据**：从实际 API 获取的实时数据

代码无需修改，`createDevSensorManager()` 会自动选择。

### Q: 如何知道当前使用的是哪种传感器？

**A:**
```typescript
const result = await sensorManager.query('广告成本查询', { ... });
console.log(result.source); // 'mock-sensor' 或其他
```

### Q: Supabase 迁移必须执行吗？

**A:**
- 如果只使用 API/Scraper/Mock 传感器：**不需要**
- 如果要使用 Database 传感器查询历史数据：**需要**

### Q: OpenClaw 是什么？

**A:** OpenClaw 是一个假设的网页抓取网关。目前使用 Mock 传感器，不影响开发。

---

## 🎯 下一步

1. **立即开始**：使用 Mock 传感器开发功能
2. **测试集成**：在六脉 Agent 中集成传感器
3. **配置真实 API**：获取 1-2 个真实 API 密钥测试
4. **数据库迁移**：如需历史数据，执行 Supabase 迁移

---

> **传感器系统已就绪，可以开始开发！**
>
> 📚 详细文档：[docs/SENSOR_USAGE_GUIDE.md](docs/SENSOR_USAGE_GUIDE.md)
> 🐛 问题清单：[docs/SENSOR_ISSUES_AND_TODO.md](docs/SENSOR_ISSUES_AND_TODO.md)
>
> ——— 2026年3月2日
