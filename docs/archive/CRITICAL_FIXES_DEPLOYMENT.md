# 🚀 关键修复部署指南

## 修复内容概览

本次修复解决了 3 个上线前必须处理的关键问题：

| 问题 | 状态 | 影响 |
|------|------|------|
| #1 Dify API Key 验证 | ✅ 已修复 | 防止运行时崩溃 |
| #2 API 超时控制 | ✅ 已修复 | 防止请求无限挂起 |
| #3 匿名用户写入限制 | ✅ 已修复 | 防止数据库被滥用 |

---

## 📋 部署前检查清单

### 1. 环境变量配置

确保以下环境变量已正确配置：

```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dify API Keys (至少需要配置一个)
DIFY_API_KEY=your_dify_api_key
DIFY_STRATEGY_KEY=your_strategy_api_key

# 可选配置
DIFY_API_URL=https://api.dify.ai/v1  # 默认值
```

### 2. Supabase 数据库迁移

**必须运行以下 SQL 脚本**（在 Supabase SQL Editor 中执行）：

```bash
# 运行迁移脚本
supabase/migration_rate_limits.sql
```

该脚本会创建：
- `rate_limits` 表 - 用于速率限制
- `temp_strategies` 表 - 用于存储匿名用户数据
- 相关索引和函数
- 自动清理函数

### 3. 代码变更文件

以下文件已修改，需要部署：

```
lib/dify/client.ts                      # 重构 - 添加超时和验证
app/api/generate-strategy/route.ts      # 重构 - 添加速率限制
supabase/migration_rate_limits.sql      # 新增 - 数据库迁移
.env.example                            # 更新 - 添加新配置说明
docs/CRITICAL_FIXES_DEPLOYMENT.md       # 新增 - 本文档
```

---

## 🔧 详细变更说明

### 1. lib/dify/client.ts - Dify API 客户端重构

#### 主要变更：

**新增 `createDifyClient()` 函数**
```typescript
// ✅ 新的安全创建方式
const difyClient = createDifyClient("strategy");
if (!difyClient) {
  // 优雅降级，不会崩溃
  return Response.json(
    { error: "Service unavailable" },
    { status: 503 }
  );
}
```

**添加超时控制**
- 所有请求默认 60 秒超时
- 流式请求 120 秒超时
- 使用 `AbortSignal` 实现

**改进的错误处理**
```typescript
export function createDifyErrorResponse(error: unknown) {
  // 统一的错误响应格式
  // 区分超时、配置错误等
}
```

#### 迁移指南：

**旧代码**：
```typescript
const difyClient = new DifyClient(apiKey);
```

**新代码**：
```typescript
const difyClient = createDifyClient("strategy");
if (!difyClient) {
  return Response.json(
    { error: "AI service not configured" },
    { status: 503 }
  );
}
```

### 2. app/api/generate-strategy/route.ts - 速率限制

#### 新增功能：

**速率限制**
- 匿名用户：每小时 5 次请求
- 基于IP地址追踪
- 使用 Supabase 存储状态（分布式）

**内容验证**
```typescript
// 输入验证
- 赛道描述：5-1000 字符
- 生成内容：最少 50 字符
- XSS 模式检测
```

**临时数据存储**
- 匿名用户数据存储在 `temp_strategies` 表
- 24 小时后自动过期
- 登录用户存储在正式表

**IP 地址提取**
```typescript
// 支持多种代理头
- X-Forwarded-For
- X-Real-IP
- CF-Connecting-IP (Cloudflare)
```

#### API 响应示例：

**成功响应**：
```json
{
  "success": true,
  "data": {
    "content": "生成的战略内容...",
    "conversationId": "xxx",
    "messageId": "xxx"
  }
}
```

**速率限制错误**：
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "You have reached the maximum number of anonymous requests.",
  "resetAt": "2026-03-02T12:00:00Z"
}
```

**验证错误**：
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Niche description is too short (minimum 5 characters)"
}
```

