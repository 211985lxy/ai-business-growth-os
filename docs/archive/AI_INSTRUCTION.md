# AI 编程助手指令手册 v1.0
# 六脉增长系统 (ai-business-growth-os)

> ⚠️ 本文档是你执行所有任务的唯一规范。
> 每次开始编码前，必须先通读本文档。
> 违反任何一条规则的代码，视为不合格，需要返工。

---

## 〇、项目基本信息

```
项目名：六脉增长系统 (ai-business-growth-os)
路径：/Users/xiangyu/ai-business-growth-os
技术栈：Next.js 16 + React 19 + TypeScript 严格模式 + Tailwind CSS v4 + Supabase + Dify
包管理：npm
Node版本：22+
开发命令：npm run dev
端口：3000
```

---

## 一、代码风格（铁律，不可违反）

### 1.1 TypeScript
```typescript
// ✅ 必须这样写
const isStreaming = true;                     // boolean 用 is/has 前缀
const handleSubmit = () => {};                // 事件 用 handle 前缀
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);  // state 描述性命名
interface StrategyInput { niche: string; }    // 接口用 PascalCase
type AgentType = "strategy" | "content";      // 类型用 PascalCase

// ❌ 绝对禁止
let data: any = {};          // 禁止 any
var name = "test";           // 禁止 var
const flag = true;           // 禁止无意义命名
const submit = () => {};     // 事件必须有 handle 前缀
// @ts-ignore                // 禁止 ts-ignore
```

### 1.2 React 组件
```tsx
// ✅ 标准组件结构（按此顺序排列）
"use client";  // 1. 指令（仅客户端组件需要）

import { useState, useEffect } from "react";        // 2. React imports
import { cn } from "@/lib/utils";                    // 3. 工具 imports
import { MaterialIcon } from "@/components/ui/...";  // 4. 组件 imports

// 5. 类型定义
interface PanelProps {
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

// 6. 组件（只用函数式 + export）
export function Panel({ title, collapsed = false, onToggle }: PanelProps) {
  // 7. State
  const [isActive, setIsActive] = useState(false);

  // 8. Effects
  useEffect(() => { /* ... */ }, []);

  // 9. Handlers
  const handleClick = () => setIsActive(true);

  // 10. Render
  return (
    <div className={cn("base-class", collapsed && "collapsed-class")}>
      {title}
    </div>
  );
}
```

### 1.3 命名规范

| 对象 | 规则 | 示例 |
|------|------|------|
| 文件名（组件） | kebab-case.tsx | `strategy-history.tsx` |
| 文件名（Hook） | use-xxx.ts | `use-api-streaming.ts` |
| 文件名（工具） | kebab-case.ts | `strategy-context.ts` |
| 组件名 | PascalCase | `StrategyHistory` |
| 函数/变量 | camelCase | `handleSubmit` |
| 常量 | UPPER_SNAKE | `API_BASE_URL` |
| CSS类名 | Tailwind only | 不写自定义CSS |
| 环境变量 | UPPER_SNAKE | `DIFY_STRATEGY_KEY` |

### 1.4 文件行数限制（硬性要求）

| 文件类型 | 最大行数 | 超过了怎么办 |
|---------|---------|------------|
| 页面 page.tsx | 400行 | 拆分到 _components/ 子目录 |
| 业务组件 | 300行 | 提取 Hook 或拆分子组件 |
| UI组件 | 200行 | 简化逻辑或拆分 |
| Hook | 150行 | 拆分职责 |
| 工具函数 | 200行 | 按功能分文件 |

超过行数限制时的拆分方式：
```
❌ app/strategy/page.tsx (500行)

✅ 拆分为：
app/strategy/page.tsx (200行，组合 + 状态管理)
app/strategy/_components/sidebar-panel.tsx (120行)
app/strategy/_components/input-panel.tsx (150行)
app/strategy/_components/output-panel.tsx (100行)
```

---

## 二、Tailwind CSS 规范

### 2.1 只用 Tailwind，不写自定义 CSS
```tsx
// ✅ 正确
<div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">

// ❌ 禁止
<div style={{ display: 'flex', padding: '8px' }}>
<div className="custom-card">  // 不要自定义class名
```

### 2.2 Tailwind v4 语法（必须使用新语法）

| 旧写法 ❌ | 新写法 ✅ |
|----------|---------|
| `flex-shrink-0` | `shrink-0` |
| `flex-grow` | `grow` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `overflow-clip` | `overflow-clip` |

### 2.3 颜色系统（严格遵守，不可自创颜色）

**暗色模式：**
```
左侧导航背景   bg-[#0A0A0A]
中间输入区背景  bg-[#111111]
右侧输出区背景  bg-[#161616]
区域分割线      border-white/6
主文字          text-slate-300
次要文字        text-slate-500
强调色          bg-indigo-600 / text-indigo-500
强调色hover     hover:bg-indigo-500
卡片背景        bg-white/3
卡片hover       hover:bg-white/6
输入框背景      bg-white/5
输入框边框      border-white/10
输入框focus     focus:border-indigo-500
危险色          text-red-500
成功色          text-green-500
```

