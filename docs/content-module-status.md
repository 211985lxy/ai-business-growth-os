# 神韵·内容模块接口现状

**生成时间**: 2026-03-04
**版本**: Chatflow Streaming 版本
**状态**: ✅ 已实现并运行

---

## API路由

### 路径
`app/api/content-factory/route.ts`

### 方法
- **POST** - 主接口（流式响应）

### 接收参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `category` | string | 否 | 内容类目（personal-story/business-showcase/problem-solving/opinion-sharing/themed-series） |
| `sub_type` | string | 否 | 内容子类型（entrepreneurship/personal-growth/brand-promo/case-study/pain-point/life-scene/review/challenge/vlog） |
| `platform` | string | 否 | 目标平台（xiaohongshu/douyin/wechat/shipinhao），默认 "douyin" |
| `identity` | string | 否 | 用户身份（如：瑜伽老师、餐饮老板） |
| `topic` | string | 否 | 创作主题 |
| `brand_voice` | string | 否 | 品牌调性 |
| `extra_context` | string | 否 | 额外补充信息 |
| `conversation_id` | string | 否 | 对话ID，用于持续对话 |

**注意**: 参数在 API 层不做必填校验，全部转为可选传递给 Dify

### Dify传参结构
```typescript
{
  inputs: {
    category: string,        // 内容类目
    sub_type: string,        // 内容子类型
    platform: string,        // 目标平台
    identity: string,        // 用户身份
    brand_voice: string,     // 品牌调性
    extra_context: string    // 额外补充
  },
  query: string,             // 核心诉求（topic 或 "开始创作内容"）
  response_mode: "streaming",
  user: "content-factory-user",
  conversation_id?: string   // 可选，用于持续对话
}
```

### 返回格式
- **类型**: SSE (Server-Sent Events) 流式响应
- **Content-Type**: `text/event-stream`

**SSE 事件格式**:
```
data: {"content": "AI生成的内容片段", "conversationId": "xxx"}
data: {"error": "错误信息"}
```

---

## 前端表单

### 页面位置
`app/content-factory/page.tsx` + `components/content-factory/create-mode-input.tsx`

### 表单字段

| 字段名 | 输入方式 | 默认值 | 选项/说明 |
|--------|----------|--------|-----------|
| `category` | 下拉（按钮组） | "personal-story" | 5个选项（见下方详情） |
| `sub_type` | 下拉（按钮组） | "entrepreneurship" | 根据category动态变化 |
| `platform` | 下拉（按钮组） | "douyin" | 4个平台选项 |
| `identity` | 文本输入框 | 空 | 必填，placeholder: "例如：瑜伽老师 / 餐饮老板" |
| `topic` | 文本域 | 空 | 必填，2行，placeholder: "例如：瑜伽对身体的好处" |
| `brand_voice` | 文本输入框 | 空 | 可选，高级参数，placeholder: "例如：专业严谨 / 亲和幽默" |
| `extra_context` | 文本域 | 空 | 可选，高级参数，3行，placeholder: "想补充的任何信息..." |

### content 类目选项

**1. personal-story (讲我的故事)**
- entrepreneurship - 创业经历（赚钱动机→过程→结果，经典七步法）
- personal-growth - 个人成长（关键节点、遇到的人/事、三观改变）

**2. business-showcase (展示我的业务)**
- brand-promo - 品牌宣传片（我们是谁、能力、产品服务、合作方式）
- case-study - 客户案例（客户问题→为何找我们→合作过程→结果）

**3. problem-solving (解决客户问题)**
- pain-point - 痛点方案（站在客户角度，痛点+我们的解决方案）

**4. opinion-sharing (分享我的观点)**
- life-scene - 场景观点（工作/生活/教育/感情/理想，落到具体场景）

**5. themed-series (拍一个系列)**
- review - 测评系列（产品/服务横向对比测评）
- challenge - 挑战系列（挑战XX的一天）
- vlog - Vlog系列（日常工作/生活记录）

### platform 平台选项

- **xiaohongshu** (小红书) - 图文种草 + 生活分享，标签矩阵很重要
- **douyin** (抖音) - 黄金3秒法则，完播率驱动推荐
- **wechat** (公众号) - 深度长文 + 信任构建，社交裂变传播
- **shipinhao** (视频号) - 社交推荐 + 私域导流，适合出镜内容

---

## Dify调用

### Key变量
`DIFY_CONTENT_KEY` (在 `.env.local` 中配置)

```bash
# 当前配置值
DIFY_CONTENT_KEY=app-nwGnwvORsiFq3iTSuQ6L1eAr
```

### 调用方式
**Dify Chatflow API** (对话模式，支持持续对话)

- **端点**: `POST https://api.dify.ai/v1/chat-messages`
- **认证**: `Bearer {DIFY_CONTENT_KEY}`
- **响应模式**: `streaming`
- **用户标识**: `content-factory-user`

### 完整请求示例
```typescript
POST https://api.dify.ai/v1/chat-messages
Headers:
  Authorization: Bearer app-nwGnwvORsiFq3iTSuQ6L1eAr
  Content-Type: application/json

Body:
{
  "inputs": {
    "category": "personal-story",
    "sub_type": "entrepreneurship",
    "platform": "douyin",
    "identity": "瑜伽老师",
    "brand_voice": "专业严谨",
    "extra_context": "目标受众：25-35岁女性"
  },
  "query": "瑜伽对身体的好处",
  "response_mode": "streaming",
  "user": "content-factory-user",
  "conversation_id": "xxx-xxx-xxx"  // 可选，第二次请求携带
}
```

