# 六脉增长系统 - 技术架构哲学

> 从技术视角阐述系统的设计思想和架构原则
> 与《产品原点与灵魂》配套，一个是 Why，一个是 How

---

## 一、技术选型的底层逻辑

### 1.1 为什么是 Next.js + React？

**不是因为"流行"，而是因为"合适"。**

| 需求 | Next.js 的能力 |
|------|---------------|
| 服务端渲染 | SEO 友好，首屏快 |
| API Routes | 前后端一体，降低复杂度 |
- 一个团队，全栈能力
- 降低认知负载

**"用最简单的技术，解决问题"**

---

### 1.2 为什么是 Supabase？

**Supabase = Firebase 开源版 + SQL**

| 我们的场景 | Supabase 的能力 |
|----------|----------------|
- 认证（登录/注册）| Supabase Auth |
- 数据库（结构化数据）| PostgreSQL |
- 实时订阅（可选）| Realtime |
- 文件存储（素材库）| Storage |

**一个服务，解决所有后端需求**

不需要：
- 单独部署数据库
- 单独做认证系统
- 单独管理文件存储

**对于小团队，这大大降低了基础设施复杂度**

---

### 1.3 为什么是 Dify？

**Dify 是智能体编排层，不是模型本身**

| 需求 | Dify 的能力 |
|------|-----------|
- 可视化构建 AI 工作流 | Chatflow / Workflow |
- 管理 Prompt | 提示词工程 |
- 工具调用（搜索、数据库）| Plugins |
- 对话管理 | Conversation ID |
- 流式输出 | Server-Sent Events |

**为什么不用直接调用 OpenAI API？**

因为真实业务需要：
- 复杂的多步骤推理
- 工具调用（如搜索行业数据）
- 上下文管理（跨轮对话）
- 可视化调试（非技术人员也能调整）

**Dify 让"提示词工程"变成"可视化搭建"**

---

### 1.4 为什么是 Tailwind CSS？

**"用约束释放创造力"**

传统 CSS：
- 需要命名的 class（btn-primary, card-hover...）
- 容易产生样式冗余
- 难以维护

Tailwind：
- 工具类即样式
- 强制设计系统（间距、颜色、字号）
- 团队协作时，风格天然一致

**通过约束，保证整个产品的视觉一致性**

---

## 二、架构设计的哲学

### 2.1 三栏布局不是 UI，是认知模型

```
[历史] | [输入] | [输出]
  ↑       ↑        ↑
过去    现在     未来
记忆   操作      预测
```

**这不是简单的布局，而是模仿人类思考模式：**

1. **左侧（历史）**：我的过往经验
2. **中间（输入）**：我现在的困惑
3. **右侧（输出）**：AI 对未来的预测

**AI 时代的界面范式 = 人机协作的思维可视化**

---

### 2.2 折叠机制 = 工作空间的伸缩性

**为什么需要折叠？**

因为不同阶段，注意力需求不同：

| 阶段 | 需要 | 不需要 |
|------|------|--------|
| 思考时 | 输入区 | 历史、输出 |
- 生成时 | 输出区 | 输入区（可以折叠）
- 阅读报告时 | 输出区（最大化）| 输入区

**"工作空间应该随任务伸缩"**

这比传统的"固定布局"更符合人机协作场景。

---

### 2.3 流式输出不是技术炫技，是信任建立

**为什么流式输出如此重要？**

用户心理：
- 黑屏等待 30 秒 → 焦虑（"是不是坏了？"）
- 看见文字逐字出现 → 释然（"AI 在思考"）

**流式输出 = 让用户看见 AI 的思考过程**

这不是为了"酷"，而是：
- 降低等待焦虑
- 建立过程透明
- 提供随时停止的控制权

---

### 2.4 上下文注入 = 六脉贯通的技术实现

**核心问题：如何让六个智能体共享信息？**

方案 A：让用户手动复制粘贴 ❌
- 用户体验差
- 容易出错

方案 B：统一的大上下文窗口 ❌
- Token 浪费
- 模型容易混淆

方案 C：结构化上下文注入 ✅
```typescript
// 天道·战略输出后
await saveStrategyContext({
  niche: "美业培训",
  audience: "二三线女性",
  positioning: "标准化服务流程"
});

// 神韵·内容读取
const strategy = await getStrategyContext();
const contentPrompt = `基于战略：${strategy.niche}，生成文案...`;
```