**浅色模式：**
```
左侧导航背景   bg-[#F5F5F5]
中间输入区背景  bg-[#FAFAFA]
右侧输出区背景  bg-white
分割线          border-slate-200
主文字          text-slate-800
次要文字        text-slate-500
```

### 2.4 间距系统（基于 4px 单位）
```
xs: 4px  → p-1, gap-1, m-1
sm: 8px  → p-2, gap-2, m-2
md: 12px → p-3, gap-3, m-3
lg: 16px → p-4, gap-4, m-4
xl: 24px → p-6, gap-6, m-6
2xl: 32px → p-8, gap-8, m-8
```

### 2.5 排版
```
页面标题     text-lg font-semibold    (18px, 600)
区域标题     text-sm font-semibold    (14px, 600)
正文         text-sm font-normal      (14px, 400)
标签/辅助    text-xs font-normal      (12px, 400)
时间戳       text-[11px] font-normal  (11px, 400)
```

**禁止：**
- ❌ `font-bold` (700) — 最重只用 `font-semibold` (600)
- ❌ `text-xl` 或更大 — 页面内最大 `text-lg`
- ❌ 行高低于 1.6 的中文段落

---

## 三、组件标准模板

### 3.1 按钮
```tsx
// 主按钮
<button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium
  rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200">
  生成战略总纲
</button>

// 次按钮
<button className="text-xs text-slate-400 hover:text-slate-200
  hover:bg-white/6 rounded-lg px-3 py-2 transition-all duration-200">
  取消
</button>

// 图标按钮
<button className="w-8 h-8 rounded-lg flex items-center justify-center
  hover:bg-white/6 transition-colors duration-200">
  <MaterialIcon icon="add" size={18} className="text-slate-400" />
</button>
```

### 3.2 折叠按钮（Google AI Studio 风格）
```tsx
// 在面板 header 内部的折叠按钮（不要放在面板边缘）
<button
  onClick={() => setCollapsed(!collapsed)}
  className="w-7 h-7 rounded-lg flex items-center justify-center
    hover:bg-black/5 dark:hover:bg-white/6 transition-colors duration-200"
>
  <MaterialIcon icon="left_panel_close" size={18}
    className="text-slate-400 hover:text-slate-600" />
</button>
```

### 3.3 输入框
```tsx
<textarea
  className="w-full bg-white/5 border border-white/10
    focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30
    rounded-lg px-4 py-3 text-sm text-slate-300
    placeholder:text-slate-600 resize-none transition-all duration-200"
  placeholder="描述你的业务..."
  rows={5}
/>
```

### 3.4 卡片
```tsx
<div className="bg-white/3 hover:bg-white/6 border border-white/6
  rounded-lg p-4 cursor-pointer transition-all duration-200">
  <h3 className="text-sm font-medium text-slate-300">标题</h3>
  <p className="text-xs text-slate-500 mt-1">描述</p>
</div>
```

### 3.5 空状态
```tsx
<div className="flex flex-col items-center justify-center h-full text-center">
  <MaterialIcon icon="lightbulb" size={48} className="text-indigo-500/30 mb-4" />
  <p className="text-sm font-medium text-slate-400">AI 架构师已准备就绪</p>
  <p className="text-xs text-slate-600 mt-2">在左侧输入你的业务信息</p>
</div>
```

---

## 四、图标系统

只使用 Google Material Symbols，通过 MaterialIcon 组件引用。

**常用图标映射（遵守此表，不要用其他图标代替）：**

| 功能 | 图标名 |
|------|--------|
| 新建 | `add` |
| 搜索 | `search` |
| 删除 | `delete` |
| 编辑 | `edit` |
| 复制 | `content_copy` |
| 收起左面板 | `left_panel_close` |
| 展开左面板 | `left_panel_open` / `menu` |
| 下拉展开 | `expand_more` |
| 下拉收起 | `expand_less` |
| 历史 | `history` |
| 设置 | `settings` |
| 播放/开始 | `play_arrow` |
| 暂停 | `pause` |
| 麦克风 | `mic` |
| 全屏 | `fullscreen` |
| 文档 | `description` |
| 灵感 | `lightbulb` |
| 导航箭头 | `chevron_left` / `chevron_right` |

---

## 五、项目结构（新建文件必须放在对应目录）

```
app/
├── 模块名/page.tsx              ← 页面
├── 模块名/_components/xxx.tsx   ← 页面专属子组件
├── api/模块名/route.ts          ← API路由

components/
├── ui/xxx.tsx                   ← 跨页面UI组件
├── business/xxx.tsx             ← 跨页面业务组件
├── layout/xxx.tsx               ← 布局组件

hooks/use-xxx.ts                 ← 自定义Hook
lib/xxx.ts                       ← 工具函数
types/xxx.ts                     ← 类型定义
docs/                            ← 项目文档
```

