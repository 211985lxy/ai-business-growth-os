# 六脉增长系统 — 设计系统规范 v1.0

> 所有页面、组件、未来新功能的 UI 开发，必须严格遵守本文档。
> 本文档是唯一的设计真理源（Single Source of Truth）。

---

## 一、设计哲学

**参考标杆**：Google AI Studio（布局） + 飞书（暗色模式） + Linear（简洁感）

**核心原则**：
- 干净 > 花哨：不要任何纯装饰元素（SVG曲线、渐变色块、浮动形状）
- 功能 > 美观：每个UI元素都必须有明确功能，没有功能就删掉
- 一致 > 个性：所有页面用同一套规范，不要每个页面自己发明样式

---

## 二、颜色系统

### 暗色模式（主模式）

| 用途 | 颜色 | Tailwind |
|------|------|----------|
| 左侧导航背景 | #0A0A0A | `bg-[#0A0A0A]` |
| 中间输入区背景 | #111111 | `bg-[#111111]` |
| 右侧输出区背景 | #161616 | `bg-[#161616]` |
| 区域分割线 | rgba(255,255,255,0.06) | `border-white/6` |
| 主文字 | #CBD5E1 | `text-slate-300` |
| 次要文字 | #64748B | `text-slate-500` |
| 禁用文字 | #475569 | `text-slate-600` |
| 强调色 | #6366F1 | `text-indigo-500` / `bg-indigo-600` |
| 强调色hover | #818CF8 | `hover:bg-indigo-500` |
| 危险色 | #EF4444 | `text-red-500` |
| 成功色 | #22C55E | `text-green-500` |
| 卡片背景 | rgba(255,255,255,0.03) | `bg-white/3` |
| 卡片hover | rgba(255,255,255,0.06) | `hover:bg-white/6` |
| 输入框背景 | rgba(255,255,255,0.05) | `bg-white/5` |
| 输入框边框 | rgba(255,255,255,0.1) | `border-white/10` |
| 输入框focus边框 | #6366F1 | `focus:border-indigo-500` |

### 浅色模式

| 用途 | 颜色 | Tailwind |
|------|------|----------|
| 左侧导航背景 | #F5F5F5 | `bg-[#F5F5F5]` |
| 中间输入区背景 | #FAFAFA | `bg-[#FAFAFA]` |
| 右侧输出区背景 | #FFFFFF | `bg-white` |
| 区域分割线 | #E2E8F0 | `border-slate-200` |
| 主文字 | #1E293B | `text-slate-800` |
| 次要文字 | #64748B | `text-slate-500` |

---

## 三、排版系统

### 字体
```
font-family: "PingFang SC", "SF Pro Display", -apple-system, "Helvetica Neue", sans-serif;
```

### 字号层级

| 名称 | 大小 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| 页面标题 | 18px (text-lg) | 28px | font-semibold (600) | 模块名称 |
| 区域标题 | 14px (text-sm) | 20px | font-semibold (600) | 区域header |
| 正文 | 14px (text-sm) | 22px | font-normal (400) | 输入框、内容 |
| 辅助文字 | 12px (text-xs) | 18px | font-medium (500) | 标签、按钮 |
| 微小文字 | 11px (text-[11px]) | 16px | font-normal (400) | 时间戳、提示 |

### 规则
- 不用 text-xl 或更大的字号（除非是landing page）
- 不用 font-bold (700)，最重用 font-semibold (600)
- 中文内容行高至少 1.6

---

## 四、间距系统

基础单位：4px

| 名称 | 值 | 用途 |
|------|------|------|
| xs | 4px (p-1) | 图标与文字间距 |
| sm | 8px (p-2) | 紧凑元素间距 |
| md | 12px (p-3) | 卡片内边距 |
| lg | 16px (p-4) | 区域内边距 |
| xl | 24px (p-6) | 大区域内边距 |
| 2xl | 32px (p-8) | 页面级内边距 |

