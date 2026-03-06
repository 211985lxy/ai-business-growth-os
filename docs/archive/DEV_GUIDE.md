# 六脉增长系统 — 开发规范 v1.0

> 本文档是项目开发的唯一标准。所有代码修改、新增功能、AI编程助手任务，必须遵守本规范。
> 配套文档：设计系统规范v1.md（UI标准）、架构升级蓝图v2.md（技术方向）

---

## 一、项目结构

```
ai-business-growth-os/
├── app/                          # Next.js App Router 页面
│   ├── layout.tsx                # 全局布局（L1: GlobalNav）
│   ├── page.tsx                  # 首页/仪表盘
│   ├── strategy/                 # 天道·战略模块
│   │   └── page.tsx              # 战略页面（三栏布局）
│   ├── content-factory/          # 神韵·内容模块
│   │   └── page.tsx
│   ├── products/                 # 地势·产业模块
│   │   └── page.tsx
│   ├── traffic/                  # 人和·流量模块（待建）
│   │   └── page.tsx
│   ├── conversion/               # 财运·转化模块（待建）
│   │   └── page.tsx
│   ├── compliance/               # 法度·风控模块（待建）
│   │   └── page.tsx
│   └── api/                      # API Routes
│       ├── strategy/route.ts     # 战略API（调用Dify）
│       ├── content/route.ts      # 内容API
│       └── auth/                 # 认证相关
│
├── components/                   # 可复用组件
│   ├── ui/                       # 基础UI组件
│   │   ├── material-icon.tsx     # Material Symbols图标
│   │   ├── button.tsx            # 按钮（遵循设计规范）
│   │   └── ...
│   ├── business/                 # 业务组件
│   │   ├── streaming-output-canvas.tsx  # 流式输出渲染
│   │   ├── strategy-history.tsx         # 战略历史记录
│   │   ├── collapse-button.tsx          # 统一折叠按钮（新建）
│   │   └── ...
│   └── layout/                   # 布局组件
│       ├── global-nav.tsx        # 全局导航栏
│       ├── three-column-layout.tsx      # 三栏布局模板（新建）
│       └── ...
│
├── hooks/                        # 自定义Hooks
│   ├── use-api-streaming.ts      # 流式API调用
│   ├── use-panel-collapse.ts     # 面板折叠状态（新建）
│   └── ...
│
├── lib/                          # 工具库
│   ├── dify/
│   │   └── client.ts             # Dify API客户端
│   ├── supabase/
│   │   └── client.ts             # Supabase客户端
│   ├── strategy-context.ts       # 战略上下文管理
│   ├── utils.ts                  # 通用工具函数
│   └── ...
│
├── types/                        # TypeScript类型定义
│   └── db.ts                     # 数据库/API类型
│
├── docs/                         # 项目文档（新建）
│   ├── DESIGN_SYSTEM.md          # 设计系统规范
│   ├── DEV_GUIDE.md              # 本文档
│   ├── ARCHITECTURE.md           # 架构升级蓝图
│   └── PROMPTS.md                # AI提示词模板
│
├── public/                       # 静态资源
├── .env.local                    # 环境变量（不提交Git）
├── next.config.ts                # Next.js配置
├── tailwind.config.ts            # Tailwind配置
├── tsconfig.json                 # TypeScript配置
└── package.json
```

### 新建文件放哪里？

| 你要做什么 | 放在哪里 |
|-----------|---------|
| 新页面 | `app/模块名/page.tsx` |
| 页面专属子组件 | `app/模块名/_components/组件名.tsx` |
| 跨页面复用的UI组件 | `components/ui/组件名.tsx` |
| 跨页面复用的业务组件 | `components/business/组件名.tsx` |
| 新的自定义Hook | `hooks/use-功能名.ts` |
| 新的API路由 | `app/api/模块名/route.ts` |
| 工具函数 | `lib/功能名.ts` |
| 类型定义 | `types/模块名.ts` |

---

## 二、命名规范