**规则：**
- 不要在 app/ 下创建与页面无关的工具文件
- 不要在 components/ 下创建只有一个页面用的组件（放 _components/）
- 不要创建 utils/ 目录，统一用 lib/

---

## 六、动画与过渡

```
颜色/透明度变化  → transition-colors duration-200
                   或 transition-all duration-200
宽度/高度变化    → transition-all duration-300 ease-in-out
面板折叠展开     → transition-all duration-300
```

**禁止：**
- ❌ framer-motion（不要安装）
- ❌ 任何弹跳/抖动/闪烁动画
- ❌ animate-pulse / animate-bounce
- ✅ 唯一允许的动画：animate-spin（加载状态）

---

## 七、状态管理

```
页面内状态       → useState
跨子组件共享     → props 传递
跨页面共享       → Context（仅在必要时）
持久化（已登录） → Supabase（通过 lib/ 下的 service 函数）
持久化（未登录） → localStorage
```

**禁止：**
- ❌ Redux / Zustand / Jotai（项目不需要）
- ❌ 在组件内直接调用 Supabase（必须通过 lib/ 封装）
- ❌ 用 localStorage 存 UI 状态（折叠状态等用 useState）

---

## 八、API 开发

### 8.1 路由模板
```typescript
// app/api/strategy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 输入验证
    if (!body.niche?.trim()) {
      return NextResponse.json({ error: "赛道描述不能为空" }, { status: 400 });
    }

    // 业务逻辑...

    return new Response(/* stream */);
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json({ error: "服务暂时不可用" }, { status: 500 });
  }
}
```

### 8.2 Dify 调用规则
- 所有 Dify 调用通过 `lib/dify/client.ts`
- 不要在 API 路由里直接 fetch Dify URL
- 不要修改 `lib/dify/client.ts` 和 `.env.local`（除非任务明确要求）

---

## 九、环境变量

```env
# 格式：模块名_功能_后缀，全大写，下划线分隔
DIFY_API_URL=https://api.dify.ai/v1
DIFY_STRATEGY_KEY=app-xxx
DIFY_CONTENT_KEY=app-xxx

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

**规则：**
- 每个变量只定义一次
- `NEXT_PUBLIC_` 前缀 = 浏览器可见，只用于公开信息
- 新增变量需在任务说明中标注

---

## 十、Git 提交

```bash
# Commit message 格式
feat: 添加战略历史记录功能
fix: 修复未登录用户保存报错
style: 统一折叠按钮样式
refactor: 拆分 strategy page 为子组件
docs: 更新设计规范文档
chore: 更新依赖版本
```

**规则：**
- 所有工作在 `dev` 分支
- 每完成一个独立功能提交一次
- 不要一次性提交十几个文件的大改动
- 提交前确保 `npm run dev` 无报错

---

## 十一、部署检查清单

每次准备合并到 main 前，检查：

```
□ npm run dev 启动无报错
□ 页面加载正常，无白屏
□ 流式生成功能正常
□ 历史记录保存/加载正常
□ 没有引入新的 npm 依赖（如有，需说明原因）
□ 没有 console.log 遗留（调试用 console.warn 标记）
□ 没有 any 类型
□ 没有超过 400 行的文件
□ .env.local 没有被提交
```

---

## 十二、绝对禁止清单

1. ❌ `any` 类型
2. ❌ `var` 声明
3. ❌ `// @ts-ignore`
4. ❌ 自定义 CSS（只用 Tailwind）
5. ❌ `font-bold`（最重用 `font-semibold`）
6. ❌ `text-xl` 或更大（页面内最大 `text-lg`）
7. ❌ 装饰性 SVG / 渐变色块 / 浮动形状
8. ❌ emoji 作为 UI 元素
9. ❌ framer-motion
10. ❌ 橙色/粉色/绿色渐变按钮
11. ❌ `opacity-0` 隐藏交互元素
12. ❌ 单文件超过 400 行
13. ❌ 同一区域重复功能的按钮
14. ❌ `w-0` 作为折叠状态（保留图标列 64px）
15. ❌ 直接在组件里写 Dify API URL 或 Key
16. ❌ 同时运行多个 `npm run dev`
17. ❌ 在 `.env.local` 中重复定义同一个变量
18. ❌ 安装不必要的 npm 包
19. ❌ `console.log`（调试用 `console.warn`）
20. ❌ 在没有测试的情况下合并到 main

---

## 十三、任务交付标准

每次任务完成后，必须确认：

1. `npm run dev` 无报错启动
2. 改动的页面在浏览器中正常显示
3. 没有引入新的 warning（Tailwind / TypeScript）
4. 所有新代码有中文注释
5. 文件行数未超过限制
6. 遵守了本文档所有规范

如果某条规范与任务需求冲突，在代码注释中标注原因，不要静默违反。

---

> 本文档 = 设计规范 + 代码规范 + Git规范 + 部署规范 的统一版本。
> 不需要再看其他文档。按这份执行即可。
