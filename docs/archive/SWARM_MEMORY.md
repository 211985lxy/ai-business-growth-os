# 蜂群记忆系统 (Swarm Memory) - 使用文档

> 为六脉Agent提供共享记忆，实现跨Agent的上下文传递
>
> 核心特性：自动注入、自动更新、优雅降级、Token优化

---

## 一、核心概念

### 1.1 什么是蜂群记忆？

**蜂群记忆**是一个基于 Redis 的分布式上下文共享系统，让六个 Agent 能够共享同一个用户的商业信息。

```
传统方式（孤岛）：
天道·战略 ─┐
地利·产品 ─┼─> 每次都需要用户重复输入背景信息
神韵·内容 ─┘

蜂群记忆（共享）：
天道·战略 ─┐
地利·产品 ─┼─> Redis 共享记忆，自动传递上下文
神韵·内容 ─┘
           ↓
    只需要输入一次，所有 Agent 都知道
```

### 1.2 记忆结构

记忆按照六脉进行组织：

```typescript
interface SwarmMemory {
  // 天道·战略（天）
  business_profile?: string;    // 用户行业、规模等基础背景
  strategic_goal?: string;     // 当前核心目标

  // 地利·产品（地）
  product_matrix?: string;     // 已定义的产品信息

  // 人和·模式（人）
  market_insights?: string;    // 市场调研结论（盟友、客户、对手）

  // 神韵·内容（神）
  brand_voice?: string;        // 品牌调性、内容风格

  // 财帛·转化（财）
  monetization_path?: string;  // 变现路径、定价策略

  // 法度·风险（法）
  risk_constraints?: string;   // 法律与风险边界

  // 跨脉信息
  last_pulse_summary?: string; // 上一个 Agent 执行的核心结论

  // 元数据
  update_at: number;          // 最后更新时间戳
  version: number;            // 记忆版本号
}
```

---

## 二、工作原理

### 2.1 前处理（Pre-processing）

在调用 Dify API 之前：

```
1. 从 Redis 读取记忆（conversation_id 作为 key）
   ↓
2. 将记忆转化为结构化文本
   【商业背景】
   美业培训，10年经验

   【战略目标】
   帮助100+创业者成功转型
   ↓
3. 注入到 Dify 请求的 inputs 中
   request.inputs.ext_memory = "上述文本"
   ↓
4. 发送到 Dify API
```

### 2.2 后处理（Post-processing）

在 Dify API 返回后：

```
1. 检查 Dify 响应中是否包含记忆更新标签
   [MEMORY_UPDATE]
   更新后的战略目标：定位为"创业者实战导师"
   [/MEMORY_UPDATE]
   ↓
2. 提取更新内容，识别对应的字段
   agentType = "天道·战略"
   → updates.strategic_goal = "定位为创业者实战导师"
   ↓
3. 合并到现有记忆中
   memory.strategic_goal = updates.strategic_goal
   ↓
4. 保存回 Redis，刷新 TTL
```

### 2.3 错误处理（优雅降级）

```
如果 Redis 不可用：
  1. 记录警告日志
  2. 跳过记忆注入
  3. 直接调用 Dify API
  4. 不影响主流程

如果记忆更新失败：
  1. 记录错误日志
  2. 仍然返回 Dify 响应用户
  3. 不阻塞响应
```

---

## 三、快速开始

### 3.1 安装依赖

```bash
npm install ioredis
```

### 3.2 配置环境变量

```bash
# .env.local

# Redis 连接
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true
```

### 3.3 基本使用

```typescript
import { createMemoryEnhancedDifyClient } from "@/lib/dify/client-with-memory";

// 创建带记忆功能的 Dify 客户端
const client = createMemoryEnhancedDifyClient("天道·战略", {
  debugMode: true,
});

// 首次调用：自动创建记忆
const stream1 = await client.createWorkflowStream({
  inputs: { niche: "美业培训" },
  user: "user-123",
});

// 第二次调用：自动注入之前的记忆
const stream2 = await client.createWorkflowStream({
  inputs: { query: "如何差异化定位？" },
  user: "user-123",  // 同一个 user，记忆会被注入
});
```