### 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 页面 | `page.tsx` | `app/strategy/page.tsx` |
| 组件 | kebab-case | `streaming-output-canvas.tsx` |
| Hook | camelCase + use前缀 | `use-api-streaming.ts` |
| 工具库 | kebab-case | `strategy-context.ts` |
| API路由 | `route.ts` | `app/api/strategy/route.ts` |
| 类型文件 | kebab-case | `db.ts` |

### 变量命名

```typescript
// ✅ 正确
const isStreaming = true;                    // boolean用is前缀
const hasContent = content.length > 0;       // boolean用has前缀
const handleSubmit = () => {};               // 事件处理用handle前缀
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // state描述性命名

// ❌ 错误
const streaming = true;                      // boolean没有is/has前缀
const submit = () => {};                     // 事件处理没有handle前缀
const [flag, setFlag] = useState(false);     // 命名不描述性
```

### 环境变量命名

```env
# ✅ 正确：模块名_功能_后缀
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=app-xxx               # 默认Key（战略模块）
DIFY_STRATEGY_KEY=app-xxx          # 战略模块专用Key
DIFY_CONTENT_KEY=app-xxx           # 内容模块专用Key

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# ❌ 错误：不要这样命名
DIFY_Strategy_API_KEY=xxx           # 大小写不一致
DIFY_API_KEY_2=xxx                  # 数字后缀
dify_key=xxx                        # 全小写
```

**关键规则**：`.env.local` 中每个变量只出现一次，不要重复定义。

---

## 三、组件开发规范

### 单文件行数限制

| 类型 | 最大行数 | 超过了怎么办 |
|------|---------|-------------|
| 页面组件 | 400行 | 拆分为子组件 |
| 业务组件 | 300行 | 提取Hook或拆分 |
| UI组件 | 200行 | 简化或拆分 |
| Hook | 150行 | 拆分职责 |
| 工具函数 | 200行 | 按功能分文件 |

### 组件模板

```tsx
/**
 * 组件名称 - 一句话描述
 *
 * 功能：
 * - 功能点1
 * - 功能点2
 */

"use client";  // 仅客户端组件需要

import { useState } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentName({ title, onAction }: ComponentProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className={cn("base-styles", isActive && "active-styles")}>
      {title}
    </div>
  );
}
```

### 组件拆分规则

当以下情况出现时，必须拆分：
1. 组件超过400行
2. 一个组件内有3个以上独立的UI区域
3. 同一段JSX在两个以上地方使用
4. 组件有超过5个useState

拆分方式：
```
❌ 一个500行的page.tsx

✅ 拆分后：
app/strategy/page.tsx (200行，组合+状态管理)
app/strategy/_components/input-panel.tsx (150行)
app/strategy/_components/output-panel.tsx (100行)
app/strategy/_components/sidebar-panel.tsx (120行)
```

---

## 四、三栏布局开发标准

所有六脉模块页面共享同一套三栏布局逻辑。

### 布局结构

```tsx
// 每个模块页面的标准结构
<div className="h-[calc(100vh-4rem)] flex overflow-hidden">
  {/* L2: 左侧面板 */}
  <SidebarPanel collapsed={sidebarCollapsed} onToggle={...} />

  {/* L3: 核心画布 */}
  <main className="flex-1 flex overflow-hidden">
    {/* 输入区 */}
    <InputPanel collapsed={inputCollapsed} onToggle={...} />

    {/* 输出区 */}
    <OutputPanel content={content} isStreaming={isStreaming} />
  </main>
</div>
```

### 复用计划

当第二个模块（神韵·内容）开始开发时：
1. 提取 `components/layout/three-column-layout.tsx` 作为通用布局
2. 提取 `hooks/use-panel-collapse.ts` 管理折叠状态
3. 每个模块只需要提供：左侧面板内容、输入表单、输出渲染器

---

## 五、API开发规范

### API路由模板