### 规则
- 同级元素间距统一用 space-y-2 或 space-y-3
- 不同区域间用 border + 不同背景色区分，不用大间距
- 面板内边距统一 p-4

---

## 五、组件规范

### 5.1 按钮

**主按钮（CTA）**
```
bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium
rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md
transition-all duration-200
disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed
```

**次要按钮**
```
bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300
text-xs font-medium rounded-lg px-3 py-2
transition-all duration-200
```

**危险按钮**
```
bg-red-600/10 hover:bg-red-600/20 text-red-400
text-xs font-medium rounded-lg px-3 py-2
transition-all duration-200
```

**图标按钮**
```
w-8 h-8 rounded-lg flex items-center justify-center
hover:bg-white/6 transition-colors duration-200
```

### 5.2 折叠按钮（全局标准）

这是所有面板折叠按钮的唯一标准样式：

```tsx
<button
  onClick={toggle}
  className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2
    w-6 h-12 rounded-full z-20
    bg-white dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    shadow-md hover:shadow-lg
    hover:bg-indigo-50 dark:hover:bg-indigo-950
    hover:border-indigo-300 dark:hover:border-indigo-700
    flex items-center justify-center
    transition-all duration-200"
>
  <MaterialIcon
    icon={collapsed ? "chevron_right" : "chevron_left"}
    size={18}
    className="text-slate-500 hover:text-indigo-600 transition-colors"
  />
</button>
```

特征：
- 始终可见，不要 opacity-0
- 宽6高12，圆形胶囊
- 有阴影，hover变大
- z-20 确保在最上层

### 5.3 输入框

```
w-full bg-white/5 border border-white/10 rounded-lg
px-3 py-2.5 text-sm text-slate-300
placeholder:text-slate-600
focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
transition-all duration-200
```

### 5.4 卡片（如示例问题、历史记录）

```
p-3 bg-white/3 border border-white/6 rounded-lg
hover:bg-white/6 hover:border-indigo-500/30
transition-all duration-200 cursor-pointer
```

### 5.5 标签（Tag）

```
inline-flex items-center gap-1 px-2.5 py-1
bg-indigo-500/10 text-indigo-400 border border-indigo-500/20
rounded-md text-xs font-medium
```

### 5.6 空状态

```tsx
<div className="h-full flex flex-col items-center justify-center px-6">
  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-5">
    <MaterialIcon icon="lightbulb" size={28} className="text-indigo-400" />
  </div>
  <h3 className="text-base font-semibold text-slate-300 mb-2">
    标题文字
  </h3>
  <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
    描述文字
  </p>
</div>
```

---

## 六、三栏布局规范

### 结构
```
[左侧导航 280px] | [中间输入区 400px] | [右侧输出区 flex-1]
```

### 折叠尺寸
- 左侧导航：展开 280px → 折叠 64px（只显示图标）
- 中间输入区：展开 400px → 折叠 48px（只显示"展开"文字按钮）
- 右侧输出区：不折叠，始终 flex-1

### 折叠行为
- 每个可折叠面板的右边缘有一个标准折叠按钮（见5.2）
- 折叠动画：transition-all duration-300 ease-in-out
- 折叠时内容用 opacity-0 + overflow-hidden 隐藏
- 展开时内容用 opacity-100 淡入（delay 150ms）
- 生成报告完成后，自动折叠中间输入区

### 左侧导航内容（从上到下）
1. 模块标题（如"天道·战略"）+ 副标题
2. "+ 新建" 按钮（只有一个，主按钮样式）
3. 搜索框
4. 历史记录列表（带时间戳，hover显示删除）
5. 底部操作区：暂停/继续、复制全文、前往下一模块

### 中间输入区内容（从上到下）
1. 主输入框（textarea）
2. 高级参数折叠区
3. 示例问题卡片
4. 生成按钮（主按钮样式，全宽）