---

## 四、API 参考

### 4.1 createMemoryEnhancedDifyClient

创建带记忆功能的 Dify 客户端。

```typescript
function createMemoryEnhancedDifyClient(
  agentType: string,
  config?: {
    debugMode?: boolean;    // 调试模式（默认: false）
    ttl?: number;          // 记忆过期时间（秒，默认: 7200 = 2小时）
    autoCompress?: boolean; // 自动压缩超长记忆（默认: true）
  }
): MemoryEnhancedDifyClient
```

**示例：**

```typescript
const client = createMemoryEnhancedDifyClient("神韵·内容", {
  debugMode: true,
  ttl: 3600,  // 1 小时
});
```

### 4.2 client.initializeMemory

手动初始化记忆（可选）。

```typescript
await client.initializeMemory("user-456", {
  business_profile: "美业培训，10年经验",
  strategic_goal: "帮助100+创业者成功转型",
});
```

### 4.3 client.getMemory

获取当前记忆（用于调试）。

```typescript
const memory = await client.getMemory("user-789");
console.log("当前记忆:", memory);
```

### 4.4 client.clearMemory

清除会话记忆（重新开始）。

```typescript
await client.clearMemory("user-789");
```

---

## 五、Dify 工作流配置

### 5.1 如何在 Dify 中输出记忆更新

在 Dify 工作流的最后，添加一个 **LLM 节点**或**文本模板**，输出以下格式：

```
[MEMORY_UPDATE]
根据本次分析，建议的战略定位为：聚焦"美业创业者教育"细分市场，差异化竞争点在于实战培训而非理论课程。目标用户是30-45岁的美业从业者，希望转型或创业。
[/MEMORY_UPDATE]
```

### 5.2 记忆更新字段映射

| Agent 类型 | 更新的字段 | 示例内容 |
|-----------|-----------|---------|
| 天道·战略 | `strategic_goal` | "定位为创业者实战导师" |
| 地利·产品 | `product_matrix` | "核心产品：《美业创业实战课》" |
| 人和·模式 | `market_insights` | "盟友：培训机构，客户：美业从业者" |
| 神韵·内容 | `brand_voice` | "品牌人设：10年美业老兵" |
| 财帛·转化 | `monetization_path` | "变现路径：免费→低价→中价→高价" |
| 法度·风险 | `risk_constraints` | "禁用词：第一、最、保证" |

---

## 六、高级用法

### 6.1 自定义中间件配置

```typescript
import { withMemoryMiddleware } from "@/lib/memory";

// 包装自定义的 Dify API 调用函数
const enhancedApiCall = withMemoryMiddleware(
  async (request) => {
    // 你的自定义 Dify API 调用逻辑
    const response = await fetch("/api/my-dify-proxy", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return await response.json();
  },
  "地利·产品",
  {
    debugMode: true,
    ttl: 3600,
  }
);

// 使用增强后的 API 调用
const result = await enhancedApiCall({
  inputs: { query: "如何设计产品矩阵？" },
  user: "user-123",
});
```

### 6.2 直接使用 Redis 操作

```typescript
import {
  getMemory,
  saveMemory,
  updateMemory,
} from "@/lib/memory";

// 读取记忆
const memory = await getMemory("user-123");

// 保存新记忆
await saveMemory("user-456", {
  business_profile: "餐饮B2B",
  update_at: Date.now(),
  version: 1,
});

// 更新记忆（增量）
await updateMemory("user-123", {
  strategic_goal: "新的战略目标",
}, "merge");
```

### 6.3 批量操作

```typescript
import { getMultipleMemories } from "@/lib/memory";

// 批量获取多个会话的记忆
const memories = await getMultipleMemories([
  "user-123",
  "user-456",
  "user-789",
]);

console.log(memories.get("user-123"));
```

---

## 七、调试与监控

### 7.1 启用调试模式

```typescript
const client = createMemoryEnhancedDifyClient("天道·战略", {
  debugMode: true,  // 打印详细日志
});
```

**日志输出示例：**