```typescript
// app/api/strategy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getDifyClient } from "@/lib/dify/client";

export async function POST(req: NextRequest) {
  try {
    // 1. 解析输入
    const body = await req.json();
    const { niche, revenueGoal, founderStory, strengths } = body;

    // 2. 输入验证
    if (!niche?.trim()) {
      return NextResponse.json(
        { error: "赛道描述不能为空" },
        { status: 400 }
      );
    }

    // 3. 调用Dify
    const client = getDifyClient();
    const stream = await client.createStream({
      inputs: { niche, revenue_goal: revenueGoal || "" },
      query: niche,
      user: "anonymous",
    });

    // 4. 返回流式响应
    return new Response(/* stream processing */);

  } catch (error) {
    // 5. 统一错误处理
    console.error("❌ Strategy API error:", error);
    return NextResponse.json(
      { error: "服务暂时不可用，请稍后重试" },
      { status: 500 }
    );
  }
}
```

### Dify调用规则

1. 所有Dify调用都通过 `lib/dify/client.ts` 的 `DifyClient` 类
2. 不要在API路由里直接 `fetch` Dify的URL
3. 每个模块有自己的Dify Key，在 `.env.local` 中：
   - `DIFY_API_KEY` → 默认（战略）
   - `DIFY_STRATEGY_KEY` → 战略模块
   - `DIFY_CONTENT_KEY` → 内容模块
4. DifyClient 初始化时根据模块传入对应的Key

### 错误处理标准

```typescript
// 用户友好的错误信息映射
const ERROR_MESSAGES: Record<string, string> = {
  "DIFY_API_KEY is not configured": "AI服务未配置，请联系管理员",
  "User not authenticated": "请先登录",
  "Rate limit exceeded": "请求过于频繁，请稍后重试",
  "default": "服务暂时不可用，请稍后重试",
};
```

---

## 六、状态管理规范

### 原则：就近管理，按需提升

```
页面级状态 → useState（大多数情况）
跨组件共享 → props 传递或 Context
全局持久化 → Supabase（已登录）/ localStorage（未登录）
```

### 不允许的做法

```typescript
// ❌ 不要用全局状态库（Redux/Zustand），项目还不需要
// ❌ 不要用 localStorage 存UI状态（折叠状态等）
// ❌ 不要在组件内直接调用 Supabase，统一走 lib/ 下的service函数
```

### 战略上下文的数据流

```
用户输入 → API Route → Dify → 流式返回 → 前端渲染
                                          ↓
                                    生成完成后自动保存
                                          ↓
                              已登录 → Supabase strategy_contexts表
                              未登录 → localStorage（key: strategyContext）
                                          ↓
                                    下次访问时自动加载
```

---

## 七、Git工作流

### 分支规范

```
main            ← 生产分支，保护分支，不直接推送
├── dev         ← 开发主分支，日常开发都在这里
├── feat/xxx    ← 新功能分支（从dev创建）
├── fix/xxx     ← 修复分支（从dev创建）
└── hotfix/xxx  ← 紧急修复（从main创建）
```

### 现阶段（你一个人开发）简化为：

```
main   ← 稳定版本，能跑的代码
dev    ← 日常开发，AI编程助手在这个分支工作
```

每次AI编程助手完成一个任务后：
1. 在 `dev` 分支提交
2. 你验证没问题后，合并到 `main`

### Commit Message 规范

```
feat: 添加战略历史记录功能
fix: 修复未登录用户保存报错
style: 统一折叠按钮样式
refactor: 拆分strategy page为子组件
docs: 更新设计规范文档
chore: 更新依赖版本
```

格式：`类型: 中文描述`

---

## 八、环境管理

### .env.local 模板

```env
# === Dify API ===
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=app-xxxxxxxx
DIFY_STRATEGY_KEY=app-xxxxxxxx
DIFY_CONTENT_KEY=app-xxxxxxxx

# === Supabase ===
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx

# === OpenClaw (预留) ===
# OPENCLAW_API_URL=http://localhost:8080
# OPENCLAW_API_KEY=

# === SiliconFlow (预留，用于模型升级) ===
# SILICONFLOW_API_KEY=sk-xxxxxxxx
# SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3
```