### inputs 对象结构
```typescript
{
  category: string,        // 内容类目，5选1
  sub_type: string,        // 内容子类型，根据category变化
  platform: string,        // 发布平台，4选1
  identity: string,        // 创作者身份
  brand_voice: string,     // 品牌调性（可选）
  extra_context: string    // 额外补充（可选）
}
```

---

## 天道关联

### 依赖关系
❌ **当前版本：神韵不依赖天道输出**

- 神韵·内容是**独立模块**
- **不需要**先使用天道·战略生成战略
- 用户可以直接进入内容创作

### 数据来源
**战略上下文（strategy_context）获取方式**：

1. **Supabase数据库** (已登录用户)
   - 函数: `getActiveStrategyContext()`
   - RPC调用: `get_active_strategy_context(p_user_id)`
   - 表: `strategy_contexts`
   - 读取字段: `is_active=true` 的最新记录

2. **LocalStorage** (未登录用户或降级)
   - 存储键: `strategyContext`
   - 作为 Supabase 的降级方案
   - 数据结构相同

3. **自动加载机制**
   ```typescript
   // 在 ContentFactoryPage 中自动调用
   useEffect(() => {
     const loadStrategyContext = async () => {
       const context = await getActiveStrategyContext();
       if (context) {
         setStrategyContext({
           niche: context.niche,
           revenueGoal: context.revenue_goal,
           founderStory: context.founder_story,
           strengths: context.strengths,
           outputContent: context.output_content,
         });
       }
     };
     loadStrategyContext();
   }, []);
   ```

### 战略上下文字段
```typescript
interface StrategyContext {
  id: string;
  user_id: string;
  niche: string;              // 赛道
  revenue_goal?: string;      // 收入目标
  founder_story?: string;     // 创始人故事
  strengths?: string[];       // 优势
  output_content?: string;    // AI生成的战略输出
  is_active: boolean;
  source: "ai_generated" | "manual";
  created_at: string;
  updated_at: string;
}
```

### ⚠️ 重要发现
**当前实现中，战略上下文获取了但未使用！**

- `getActiveStrategyContext()` 在 `content-factory/page.tsx` 中被调用
- 数据存储在 `strategyContext` 状态中
- **但在提交给 API 时，并没有传递天道的相关参数**
- API只接收用户在表单中填写的参数

**结论**: 神韵·内容当前是完全独立运行的，不依赖天道的任何输出。

---

## 最近改动标记

### ✅ 已重构内容（2026-03-04）

1. **从 AgentLayout 迁移到 ContentFactoryLayout**
   - 旧: 使用通用 AgentLayout 组件
   - 新: 使用专用 ContentFactoryLayout，支持三模式切换

2. **支持持续对话模式**
   - 添加 `conversation_id` 参数
   - 用户可以在同一对话中连续生成内容
   - 前端自动保存和传递 `conversationId`

3. **SSE 流式响应优化**
   - 直接转发 Dify 的 SSE 事件
   - 简化了数据格式
   - 移除了中间层的数据转换

4. **UI 组件化**
   - `CreateModeInput` - 创作模式输入
   - `SearchModeInput` - 搜索模式输入
   - `PublishModeInput` - 发布模式输入
   - 所有组件支持加载状态和错误处理

---

## 架构流程图

```
用户操作流程:
┌─────────────────────────────────────────────────────────┐
│ 1. 用户选择模式（search/create/publish）                  │
│ 2. 填写表单（category, platform, identity, topic...）    │
│ 3. 点击"一键生成爆款内容"                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
前端处理 (app/content-factory/page.tsx):
┌─────────────────────────────────────────────────────────┐
│ - 收集表单数据                                           │
│ - 调用 streamFromApi("/api/content-factory", payload)    │
│ - 监听 SSE 流，实时更新 generatedContent                │
└─────────────────────────────────────────────────────────┘
                           ↓
API层 (app/api/content-factory/route.ts):
┌─────────────────────────────────────────────────────────┐
│ - 接收 POST 请求                                         │
│ - 构造 Dify Chatflow 请求                               │
│ - 建立 SSE 流连接                                        │
│ - 转发 Dify 响应到前端                                   │
└─────────────────────────────────────────────────────────┘
                           ↓
Dify Chatflow API:
┌─────────────────────────────────────────────────────────┐
│ - 接收 inputs + query                                    │
│ - 执行内容生成工作流                                     │
│ - 流式返回 AI 生成内容                                   │
│ - 返回 conversation_id 用于持续对话                      │
└─────────────────────────────────────────────────────────┘
```

---

## 待优化项

### 1. 与天道集成
- [ ] 在 Dify inputs 中添加天道战略参数
- [ ] 在表单中显示战略上下文状态
- [ ] 提供战略上下文的快速查看/编辑入口

### 2. 历史记录
- [ ] 实现真实的生成历史存储
- [ ] 支持查看历史内容
- [ ] 支持从历史记录重新生成

### 3. 搜索模式
- [ ] 当前搜索模式调用的是 Dify，不是真实的爆款搜索
- [ ] 需要集成真实的爆款分析API

### 4. 发布模式
- [ ] 当前是模拟发布
- [ ] 需要集成真实的平台发布API

---

## 技术栈总结

- **前端**: Next.js 16 (App Router), React, TailwindCSS
- **状态管理**: React useState (无Redux/Zustand)
- **UI组件**: 自定义组件 + Lucide图标 + Material图标
- **API调用**: Dify Chatflow Streaming API
- **数据存储**: Supabase (策略上下文)
- **降级方案**: LocalStorage (未登录用户)

---

**文档结束** 📝