```
[Memory] Injected context: {
  conversationId: "user-123",
  agentType: "天道·战略",
  contextLength: 342,
  memoryVersion: 5
}

[Memory] Extracted memory updates: {
  agentType: "天道·战略",
  confidence: 0.9,
  fields: ["strategic_goal", "last_pulse_summary"]
}

[Memory] Memory updated successfully
```

### 7.2 Redis 连接检查

```typescript
import { isRedisAvailable } from "@/lib/memory";

const available = await isRedisAvailable();
console.log("Redis 可用:", available);
```

### 7.3 记忆大小检查

```typescript
import { validateMemorySize } from "@/lib/memory";

const isValid = validateMemorySize(memory);
if (!isValid) {
  console.warn("记忆超过 2000 字符，将被压缩");
}
```

---

## 八、部署指南

### 8.1 生产环境 Redis 配置

**推荐使用云 Redis 服务：**

- **阿里云 Redis**: https://www.aliyun.com/product/redis
- **腾讯云 Redis**: https://cloud.tencent.com/product/redis
- **AWS ElastiCache**: https://aws.amazon.com/elasticache/

**环境变量配置：**

```bash
REDIS_URL=redis://username:password@redis-xxx.cloud.com:6379
REDIS_PASSWORD=your_strong_password
REDIS_DB=0
REDIS_ENABLED=true
```

### 8.2 Docker Compose 配置（本地开发）

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

volumes:
  redis_data:
```

启动：

```bash
docker-compose up -d redis
```

### 8.3 验证部署

```bash
# 测试 Redis 连接
npm run test:redis-memory
```

---

## 九、故障排查

### 9.1 Redis 连接失败

**问题：** `[Redis] Connection error: connect ECONNREFUSED`

**解决方案：**
1. 检查 Redis 是否启动：`redis-cli ping`
2. 检查 `REDIS_URL` 是否正确
3. 检查防火墙是否允许连接

### 9.2 记忆未注入

**问题：** Dify 请求中没有包含记忆

**解决方案：**
1. 检查 `conversation_id` 是否存在
2. 检查 Redis 中是否有该会话的记忆
3. 启用 `debugMode` 查看详细日志

### 9.3 记忆更新失败

**问题：** Dify 响应包含 `[MEMORY_UPDATE]` 但未更新

**解决方案：**
1. 检查标签格式是否正确（大小写敏感）
2. 检查 `agentType` 是否匹配
3. 启用 `debugMode` 查看提取日志

---

## 十、最佳实践

### 10.1 记忆初始化时机

- **用户注册时**：保存用户基础信息（行业、规模）
- **首次咨询时**：保存第一个 Agent 的输出
- **用户主动填写时**：保存用户提供的详细背景

### 10.2 记忆清理策略

- **会话结束时**：提示用户是否清除记忆
- **长时间未使用**：Redis 自动过期（TTL）
- **用户请求时**：提供"重新开始"按钮

### 10.3 Token 优化

- **启用自动压缩**：`autoCompress: true`
- **限制记忆大小**：`maxMemorySize: 2000`
- **定期清理旧记忆**：使用 TTL 自动过期

---

## 十一、性能指标

| 指标 | 数值 | 说明 |
|------|------|------|
| 读取延迟 | < 5ms | Redis GET 操作 |
| 写入延迟 | < 5ms | Redis SET 操作 |
| 记忆大小 | < 2000 字符 | 超过自动压缩 |
| 过期时间 | 2 小时 | 可配置 |
| 并发支持 | 10,000+ QPS | Redis 原生性能 |

---

## 十二、相关文档

- **[SWARM_INTELLIGENCE.md](./SWARM_INTELLIGENCE.md)** - 蜂群智能架构
- **[SWARM_PROTOCOL.md](./SWARM_PROTOCOL.md)** - Agent 通信协议
- **[SIX_MERIDIAN_FINAL.md](./SIX_MERIDIAN_FINAL.md)** - 六脉最终定义

---

> 📝 **更新日志**
> - 2026.03.02 - 初始版本，支持基本记忆注入和更新
> - TODO: 支持向量检索、语义搜索、记忆摘要