### 规则
1. `.env.local` 不提交到 Git（已在 .gitignore）
2. 每个变量只定义一次，不要重复
3. 注释掉的变量表示"预留，暂未启用"
4. `NEXT_PUBLIC_` 前缀的变量会暴露到浏览器，只用于Supabase等公开信息

---

## 九、性能规范

### 页面加载

| 指标 | 目标 |
|------|------|
| 首次加载 (FCP) | < 2秒 |
| 交互就绪 (TTI) | < 3秒 |
| npm run dev 启动 | < 3秒 |

### 避免性能问题

```typescript
// ❌ 不要在组件顶层执行副作用
const data = await fetchData();  // 这会阻塞渲染

// ✅ 用 useEffect
useEffect(() => {
  fetchData().then(setData);
}, []);

// ❌ 不要在循环里setState
items.forEach(item => setItems(prev => [...prev, item]));

// ✅ 批量更新
setItems(allItems);

// ❌ 不要同时运行多个 Next.js 实例
// 如果 npm run dev 报端口占用，先 kill 旧进程再启动

// ✅ 正确的重启方式
// kill -9 $(lsof -ti:3000) && rm -rf .next && npm run dev
```

---

## 十、给AI编程助手的标准前缀

每次给AI编程助手（Cursor / Claude Code）发任务时，在开头加上这段：

```
## 项目上下文
项目：六脉增长系统 (ai-business-growth-os)
路径：/Users/xiangyu/ai-business-growth-os
技术栈：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase + Dify

## 必须遵守的规范
1. 阅读 docs/DESIGN_SYSTEM.md 获取UI标准
2. 阅读 docs/DEV_GUIDE.md 获取代码规范
3. 单文件不超过400行，超过则拆分为子组件
4. 不修改 .env.local 和 lib/dify/client.ts
5. 不引入新的npm依赖（除非必要且说明原因）
6. 所有新代码加中文注释
7. TypeScript严格模式，不用any类型
8. 完成后确保 npm run dev 无报错

## 当前任务
[在这里写具体任务]
```

---

## 十一、天道·战略模块当前状态 & 待办

### 已完成 ✅
- [x] Dify Chatflow配置（提示词已重写）
- [x] .env.local变量名统一
- [x] 流式API调用（use-api-streaming.ts）
- [x] Supabase + localStorage降级保存
- [x] 历史记录列表 + 搜索
- [x] 基本三栏布局

### 进行中 🔄
- [ ] 折叠按钮重新设计（改为Google AI Studio风格）
- [ ] 暗色模式适配
- [ ] 暂停时提交按钮状态同步

### 待做 📋
- [ ] 提取三栏布局为通用组件（为其他模块复用准备）
- [ ] 添加语音输入按钮（输入框内右下角）
- [ ] 添加全局搜索（Cmd+K）
- [ ] 输出区工具栏（复制、导出PDF、分享）
- [ ] 删除脏历史数据（{{niche}}开头的记录）
- [ ] 响应式适配（平板/手机）
- [ ] OpenClaw接口集成

### 已知Bug 🐛
- [ ] 左侧有两个重复的新建按钮
- [ ] 暂停生成后中间提交按钮仍显示"正在分析..."
- [ ] 部分历史记录显示Dify变量占位符（脏数据）

---

## 十二、禁止事项

1. ❌ 不要同时运行多个 `npm run dev` 实例
2. ❌ 不要在 `.env.local` 中重复定义同一个变量
3. ❌ 不要在组件里直接写Dify API URL或Key
4. ❌ 不要用 `any` 类型
5. ❌ 不要用 `var`，只用 `const` 和 `let`
6. ❌ 不要写超过400行的单文件
7. ❌ 不要用 `console.log` 做正式日志，用 `console.warn` 标记调试信息
8. ❌ 不要在没有测试的情况下合并到 `main` 分支
9. ❌ 不要安装不需要的npm包
10. ❌ 不要在PR/commit里包含 `.env.local` 文件不是UI放大的问题，而是中间那一栏和右边那一栏的按钮收起来收的不足，就中间那一栏没有完全收起来