**"上下文不是把所有信息塞给模型，而是精准传递必要信息"**

---

### 2.5 localStorage 降级 = 永远可用的系统

**问题：Supabase 可能挂，用户可能未登录**

方案 A：强制登录 ❌
- 提高使用门槛
- 丢失潜在用户

方案 B：登录前功能不可用 ❌
- 用户无法体验价值
- 转化率低

方案 C：双存储策略 ✅
```typescript
// 已登录 → Supabase
// 未登录 → localStorage
// Supabase 挂了 → 降级到 localStorage
```

**"系统应该在任何情况下都能为用户提供服务"**

---

## 三、代码组织的哲学

### 3.1 通用组件的提取

**问题：六个模块，UI 结构相似，是否重复开发？**

Phase 1：先做一个模块（天道·战略），验证方案
Phase 2：提取通用组件
```typescript
// lib/three-column-layout.tsx (通用三栏布局)
// hooks/use-panel-collapse.ts (折叠逻辑)
// hooks/use-streaming-output.ts (流式输出)
```

**"先验证，再抽象"**

过早抽象是万恶之源：
- 可能抽象错了
- 浪费时间
- 增加复杂度

**先让一个模块完美可用，再提取通用模式**

---

### 3.2 组件粒度的控制

**原则：一个文件不超过 500 行**

为什么？
- 超过 500 行 = 该拆分了
- 小组件易于理解
- 小组件易于复用
- 小组件易于测试

**例子：**
```typescript
// app/strategy/page.tsx (主页面，700+ 行)
// ↓ 拆分为
components/strategy/strategy-sidebar.tsx
components/strategy/strategy-input.tsx
components/strategy/strategy-output.tsx
components/strategy/strategy-header.tsx
```

**"保持组件小而美"**

---

### 3.3 类型系统的严格

**为什么用 TypeScript？**

不是"炫技"，而是：
- 编译时捕获错误（vs 运行时）
- IDE 智能提示（提升开发效率）
- 代码即文档（类型即契约）

**严格模式：**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**"类型系统是免费的测试"**

---

## 四、数据持久化的哲学

### 4.1 为什么需要持久化？

**AI 不是一次性工具，是长期伙伴**

用户场景：
- 今天问战略，下周问内容，下月问流量
- 需要记住上下文
- 需要积累行业知识

**没有持久化的 AI = 没有记忆的顾问 = 价值大减**

---

### 4.2 数据库设计的思想

```sql
-- 核心表：战略上下文（跨模块共享）
strategy_contexts
  - user_id: 谁的战略
  - niche: 赛道定位
  - target_audience: 目标用户
  - differentiation: 差异化
  - output_content: AI 生成的完整报告
  - is_active: 是否是当前活跃的战略

-- 日志表：所有智能体的输出
agent_outputs
  - agent_type: 哪个智能体（strategy/content/...）
  - input_prompt: 用户输入
  - output_content: AI 输出
  - duration_ms: 耗时
  - status: 状态（completed/failed/timeout）
```

**设计原则：**
1. **战略上下文是核心资产**（跨模块共享）
2. **日志用于优化**（哪些智能体慢，哪些常失败）
3. **用户画像是护城河**（积累越多，AI 越懂用户）

---

### 4.3 数据飞轮的构建

```
用户使用 → 生成数据 → AI 更懂用户 → 输出更精准 → 更多用户使用
    ↑                                              ↓
    ───────────────── 数据飞轮 ────────────────────
```

**技术实现：**
```typescript
// 用户使用天道·战略
const strategy = await generateStrategy({ niche: "美业培训" });

// 匿名化数据积累（用于优化提示词）
await accumulateIndustryData({
  industry: "美业",
  sub_niche: "培训",
  success_metrics: { user_satisfaction: 4.8 }
});

// 后续用户问类似问题时
const similarCases = await findSimilarStrategies("美业培训");
const prompt = `基于 ${similarCases.length} 个成功案例，生成战略...`;
```

**"数据越多，护城河越深"**

---

## 五、安全与可靠性的哲学

### 5.1 超时控制 = 防止无限等待

**问题：外部 API 可能挂或超时**

```typescript
// ❌ 没有 timeout
fetch("https://api.dify.ai/...")  // 可能无限等待

// ✅ 有 timeout
fetchWithTimeout("https://api.dify.ai/...", { timeout: 60000 })
```

