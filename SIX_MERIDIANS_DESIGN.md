# 六脉增长系统 - UI 设计规范

## 🎨 统一设计系统（飞书暗夜风格）

### 颜色规范
```css
/* 背景色 */
--bg-primary: #0D0D0D;        /* 主背景 */
--bg-secondary: #141414;      /* 次级背景 */
--bg-tertiary: #1A1A1A;       /* 三级背景 */

/* 文字色 */
--text-primary: slate-300;    /* 主文字 */
--text-secondary: slate-500;  /* 次级文字 */
--text-muted: slate-600;      /* 弱化文字 */

/* 强调色（每个脉使用不同色调） */
--accent-strategy: indigo-500;   /* 天道 - 战略 */
--accent-content: fuchsia-500;   /* 神韵 - 内容 */
--accent-product: emerald-500;   /* 地道 - 产品 */
--accent-user: amber-500;        /* 人道 - 用户 */
--accent-rule: rose-500;         /* 法道 - 规则 */
--accent-finance: cyan-500;      /* 财道 - 财务 */
```

### 布局规范
```
┌─────────────────────────────────────────────────┐
│  顶部导航栏 (64px)                                │
│  [返回] [图标] 标题 + 副标题                       │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  左侧输入区   │        右侧输出区                  │
│  (400px)     │        (flex-1)                   │
│              │                                   │
│  • 引导提示   │  • 标题栏                          │
│  • 输入表单   │  • 输出内容（流式展示）             │
│  • 示例卡片   │  • 状态栏                          │
│  • 提交按钮   │                                   │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

---

## 📋 六脉智能体定义

### 1. 天道·战略 (Strategy)
**路径**: `/strategy`
**图标**: `Lightbulb`
**强调色**: `indigo-500`
**功能**: 商业战略研究、市场分析、竞争格局分析

**输入参数**:
- 赛道/行业描述（必填）
- 营收目标（可选）
- 创始人故事（可选）
- 核心优势标签（可选）

**输出内容**: 麦肯锡式战略分析报告

---

### 2. 神韵·内容 (Content)
**路径**: `/content-factory`
**图标**: `Video`
**强调色**: `fuchsia-500`
**功能**: AI 内容创作、视频脚本、IP 内容生产

**输入参数**:
- 内容类型（视频脚本/文章/社媒/IP故事/产品文案）
- 平台选择（小红书/抖音/微信/微博/通用）
- 目标受众（可选）
- 内容目标（可选）
- 品牌调性（可选）
- 关键词标签（可选）

**输出内容**: 三阶段优化的内容（Draft → Critic → Refiner）

---

### 3. 地道·产品 (Product/Earth)
**路径**: `/products`
**图标**: `Package`
**强调色**: `emerald-500`
**功能**: 产品设计、定价策略、产品矩阵规划

**输入参数**:
- 产品名称/类别
- 目标用户群体
- 核心功能
- 竞品信息
- 价格区间

**输出内容**: 产品定义文档、定价策略、路线图

---

### 4. 人道·用户 (User/Man)
**路径**: `/management/users` 或新建 `/users`
**图标**: `Users`
**强调色**: `amber-500`
**功能**: 用户画像、用户旅程、增长策略

**输入参数**:
- 目标用户群体
- 使用场景
- 痛点描述
- 行为特征

**输出内容**: 用户画像、用户旅程地图、增长策略

---

### 5. 法道·规则 (Law/Rule)
**路径**: `/settings/rules` 或新建 `/rules`
**图标**: `Scale`
**强调色**: `rose-500`
**功能**: 合规检查、风险控制、运营规则

**输入参数**:
- 业务场景
- 合规要求
- 风险点描述
- 规则类型

**输出内容**: 合规检查清单、风险评估、规则文档

---

### 6. 财道·财务 (Finance/Money)
**路径**: `/management/finance` 或新建 `/finance`
**图标**: `DollarSign`
**强调色**: `cyan-500`
**功能**: 财务规划、成本分析、融资策略

**输入参数**:
- 业务规模
- 成本结构
- 收入来源
- 融资阶段

**输出内容**: 财务模型、成本分析、融资计划

---

## 🧩 通用组件规范

### 1. 引导提示卡片
```tsx
<div className="flex items-start gap-3 p-4 bg-{accent}-50/50 dark:bg-{accent}-500/10 rounded-xl border border-{accent}-100 dark:border-{accent}-500/20">
  <Icon className="w-5 h-5 text-{accent}-600 dark:text-{accent}-400" />
  <div className="space-y-1">
    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">提示标题</p>
    <p className="text-xs text-slate-500 dark:text-slate-500">提示描述</p>
  </div>