### 右侧输出区
1. 无内容时：空状态（见5.6）
2. 生成中：流式Markdown渲染
3. 生成完成：完整Markdown报告 + 顶部工具栏（复制、导出）

---

## 七、动画与过渡

| 类型 | 时长 | 缓动 |
|------|------|------|
| 颜色/透明度变化 | 200ms | ease |
| 宽度/高度变化 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 弹窗出现 | 200ms | ease-out |
| 弹窗消失 | 150ms | ease-in |

### 规则
- 所有可交互元素必须有 transition
- 不用 framer-motion，全部用 CSS transition
- 不用 animate-bounce、animate-pulse 等花哨动画
- 唯一允许的动画：加载spinner (animate-spin)

---

## 八、图标系统

**唯一图标库**：Material Symbols（Google官方）

使用方式：
```tsx
<MaterialIcon icon="lightbulb" size={20} className="text-indigo-500" />
```

常用图标映射：
| 功能 | 图标名 |
|------|--------|
| 新建 | add |
| 搜索 | search |
| 删除 | delete |
| 编辑 | edit |
| 复制 | content_copy |
| 折叠左 | chevron_left |
| 折叠右 | chevron_right |
| 展开 | expand_more |
| 收起 | expand_less |
| 历史 | history |
| 设置 | settings |
| 播放 | play_arrow |
| 暂停 | pause |
| 麦克风 | mic |
| 全局搜索 | manage_search |
| 文档 | description |
| 战略 | lightbulb |
| 内容 | edit_note |
| 产业 | domain |
| 流量 | trending_up |
| 风险 | shield |
| 转化 | payments |

---

## 九、响应式规则

| 断点 | 行为 |
|------|------|
| ≥1280px | 三栏全显示 |
| 1024-1279px | 左侧自动折叠为图标栏 |
| 768-1023px | 左侧隐藏，中间+右侧双栏 |
| <768px | 单栏，tabs切换输入/输出 |

---

## 十、未来功能的设计预留

### 10.1 语音输入按钮
位置：主输入框内右下角
```tsx
<button className="absolute right-3 bottom-3 w-8 h-8 rounded-lg
  flex items-center justify-center
  hover:bg-white/6 transition-colors duration-200">
  <MaterialIcon icon="mic" size={20} className="text-slate-500 hover:text-indigo-500" />
</button>
```

### 10.2 全局搜索
位置：页面顶部居中，Cmd+K 快捷键触发
```tsx
// 触发按钮（放在顶部导航栏）
<button className="flex items-center gap-2 px-3 py-1.5
  bg-white/5 border border-white/10 rounded-lg
  text-xs text-slate-500 hover:text-slate-300
  transition-all duration-200">
  <MaterialIcon icon="search" size={16} />
  搜索全部模块...
  <kbd className="ml-2 px-1.5 py-0.5 bg-white/5 rounded text-[10px]">⌘K</kbd>
</button>

// 弹窗：居中，宽600px，搜索结果按模块分组
```

### 10.3 新增功能按钮的统一入口
不要到处加浮动按钮。所有辅助功能统一放在：
- 左侧面板底部的操作区
- 或输入框内的图标按钮（如语音、附件）
- 或右上角的工具栏（如导出、分享）

---

## 十一、禁止事项

1. ❌ 不用纯装饰SVG、曲线、渐变色块
2. ❌ 不用 emoji 作为UI元素
3. ❌ 不用橙色、粉色、绿色渐变按钮
4. ❌ 不用 opacity-0 的隐藏交互元素（用户找不到）
5. ❌ 不用超过 500 行的单文件
6. ❌ 不用 framer-motion
7. ❌ 不在同一区域放两个功能相同的按钮
8. ❌ 不用 font-bold (700)
9. ❌ 不用 text-xl 或更大字号
10. ❌ 不用 w-0 作为折叠状态（最小保留图标栏宽度）