**"永远不要信任外部服务，总是设置超时"**

---

### 5.2 优雅降级 = 永远有备选方案

**Supabase 挂了怎么办？**

```typescript
try {
  // 尝试 Supabase
  await saveToSupabase(data);
} catch (error) {
  // 降级到 localStorage
  await saveToLocalStorage(data);
  console.warn("Supabase 不可用，降级到本地存储");
}
```

**"系统应该在部分失败时，仍然提供核心功能"**

---

### 5.3 输入验证 = 永远不信任用户输入

```typescript
// ❌ 直接使用
const niche = req.body.niche;

// ✅ 验证
const validated = validateNiche(req.body.niche);
if (!validated.valid) {
  return { error: validated.error };
}
```

**"所有输入都是恶意的，直到被证明不是"**

---

### 5.4 速率限制 = 防止滥用

```typescript
// 匿名用户：每小时 5 次
if (!userId && rateLimitExceeded(ip)) {
  return { error: "RATE_LIMIT_EXCEEDED" };
}

// 登录用户：基于积分扣除
if (user.credits < required) {
  return { error: "INSUFFICIENT_CREDITS" };
}
```

**"免费的东西，总会被滥用"**

---

## 六、性能优化的哲学

### 6.1 能用简单方案，就不用复杂方案

| 问题 | 复杂方案 | 简单方案 |
|------|---------|---------|
| 状态管理 | Redux/Zustand | React useState |
| 数据获取 | React Query | SWR / 原生 fetch |
| 样式 | CSS-in-JS | Tailwind CSS |

**"在 YAGNI 原则下，选择最简单的技术"**

---

### 6.2 流式输出不是为了快，是为了体验

**技术上：**
- 流式输出不会让总时间变短
- 甚至可能稍慢（分片传输有开销）

**体验上：**
- 用户感觉更快（立刻看到反馈）
- 降低等待焦虑
- 提供控制权（随时暂停）

**"性能优化不只是快，是感觉快"**

---

### 6.3 代码分割 = 按需加载

```typescript
// ❌ 一次性加载所有模块
import { StrategyPanel } from "./strategy";
import { ContentPanel } from "./content";
// ...

// ✅ 按需加载
const StrategyPanel = lazy(() => import("./strategy"));
const ContentPanel = lazy(() => import("./content"));
```

**"只加载用户当前需要的功能"**

---

## 七、未来扩展的哲学

### 7.1 模块化 = 渐进式升级

```
Phase 1: 天道·战略（单一模块）
Phase 2: 六脉贯通（模块协同）
Phase 3: OpenClaw 集成（多渠道）
Phase 4: 商业化（付费墙）
```

**每一层都是独立可用的，不是"全都做好再上线"**

---

### 7.2 接口预留 = 为未来做准备

```typescript
// lib/dify/client.ts 已预留
export async function callAgentSkill(
  agentType: "strategy" | "content" | "earth" | "man" | "law" | "money",
  input: Record<string, unknown>
): Promise<void> {
  // Phase 3: OpenClaw 集成
  // 目前是占位，未来接入真实 Agent
}
```

**"架构应该支持未来的扩展，而不是阻塞它"**

---

### 7.3 技术中立 = 不被单一供应商锁定

```typescript
// 统一的模型调用接口
interface ModelProvider {
  name: string;
  generate(prompt: string): Promise<string>;
}

// 可以切换不同供应商
const providers: ModelProvider[] = [
  new DifyProvider(),
  new SiliconFlowProvider(),  // Phase 2 新增
  new OpenAICloneProvider(),  // 未来可能的
];
```

**"架构应该支持供应商替换，而不是深度耦合"**

---

## 八、一句话总结技术哲学

**"用最简单的技术，解决最复杂的问题"**

或者更详细一点：

```
1. 技术是手段，产品是目的
2. 简单 > 复杂（如果简单能解决问题）
3. 用户体验 > 技术完美
4. 渐进式升级 > 一步到位
5. 数据积累 > 算法优化
6. 系统可靠性 > 功能丰富
```

---

> 与《产品原点与灵魂》配套阅读
> 前者是 Why，后者是 How
> 两者共同构成六脉增长系统的完整逻辑
>
> ——— 2026年3月2日