</div>
```

### 2. 示例问题卡片
```tsx
<button className="w-full text-left p-3 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/6 rounded-xl hover:border-{accent}-300/50 dark:hover:border-{accent}-500/50 transition-all">
  <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">分类标签</p>
  <p className="text-sm text-slate-700 dark:text-slate-300">示例问题文本</p>
</button>
```

### 3. 提交按钮
```tsx
<button className="w-full py-3 bg-{accent}-600 hover:bg-{accent}-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50">
  {isLoading ? <Spinner /> : <><Icon /> 生成{标题}</>}
</button>
```

### 4. 空状态
```tsx
<div className="h-full flex flex-col items-center justify-center">
  <div className="w-12 h-12 rounded-full bg-{accent}-50/80 dark:bg-{accent}-500/20 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-{accent}-400" />
  </div>
  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">空状态标题</h3>
  <p className="text-xs text-slate-500 dark:text-slate-500">空状态描述</p>
</div>
```

---

## 📝 页面模板（通用结构）

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Icon, Sparkles } from "lucide-react";
import { StreamingOutputCanvas } from "@/components/business/streaming-output-canvas";
import { useApiStreaming } from "@/hooks/use-api-streaming";

export default function AgentPage() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // 状态定义
  const [formData, setFormData] = useState({...});

  const router = useRouter();

  // 检查已保存的数据
  useEffect(() => {
    // 从 Supabase 读取已保存的数据
  }, []);

  // 保存数据
  useEffect(() => {
    if (!isStreaming && content) {
      // 保存到 Supabase
    }
  }, [isStreaming, content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await startStreaming("/api/{agent}", formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-[#0D0D0D]">
      {/* 顶部导航栏 */}
      <div className="h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="p-2 bg-{accent}-500 rounded-lg">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">标题</h1>
            <p className="text-xs text-slate-500">副标题</p>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex">
        {/* 左侧输入区 */}
        <div className="w-[400px] flex flex-col border-r">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 引导提示 */}
            {/* 输入表单 */}
            {/* 示例卡片 */}
            {/* 提交按钮 */}
          </div>
        </div>

        {/* 右侧输出区 */}
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-3 border-b">
            <h2 className="text-base font-semibold">输出标题</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <StreamingOutputCanvas content={content} isStreaming={isStreaming} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 实施计划

### 阶段 1: 验证现有设计
- [x] 天道·战略 - 已完成
- [ ] 神韵·内容 - 需更新为新风格

### 阶段 2: 创建新页面
- [ ] 地道·产品 (`/products` 更新)
- [ ] 人道·用户 (新建 `/users`)
- [ ] 法道·规则 (新建 `/rules`)
- [ ] 财道·财务 (新建 `/finance`)

### 阶段 3: API 集成
- [ ] 为每个智能体创建对应的 API 端点
- [ ] 集成 Dify 工作流

---

## 📚 参考资料
- [天道·战略页面](/app/strategy/page.tsx) - 已完成的参考实现
- [神韵·内容页面](/app/content-factory/page.tsx) - 现有实现
- [飞书设计规范](https://www.figma.com/file/L7lFjOMFfYR2KWkOKS0wPs/)
