# 六脉增长系统 - UI 设计系统文档

> 基于 Next.js 16 + Tailwind CSS + shadcn/ui 的现代企业级设计系统

---

## 📋 目录

1. [设计理念](#设计理念)
2. [色彩系统](#色彩系统)
3. [字体排版](#字体排版)
4. [布局系统](#布局系统)
5. [组件库](#组件库)
6. [动画与交互](#动画与交互)
7. [响应式设计](#响应式设计)
8. [暗色模式](#暗色模式)
9. [设计规范](#设计规范)

---

## 🎨 设计理念

### 核心原则

- **简洁高效**：Lobe Hub 风格，干净专业的界面
- **深色优先**：默认支持暗色模式，提供更好的视觉体验
- **高对比度**：确保所有文本都有足够的对比度，符合 WCAG 标准
- **流畅过渡**：所有交互都有平滑的动画过渡（200-300ms）
- **渐进增强**：从基础功能开始，逐步添加高级特性

### 设计语言

```
现代极简 + 企业级可信赖感
├── 清晰的视觉层次
├── 充足的留白空间
├── 精致的微交互
└── 一致的设计语言
```

---

## 🌈 色彩系统

### 主色调

```css
/* 琥珀金 - 强调色和品牌色 */
--primary: 43 96% 56%          /* Amber-500 */
--primary-foreground: 222.2 84% 4.9%  /* Slate-900 */
```

**应用场景：**
- 主要按钮 (CTA)
- 重要强调元素
- 品牌标识
- 激活状态指示器

### 中性色系统

```css
/* 浅色模式 */
--background: 255 255 255      /* 纯白背景 */
--foreground: 222.2 84% 4.9%   /* Slate-900 文本 */
--border: 214.3 31.8% 91.4%    /* Slate-200 边框 */

/* 深色模式 */
--background: 222.2 84% 4.9%   /* Slate-900 背景 */
--foreground: 210 40% 98%      /* 接近白色文本 */
--border: 215 20% 25%          /* 深色边框 */
```

### 语义化颜色

```css
/* 成功/提示 */
--success: 142 76% 36%         /* Emerald-600 */

/* 错误/危险 */
--destructive: 0 84.2% 60.2%   /* Red-500 */

/* 信息 */
--info: 199 89% 48%            /* Sky-500 */

/* 警告 */
--warning: 43 96% 56%          /* Amber-500 */
```

### 色彩使用规范

| 场景 | 浅色模式 | 深色模式 |
|------|----------|----------|
| 页面背景 | `bg-white` | `bg-zinc-950` / `dark:bg-[#0D0D0D]` |
| 卡片背景 | `bg-white` | `bg-zinc-950` |
| 次要背景 | `bg-zinc-50` | `bg-zinc-900/50` |
| 边框 | `border-zinc-200` | `border-zinc-800` |
| 主要文本 | `text-zinc-900` | `text-zinc-100` |
| 次要文本 | `text-zinc-500` | `text-zinc-400` |
| 禁用文本 | `text-zinc-400` | `text-zinc-600` |

---

## ✍️ 字体排版

### 字体家族

```css
/* 主字体 - Inter（英文 + 数字） */
--font-sans: var(--font-inter);

/* 标题字体 - Outfit（现代化标题） */
--font-outfit: var(--font-outfit);

/* 等宽字体 - Geist Mono（代码） */
--font-mono: var(--font-geist-mono);
```

### 字体大小系统

| 用途 | 大小 | 类名 | 示例 |
|------|------|------|------|
| 大标题 | 2.5rem (40px) | `text-4xl` | 页面主标题 |
| 标题 | 2rem (32px) | `text-3xl` | 区块标题 |
| 副标题 | 1.5rem (24px) | `text-2xl` | 次级标题 |
| 大正文 | 1.25rem (20px) | `text-xl` | 重要内容 |
| 正文 | 1rem (16px) `text-base` | 基础文本 |
| 小正文 | 0.875rem (14px) | `text-sm` | 辅助说明 |
| 标注 | 0.75rem (12px) | `text-xs` | 元数据 |
| 微标注 | 0.625rem (10px) | 自定义 | 标签、计数 |

### 字重系统

```css
font-light:      300  /* 轻盈文本 */
font-normal:     400  /* 常规文本 */
font-medium:     500  /* 中等强调 */
font-semibold:   600  /* 强调文本 */
font-bold:       700  /* 标题文本 */
```

### 排版最佳实践

```tsx
/* 页面标题 */
<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
  六脉增长系统
</h1>

/* 卡片标题 */
<h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
  神韵 · 内容
</h2>

/* 正文 */
<p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
  这是正文内容...
</p>

/* 标签/标注 */
<span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-outfit">
  CONTENT FACTORY
</span>
```

---

## 📐 布局系统

### 圆角系统

```css
--radius-sm:  calc(var(--radius) - 4px)  /* 4px - 小元素 */
--radius-md:  calc(var(--radius) - 2px)  /* 6px - 中等元素 */
--radius-lg:  var(--radius)              /* 8px - 默认 */
--radius-xl:  calc(var(--radius) + 4px)  /* 12px - 大元素 */
--radius-2xl: calc(var(--radius) + 8px)  /* 16px - 卡片 */
--radius-3xl: calc(var(--radius) + 12px) /* 20px - 模态框 */
```

### 间距系统

使用 Tailwind 的默认间距比例：

| Token | 值 | 用途 |
|-------|-----|------|
| `1` | 0.25rem (4px) | 紧密间距 |
| `2` | 0.5rem (8px) | 小间距 |
| `3` | 0.75rem (12px) | 内边距 |
| `4` | 1rem (16px) | 标准间距 |
| `5` | 1.25rem (20px) | 舒适间距 |
| `6` | 1.5rem (24px) | 大间距 |
| `8` | 2rem (32px) | 区块间距 |

### 容器宽度

```tsx
{/* 标准容器 */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* 内容 */}
</div>

{/* 紧凑容器 */}
<div className="max-w-4xl mx-auto px-4">
  {/* 内容 */}
</div>

{/* 全宽容器 */}
<div className="w-full">
  {/* 内容 */}
</div>
```

### 分屏布局

```tsx
{/* Agent 布局 - 左右分屏 */}
<div className="flex h-screen">
  {/* 左侧输入面板 - 可折叠 */}
  <div className={cn(
    "transition-all duration-300",
    inputWidthMode === "full" ? "w-1/2" :
    inputWidthMode === "narrow" ? "w-96" :
    "w-0"
  )}>
    {inputComponent}
  </div>

  {/* 右侧输出画布 */}
  <div className="flex-1 overflow-y-auto">
    {outputComponent}
  </div>
</div>
```

---

## 🧩 组件库

### 按钮 (Button)

#### 主要变体

```tsx
// 主要按钮 - 琥珀金
<Button variant="default">
  主要操作
</Button>

// 次要按钮 - 灰色轮廓
<Button variant="outline">
  次要操作
</Button>

// 危险按钮 - 红色
<Button variant="destructive">
  删除
</Button>

// 幽灵按钮 - 透明背景
<Button variant="ghost">
  取消
</Button>

// 渐变按钮
<Button variant="gradient">
  特殊强调
</Button>

// 玻璃态按钮
<Button variant="glass">
  浮层操作
</Button>
```

#### 尺寸

```tsx
<Button size="xs">    {/* 超小 */}</Button>
<Button size="sm">    {/* 小 */}</Button>
<Button size="default">{/* 默认 */}</Button>
<Button size="lg">    {/* 大 */}</Button>
<Button size="icon">  {/* 图标 */}</Button>
```

#### 实际应用示例

```tsx
{/* 提交表单 - 主要按钮 */}
<button className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-zinc-100 dark:text-zinc-900 font-semibold rounded-xl shadow-lg shadow-zinc-900/10 dark:shadow-white/5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
  <Sparkles className="w-4 h-4" />
  <span>一键生成内容</span>
</button>

{/* 次要操作 - 轮廓按钮 */}
<button className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
  取消
</button>

{/* 图标按钮 */}
<button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
  <MaterialIcon icon="close" size={20} />
</button>
```

### 卡片 (Card)

```tsx
{/* 标准卡片 */}
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述</CardDescription>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
  <CardFooter>
    {/* 底部操作 */}
  </CardFooter>
</Card>

{/* 玻璃态卡片 */}
<Card variant="glass" className="glass shadow-lg border-white/10">
  {/* 内容 */}
</Card>
```

### 输入框 (Input)

```tsx
{/* 标准文本输入 */}
<Input
  type="text"
  placeholder="请输入..."
  className="w-full"
/>

{/* 带图标的输入框 */}
<div className="relative">
  <MaterialIcon icon="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
  <input
    type="text"
    placeholder="搜索..."
    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-4 focus:ring-zinc-500/5"
  />
</div>

{/* 文本域 */}
<textarea
  rows={5}
  placeholder="请输入内容..."
  className="w-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 pt-4 pb-12 text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-4 focus:ring-zinc-500/5 resize-none transition-all duration-300 leading-relaxed"
/>
```

### 标签 (Badge)

```tsx
{/* 默认标签 */}
<Badge>默认</Badge>

{/* 不同颜色的标签 */}
<Badge variant="default">默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="destructive">错误</Badge>
<Badge variant="outline">轮廓</Badge>
```

### 加载状态 (Loading)

```tsx
{/* 旋转加载器 */}
<div className="w-5 h-5 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin" />

{/* 骨架屏 */}
<div className="animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded-lg h-20" />

 {/* 文本加载 */}
<div className="flex items-center gap-2 text-sm text-zinc-500">
  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  <span>加载中...</span>
</div>
```

### 分割线 (Separator)

```tsx
<Separator className="my-4" />
```

---

## 🎭 动画与交互

### 全局过渡

```css
/* 所有元素默认过渡 */
*,
*::before,
*::after {
  transition: all 200ms ease-out;
}

/* 禁用过渡的元素 */
img,
video,
canvas {
  transition: none;
}
```

### 内置动画类

```css
/* 淡入 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* 滑入 */
.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

/* 缩放进入 */
.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}

/* Shimmer 效果 */
.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* 微妙的脉冲 */
.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

/* Blob 动画 */
.animate-blob {
  animation: blob 7s infinite;
}
```

### 交互模式

#### Hover 效果

```tsx
{/* 悬停提升 */}
<div className="hover-lift">
  {/* 内容 */}
</div>

{/* 悬停阴影 */}
<div className="transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl">
  {/* 内容 */}
</div>

{/* 悬停缩放 */}
<button className="transform hover:scale-105 active:scale-95 transition-transform">
  点击
</button>
```

#### Focus 状态

```tsx
{/* 焦点环 */}
<div className="focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
  {/* 内容 */}
</div>

{/* 输入焦点 */}
<input className="focus:border-primary focus:ring-2 focus:ring-primary/20" />
```

#### Active 状态

```tsx
{/* 按下效果 */}
<button className="active:translate-y-px active:shadow-sm">
  点击
</button>
```

---

## 📱 响应式设计

### 断点系统

```css
sm:  640px   /* 手机横屏 */
md:  768px   /* 平板竖屏 */
lg:  1024px  /* 平板横屏/小笔记本 */
xl:  1280px  /* 桌面 */
2xl: 1536px  /* 大屏幕 */
```

### 响应式模式

```tsx
{/* 隐藏/显示 */}
<div className="hidden md:block">桌面可见</div>
<div className="block md:hidden">移动端可见</div>

{/* 网格布局 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 自适应列数 */}
</div>

{/* 字体大小 */}
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  响应式标题
</h1>

{/* 间距 */}
<div className="px-4 md:px-6 lg:px-8">
  {/* 响应式内边距 */}
</div>
```

---

## 🌙 暗色模式

### 切换机制

```tsx
// 使用 ThemeProvider
<ThemeProvider>
  <App />
</ThemeProvider>

// 切换主题
const { theme, setTheme } = useTheme();
setTheme("light");
setTheme("dark");
setTheme("system");
```

### 暗色模式最佳实践

```tsx
{/* 背景颜色 */}
<div className="bg-white dark:bg-zinc-950">
  {/* 自动适配背景 */}
</div>

{/* 文本颜色 */}
<p className="text-zinc-900 dark:text-zinc-100">
  {/* 自动适配文本 */}
</p>

{/* 边框 */}
<div className="border border-zinc-200 dark:border-zinc-800">
  {/* 自动适配边框 */}
</div>

{/* 组合使用 */}
<button className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
  按钮
</button>
```

### 暗色模式优化

- **深色背景不是纯黑**：使用 `zinc-950` 或 `#0D0D0D` 而不是纯黑
- **提高对比度**：确保文本与背景有足够对比
- **减少边框强度**：暗色模式下边框更淡
- **调整阴影**：暗色模式下阴影使用白色/透明度

---

## 📏 设计规范

### 间距规则

1. **使用 4px 基准单位**：所有间距应该是 4 的倍数
2. **保持一致性**：相同类型的元素使用相同间距
3. **留白充足**：给内容足够的呼吸空间

### 对齐规则

1. **左对齐文本**：西文和数字左对齐
2. **居中标题**：页面和区块标题可以居中
3. **顶部对齐**：表单标签和输入框顶部对齐

### 层次规则

```tsx
{/* 页面层级 */}
<div className="space-y-8">
  <section className="space-y-4">
    <div className="space-y-2">
      {/* 8-4-2 间距层级 */}
    </div>
  </section>
</div>
```

### 图标使用

```tsx
{/* Material Icons - 主要图标库 */}
<MaterialIcon icon="add" size={20} />

{/* Lucide React - 辅助图标 */}
<Sparkles className="w-4 h-4" />

{/* 图标尺寸 */}
size={16}  {/* 小图标 */}
size={20}  {/* 标准图标 */}
size={24}  {/* 大图标 */}
size={32}  /* 超大图标 */
```

### 状态设计

```tsx
{/* 默认状态 */}
<button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
  默认
</button>

{/* 悬停状态 */}
<button className="hover:bg-zinc-200 dark:hover:bg-zinc-700">
  悬停
</button>

{/* 激活状态 */}
<button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
  激活
</button>

{/* 禁用状态 */}
<button disabled className="opacity-50 cursor-not-allowed">
  禁用
</button>

{/* 加载状态 */}
<button className="flex items-center gap-2">
  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  加载中
</button>
```

---

## 🎯 特殊组件

### 玻璃态效果 (Glass)

```tsx
<div className="glass">
  {/* bg-background/80 backdrop-blur-xl border border-border/50 */}
</div>
```

### 渐变文本

```tsx
<h1 className="gradient-text">
  {/* bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300 */}
  渐变标题
</h1>
```

### 悬停提升

```tsx
<div className="hover-lift">
  {/* transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl */}
</div>
```

---

## 🔧 工具类

### 常用组合

```tsx
{/* Flex 居中 */}
<div className="flex items-center justify-center">

{/* Flex 间距 */}
<div className="flex items-center gap-4">

{/* Grid 居中 */}
<div className="grid place-items-center">

{/* 绝对居中 */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

{/* 文本截断 */}
<p className="truncate">

{/* 多行文本截断 */}
<p className="line-clamp-2">
```

---

## 📚 参考资料

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 组件](https://ui.shadcn.com)
- [Lobe Hub 设计系统](https://github.com/lobehub/lobe-ui)
- [Material Symbols](https://fonts.google.com/icons)

---

## 📝 更新日志

### 2026-03-04
- 初始设计系统文档
- 定义色彩、字体、布局系统
- 整理组件库规范
- 添加暗色模式支持

---

**文档版本**: 1.0.0
**最后更新**: 2026-03-04
**维护者**: 六脉增长系统团队
