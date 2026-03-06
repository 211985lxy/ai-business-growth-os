# 🏗️ Architecture Guide - Iron Laws of Code Organization

## 铁律一：UI 和逻辑必须分家 (Separation of Concerns)

### ❌ 错误做法（违反原则）

```tsx
// ❌ 组件里包含业务逻辑
function StrategyFormWrapper({ onSubmit }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // ❌ 业务逻辑在组件里
  useEffect(() => {
    checkAuth(); // 认证逻辑
  }, []);

  const handleSubmit = async (data) => {
    if (!isAuthenticated) {
      router.push("/auth/login"); // 路由逻辑
      return;
    }
    await onSubmit(data);
  };

  return <StrategyForm onSubmit={handleSubmit} />;
}
```

### ✅ 正确做法（遵循原则）

```tsx
// ✅ 页面层：负责所有业务逻辑
export default function StrategyPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // 页面层处理认证逻辑
  useEffect(() => {
    checkAuth();
  }, []);

  // 页面层处理数据获取和错误处理
  const handleGenerate = async (data) => {
    const response = await streamStrategyResearch(data);
    // ...
  };

  return (
    <AuthGuard isAuthenticated={isAuthenticated} onLogin={() => router.push("/auth/login")}>
      {/* UI 组件：只负责展示 */}
      <StrategyForm onSubmit={handleGenerate} />
    </AuthGuard>
  );
}
```

### 🎯 核心原则

| 层级                    | 职责                                                               | 示例                                      |
| ----------------------- | ------------------------------------------------------------------ | ----------------------------------------- |
| **页面层** (Page)       | • 业务逻辑<br>• 数据获取<br>• 状态管理<br>• 路由跳转<br>• 错误处理 | `app/strategy/page.tsx`                   |
| **UI 组件** (Component) | • 纯展示<br>• 接收 props<br>• 触发回调<br>• 零业务逻辑             | `<Button />`, `<Card />`, `<AuthGuard />` |

---

## 铁律二：利用 Layout 偷懒

### ✅ 利用现有的 Layout

你的项目已经有全局 Layout：

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header> {/* 导航栏 */} </header>
        <main>{children}</main>
        <footer> {/* 页脚 */} </footer>
      </body>
    </html>
  );
}
```

**好处：**

- ✅ 所有页面自动获得导航栏和页脚
- ✅ 无需在每个页面重复写共享 UI
- ✅ 修改一处，全局生效

### 💡 进阶：组 Layout（可选）

如果某些页面需要共享侧边栏：

```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar /> {/* 侧边栏 */}
      <main>{children}</main>
    </div>
  );
}
```

---

## 铁律三：不要过度封装

### ✅ 只抄"皮"，不抄"骨"

**Lobe Chat 的复杂功能（不要抄）：**

- ❌ Zustand 状态管理
- ❌ 插件系统
- ❌ 多语言 i18n
- ❌ 复杂的 Store

**Lobe Chat 的视觉样式（可以抄）：**

- ✅ 颜色系统（Slate 色系）
- ✅ 组件样式（Card、Button、Badge）
- ✅ 动画效果（FadeIn、SlideIn）
- ✅ Dark theme

### 🎨 你的策略：保持简单

```tsx
// ✅ 简单的数据流
const [data, setData] = useState("");

// ❌ 不需要复杂的 store
// const { data, setData } = useStore();
```

---

## 📦 当前架构概览

### 页面层 (app/\*\*/page.tsx)

**职责：** 业务逻辑、数据获取、状态管理

```
app/strategy/page.tsx
├── 认证检查
├── 数据获取 (streamStrategyResearch)
├── 错误处理
├── 状态管理
└── 组合 UI 组件
```

### UI 组件层 (components/)

**职责：** 纯展示、接收 props、触发回调

```
components/ui/
├── AuthGuard.tsx          → 纯 UI，显示认证状态
├── Card.tsx               → 纯 UI，展示卡片
├── Button.tsx             → 纯 UI，可点击按钮
├── Markdown.tsx           → 纯 UI，渲染 markdown
└── auth-guard.tsx         → 可复用的认证守卫 UI
```

### 业务组件层 (components/business/)

**职责：** 领域特定的 UI 组件

```
components/business/
├── split-screen-layout.tsx  → 布局组件
├── streaming-output.tsx     → 输出展示组件
├── strategy-form.tsx        → 策略表单 UI
└── script-form.tsx          → 脚本表单 UI
```

---

## 🔄 数据流向

```
用户操作
   ↓
页面层 (Page)
   ├─ 检查认证
   ├─ 获取数据
   ├─ 处理错误
   └─ 更新状态
   ↓
UI 组件 (Component)
   ├─ 接收 props
   ├─ 渲染 UI
   └─ 触发回调
   ↓
用户看到结果
```

---

## ✅ 验证清单

在写代码时，问自己：

### 1. UI 和逻辑是否分离？

- [ ] 组件是否只负责展示？
- [ ] 页面是否负责业务逻辑？
- [ ] 组件是否可以被其他页面复用？

### 2. 是否利用了 Layout？

- [ ] 共享 UI 是否在 layout.tsx 中？
- [ ] 是否避免了重复代码？

### 3. 是否保持了简单？

- [ ] 是否使用了简单的 useState？
- [ ] 是否避免了复杂的状态管理？
- [ ] 是否只抄了视觉样式？

---

## 📚 可复用组件示例

### AuthGuard 组件（新创建）

```tsx
import { AuthGuard } from "@/components/ui/auth-guard";

// 使用方式：纯 UI，零逻辑
<AuthGuard
  isAuthenticated={isAuthenticated} // 传入状态
  onLogin={() => router.push("/auth/login")} // 传入回调
  featureName="Strategy Center"
>
  <YourFormComponent />
</AuthGuard>;
```

### StreamingOutput 组件

```tsx
import { StreamingOutput } from "@/components/business/streaming-output";

// 使用方式：传入数据，组件只负责展示
<StreamingOutput
  title="Strategy Report"
  content={generatedContent} // 传入内容
  isStreaming={isGenerating} // 传入状态
/>;
```

---

## 🚀 未来扩展示例

这种架构的好处：**以后改什么都很简单**

### 场景 1：换 AI 模型（从 Dify 换到 OpenAI）

```tsx
// ✅ 只需改页面层的一个函数
import { streamOpenAI } from "@/actions/openai";

const handleGenerate = async (data) => {
  const response = await streamOpenAI(data); // 改这一行
  // ...
};

// ❌ UI 组件完全不用动
// <StreamingOutput /> 继续用
```

### 场景 2：在其他页面用相同表单

```tsx
// ✅ 直接复用，零修改
import { StrategyForm } from "@/components/business/strategy-form";

<StrategyForm onSubmit={handleGenerate} />;
```

### 场景 3：改变认证方式

```tsx
// ✅ 只需改页面层的认证逻辑
const checkAuth = async () => {
  const token = localStorage.getItem("token"); // 改成 JWT
  setIsAuthenticated(!!token);
};

// ❌ AuthGuard 组件完全不用动
```

---

## 📖 总结

遵循这三条铁律：

1. **UI 和逻辑分家** → 组件可复用，逻辑易修改
2. **利用 Layout** → 避免重复，一处修改全局生效
3. **不要过度封装** → 保持简单，只抄视觉样式

这样你的代码会：

- ✅ 易维护
- ✅ 易扩展
- ✅ 易测试
- ✅ 易理解
