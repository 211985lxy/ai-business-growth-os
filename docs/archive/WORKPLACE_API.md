# Workplace API 使用文档

## 概述

统一的工作空间 API 路由器，用于调用六脉智能体矩阵的所有功能。

## 端点

```
POST /api/workplace
```

## 请求格式

### 请求头

```json
{
  "Content-Type": "application/json"
}
```

### 请求体

```typescript
{
  agentType: "strategy" | "content" | "earth" | "man" | "law" | "money";
  query?: string;
  inputs?: Record<string, unknown>;
  conversation_id?: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    upload_file_id?: string;
    url?: string;
  }>;
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| agentType | string | ✅ | 智能体类型 |
| query | string | ❌ | 用户查询/指令 |
| inputs | object | ❌ | 额外的输入参数 |
| conversation_id | string | ❌ | 会话 ID（用于多轮对话） |
| files | array | ❌ | 文件列表 |

## 智能体类型

### 1. strategy（天道·战略）
商业战略生成，麦肯锡式商业咨询

**特殊说明：**
- 生成结果会自动保存到 `strategies` 表
- 不需要战略上下文（它是上下文的来源）

**示例 inputs：**
```json
{
  "niche": "美业培训",
  "revenue_goal": "年营收 100 万",
  "founder_story": "10年行业经验",
  "strengths": ["专业团队", "标准化流程"]
}
```

### 2. content（神韵·内容）
IP 架构与内容生成

**特殊说明：**
- 自动注入最新的战略上下文
- 需要 strategy 智能体先运行过

**示例 inputs：**
```json
{
  "content_type": "video_script",
  "platform": "xiaohongshu"
}
```

### 3. earth（地道·产业）
供应链与行业数据库

**特殊说明：**
- 自动注入最新的战略上下文
- 用于寻找供应链资源和行业数据

**示例 inputs：**
```json
{
  "industry": "美业",
  "region": "二三线城市"
}
```

### 4. man（人道·流量）
流量分析与用户画像

**特殊说明：**
- 自动注入最新的战略上下文
- 小红书/抖音算法分析

**示例 inputs：**
```json
{
  "platform": "xiaohongshu",
  "target_audience": "女性创业者"
}
```

### 5. law（法度·风险）
合规审核与风险控制

**特殊说明：**
- 不需要战略上下文
- 广告法审核、合同风控

**示例 inputs：**
```json
{
  "content_type": "advertisement",
  "platform": "xiaohongshu"
}
```

### 6. money（财帛·转化）
ROI 计算与转化策略

**特殊说明：**
- 自动注入最新的战略上下文
- 私域成交话术、定价策略

**示例 inputs：**
```json
{
  "product_price": 299,
  "conversion_rate": 0.05
}
```

## 响应格式

### 成功响应（流式）

```
Content-Type: text/plain; charset=utf-8
Transfer-Encoding: chunked
```

响应体是纯文本流，实时返回 AI 生成的内容。

### 错误响应

```json
{
  "error": "错误类型",
  "message": "详细错误信息"
}
```

#### 错误类型

| 状态码 | 错误类型 | 说明 |
|--------|----------|------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 用户未认证 |
| 402 | Payment Required | 积分不足 |
| 500 | Internal Server Error | 服务器错误 |

## 使用示例

### 前端调用（使用 useApiStreaming 钩子）

```tsx
import { useApiStreaming } from "@/hooks/use-api-streaming";

function StrategyGenerator() {
  const { content, isStreaming, startStreaming, error } = useApiStreaming();

  const handleGenerate = async () => {
    await startStreaming("/api/workplace", {
      agentType: "strategy",
      query: "生成战略报告",
      inputs: {
        niche: "美业培训",
        revenue_goal: "年营收 100 万",
        strengths: ["专业团队", "标准化流程"],
      },
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isStreaming}>
        {isStreaming ? "生成中..." : "生成战略"}
      </button>
      {error && <div className="error">{error}</div>}
      {content && <div className="content">{content}</div>}
    </div>
  );
}
```

### 多轮对话示例

```tsx
const handleFollowUp = async () => {
  await startStreaming("/api/workplace", {
    agentType: "content",
    query: "帮我生成一个小红书视频脚本",
    inputs: {
      content_type: "video_script",
    },
    conversation_id: "previous-conversation-id", // 继续之前的对话
  });
};
```

### 带文件上传的示例

```tsx
const handleWithFile = async (fileId: string) => {
  await startStreaming("/api/workplace", {
    agentType: "strategy",
    query: "分析这个文档并生成战略",
    inputs: {
      niche: "美业培训",
    },
    files: [
      {
        type: "document",
        transfer_method: "local_file",
        upload_file_id: fileId,
      },
    ],
  });
};
```

## 环境变量配置

确保 `.env.local` 文件中包含以下配置：

```bash
# Dify API 基础配置
DIFY_API_BASE_URL=https://api.dify.ai/v1

# 六脉智能体 API Key
DIFY_STRATEGY_KEY=app-xxxxx  # 天道·战略
DIFY_CONTENT_KEY=app-xxxxx   # 神韵·内容
DIFY_EARTH_KEY=app-xxxxx     # 地道·产业
DIFY_MAN_KEY=app-xxxxx       # 人道·流量
DIFY_LAW_KEY=app-xxxxx       # 法度·风险
DIFY_MONEY_KEY=app-xxxxx     # 财帛·转化
```

## 数据库表结构

### strategies 表

```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  niche TEXT,
  revenue_goal TEXT,
  strengths TEXT[],
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_strategies_created_at ON strategies(created_at DESC);
```

## 上下文注入机制

当调用以下智能体时，系统会自动从 `strategies` 表读取最新的战略内容作为上下文：
- content（神韵·内容）
- earth（地道·产业）
- man（人道·流量）
- money（财帛·转化）

上下文会被注入到 `inputs.strategy_context` 字段中，智能体可以根据这个上下文生成更加贴合战略的内容。

## 积分系统

- 每次调用消耗 1 积分
- 调用前检查积分是否足够
- 积分不足返回 402 状态码
- 调用成功后自动扣除积分

## 安全特性

1. **用户隔离**：所有数据都基于 Supabase Auth 的 user_id 进行隔离
2. **积分保护**：调用前检查积分，防止恶意消耗
3. **上下文隔离**：每个用户只能访问自己的战略上下文
4. **API Key 验证**：启动时验证所有智能体的 API Key 是否配置

## 监控日志

所有请求都会输出日志：

```
[Workplace API] STRATEGY request received
[Workplace API] User authenticated: xxx-xxx-xxx
[Workplace API] Injected strategy context (1234 chars)
[Workplace API] Strategy saved successfully
[Workplace API] STRATEGY completed in 3245ms
```

## 错误处理

### 常见错误及解决方案

1. **Missing API key**
   - 错误：API key is not configured
   - 解决：检查 `.env.local` 文件，确保对应的 API Key 已配置

2. **Insufficient credits**
   - 错误：您没有足够的积分，请充值
   - 解决：提示用户充值

3. **No strategy context found**
   - 警告：无法找到战略上下文
   - 解决：提示用户先使用 strategy 智能体生成战略

4. **Unauthorized**
   - 错误：User must be authenticated
   - 解决：确保用户已登录