### 3. 数据库迁移脚本

#### 新增表结构：

**rate_limits**
```sql
CREATE TABLE public.rate_limits (
    id UUID PRIMARY KEY,
    ip_address TEXT NOT NULL,
    request_count INTEGER NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    last_request TIMESTAMPTZ NOT NULL
);
```

**temp_strategies**
```sql
CREATE TABLE public.temp_strategies (
    id UUID PRIMARY KEY,
    ip_address TEXT NOT NULL,
    niche TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
```

#### 新增函数：

```sql
-- 清理过期的临时策略
SELECT cleanup_expired_temp_strategies();

-- 清理旧的速率限制记录
SELECT cleanup_old_rate_limits();

-- 检查速率限制
SELECT * FROM check_rate_limit('192.168.1.1', 5, 60);
```

---

## ⚠️ 注意事项

### 1. 向后兼容性

- ✅ 现有的 DifyClient 使用方式仍然支持（通过 `getDifyClient()`）
- ✅ 登录用户的功能不受影响
- ✅ 所有 API 响应格式保持一致

### 2. 性能影响

- 速率限制查询：每次请求 +1 次数据库查询
- 建议为 `rate_limits` 表添加索引（已包含在迁移中）
- 可选：使用 Redis 替代数据库查询（需额外配置）

### 3. 监控建议

监控以下指标：

```sql
-- 查看速率限制使用情况
SELECT
    ip_address,
    SUM(request_count) as total_requests,
    MAX(window_start) as last_window
FROM rate_limits
WHERE window_start > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY total_requests DESC
LIMIT 10;

-- 查看过期临时策略数量
SELECT COUNT(*) as expired_count
FROM temp_strategies
WHERE expires_at < NOW();

-- 清理过期数据
SELECT cleanup_expired_temp_strategies();
```

### 4. 定期维护

建议定期运行清理任务：

```sql
-- 每天清理一次
SELECT cleanup_expired_temp_strategies();
SELECT cleanup_old_rate_limits();
```

或使用 pg_cron 自动化：

```sql
-- 创建自动清理任务（需要 pg_cron 扩展）
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每 2 小时清理一次过期数据
SELECT cron.schedule(
    'cleanup-expired-temp-strategies',
    '0 */2 * * *',
    'SELECT cleanup_expired_temp_strategies();'
);
```

---

## 🧪 测试建议

### 1. 本地测试

```bash
# 测试速率限制
curl -X POST http://localhost:3000/api/generate-strategy \
  -H "Content-Type: application/json" \
  -d '{"niche": "测试赛道"}'

# 连续发送 6 次请求，第 6 次应该返回 429 错误
```

### 2. 验证功能

- ✅ 匿名用户可以正常使用（5 次/小时）
- ✅ 登录用户不受限制
- ✅ 输入验证正常工作
- ✅ 超时控制正常工作
- ✅ API Key 缺失时返回 503 而非崩溃

### 3. 压力测试

```bash
# 使用 ab (Apache Bench) 进行压力测试
ab -n 100 -c 10 -p request.json -T application/json \
  http://localhost:3000/api/generate-strategy
```

---

## 📚 相关文档

- [Supabase 数据库函数文档](https://supabase.com/docs/guides/database/functions)
- [Next.js API 路由](https://nextjs.org/docs/api-routes/introduction)
- [Dify API 文档](https://docs.dify.ai/)

---

## 🔄 回滚方案

如果需要回滚到修复前的版本：

1. 恢复以下文件的旧版本：
   - `lib/dify/client.ts`
   - `app/api/generate-strategy/route.ts`

2. 可选：删除新增的数据库表：
   ```sql
   DROP TABLE IF EXISTS public.rate_limits CASCADE;
   DROP TABLE IF EXISTS public.temp_strategies CASCADE;
   ```

---

**部署日期**: 2026-03-02
**版本**: v1.0.0-critical-fixes
**状态**: ✅ 生产就绪
