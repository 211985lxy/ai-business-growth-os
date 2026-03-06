# 六脉重新定义 - 更新清单

> 2026年3月2日：基于对商业本质的深刻理解，重新定义六脉
> 核心修正：地道→利、人道→人和、强调内容

---

## 📋 核心修正

| 原定义 | 新定义 | 核心逻辑 |
|--------|--------|---------|
| 地道·产业 | **地利·产品** | **产品足够长，就是产业** |
| 人道·流量 | **人和·模式** | **商业模式：团结谁、对抗谁** |
| 神韵·内容 | **神韵·内容** | **内容时代，内容即流量**（更强调） |

---

## 🎯 新六脉核心逻辑

```
天道·战略（天）    → 方向在哪？（定位）
地利·产品（地）    → 产品是啥？（产品矩阵）
人和·模式（人）    → 团结谁、对抗谁？（商业模式）
神韵·内容（神）    → 内容即流量（品牌IP）
财帛·转化（财）    → 怎么赚钱？（变现路径）
法度·风险（法）    → 什么不能做？（合规边界）
```

**逻辑流：**
```
战略 → 产品 → 模式 → 内容 → 变现 → 合规
（方向）（卖什么）（怎么团结）（获客）（赚钱）（边界）
```

---

## 📄 需要更新的文件

### ✅ 已创建（新文档）

- [x] [SIX_MERIDIAN_REDEFINED.md](./SIX_MERIDIAN_REDEFINED.md) - 重新定义说明
- [x] [CODE_TEMPLATE_V3.md](./CODE_TEMPLATE_V3.md) - 代码模板
- [x] [UPDATE_CHECKLIST.md](./UPDATE_CHECKLIST.md) - 本文件

### 🔴 需要更新（现有文档）

- [ ] [SWARM_INTELLIGENCE.md](./SWARM_INTELLIGENCE.md)
  - 更新Agent名称（地道→利、人道→人和）
  - 更新蜂群拓扑图
  - 更新Agent能力矩阵

- [ ] [SWARM_PROTOCOL.md](./SWARM_PROTOCOL.md)
  - 更新AgentType类型
  - 更新示例代码

- [ ] [ARCHITECTURE_ROADMAP.md](./ARCHITECTURE_ROADMAP.md)
  - 更新蜂群拓扑图
  - 更新技术栈说明

- [ ] [ORIGIN_AND_SOUL.md](./ORIGIN_AND_SOUL.md)
  - 更新六脉哲学部分

- [ ] [TECH_PHILOSOPHY.md](./TECH_PHILOSOPHY.md)
  - 更新Agent协同逻辑

### 🟡 可选更新

- [ ] [DEVELOPER_MANTRA.md](./DEVELOPER_MANTRA.md) - ✅ 已部分更新
- [ ] [SIXVEIN_GROWTH_V3.md](./SIXVEIN_GROWTH_V3.md) - 原有文档

---

## 💻 需要更新的代码

### 1. 类型定义

```typescript
// lib/swarm/agent-types.ts

// ❌ 旧定义
export type AgentType =
  | "Queen"
  | "天道·战略"
  | "神韵·内容"
  | "地道·产业"      // 改
  | "人道·流量"      // 改
  | "法度·风险"
  | "财帛·转化";

// ✅ 新定义
export type AgentType =
  | "Queen"
  | "天道·战略"
  | "地利·产品"      // 改名
  | "人和·模式"      // 改名
  | "神韵·内容"
  | "财帛·转化"
  | "法度·风险";
```

### 2. Agent配置

```typescript
// app/api/workplace/route.ts

const AGENT_CONFIG: Record<AgentType, AgentConfig> = {
  天道·战略: {
    apiKeyEnv: "DIFY_STRATEGY_KEY",
    description: "天道·战略 - 方向在哪？（定位）",
    // ...
  },
  地利·产品: {    // 改名：地道·产业 → 地利·产品
    apiKeyEnv: "DIFY_PRODUCT_KEY",
    description: "地利·产品 - 产品是啥？（产品矩阵）",
    requiresStrategyContext: true,
  },
  人和·模式: {    // 改名：人道·流量 → 人和·模式
    apiKeyEnv: "DIFY_MODEL_KEY",
    description: "人和·模式 - 团结谁、对抗谁？（商业模式）",
    requiresStrategyContext: true,
  },
  神韵·内容: {
    apiKeyEnv: "DIFY_CONTENT_KEY",
    description: "神韵·内容 - 内容即流量（品牌IP）",
    // ...
  },
  // ...
};
```

### 3. 环境变量

```bash
# .env.example

# 六脉Agent API Keys
DIFY_STRATEGY_KEY=your_strategy_key
DIFY_PRODUCT_KEY=your_product_key      # 新增：地利·产品
DIFY_MODEL_KEY=your_model_key          # 新增：人和·模式
DIFY_CONTENT_KEY=your_content_key
DIFY_MONEY_KEY=your_money_key
DIFY_LAW_KEY=your_law_key
```

### 4. UI文本

```tsx
// app/strategy/page.tsx (或其他页面)

// 更新示例和描述
const exampleQuestions: ExampleQuestion[] = [
  {
    id: 1,
    text: "我是做美业培训的，如何定义我的核心产品？",
    category: "地利·产品",  // 如果有UI分类
  },
  {
    id: 2,
    text: "如何设计一个能团结更多人的商业模式？",
    category: "人和·模式",
  },
  // ...
];
```

---

## 🗂️ 数据库迁移

```sql
-- supabase/migration_rename_agents.sql

-- 更新 agent_outputs 表的 agent_type 约束
ALTER TABLE agent_outputs
DROP CONSTRAINT agent_outputs_agent_type_check;

ALTER TABLE agent_outputs
ADD CONSTRAINT agent_outputs_agent_type_check
CHECK (agent_type IN (
  'Queen', '天道·战略', '地利·产品', '人和·模式',
  '神韵·内容', '财帛·转化', '法度·风险'
));

-- 更新现有数据（如果已有）
UPDATE agent_outputs
SET agent_type = CASE
  WHEN agent_type = '地道·产业' THEN '地利·产品'
  WHEN agent_type = '人道·流量' THEN '人和·模式'
  ELSE agent_type
END;
```

---

## 📝 新的Agent能力说明

### 地利·产品（原名：地道·产业）

**对用户的话术：**
```
"我们的地利·产品Agent可以帮你：
- 定义核心产品（先做什么？）
- 设计产品矩阵（如何扩展？）
- 构建产品护城河（如何形成壁垒？）

核心逻辑：产品足够长，就是产业"
```

### 人和·模式（原名：人道·流量）

**对用户的话术：**
```
"我们的人和·模式Agent可以帮你：
- 设计商业模式（谁为你付费？）
- 找到盟友（谁能帮你获客？）
- 识别对手（谁是竞争对手？）
- 建立生态（如何团结更多人？）

核心逻辑：商业模式 = 团结谁 + 对抗谁"
```

---

## 🔄 迁移步骤

### Step 1: 更新文档
```bash
# 1. 更新 SWARM_INTELLIGENCE.md
# 2. 更新 SWARM_PROTOCOL.md
# 3. 更新 ARCHITECTURE_ROADMAP.md
```

### Step 2: 更新代码
```bash
# 1. 更新类型定义
# 2. 更新Agent配置
# 3. 更新环境变量
```

### Step 3: 数据库迁移
```bash
# 运行迁移脚本
supabase migration up
```

### Step 4: 测试验证
```bash
# 测试每个Agent
npm run test:agents
```

---

## ⚠️ 兼容性说明

### 向后兼容

为了保证平滑过渡，建议：

1. **Phase 1**: 保留旧名称作为别名
```typescript
// 保留兼容性
type LegacyAgentType =
  | "地道·产业"
  | "人道·流量";

// 支持新旧名称解析
function parseAgentType(input: string): AgentType {
  const mapping: Record<string, AgentType> = {
    "地道·产业": "地利·产品",
    "人道·流量": "人和·模式",
  };
  return mapping[input] || input as AgentType;
}
```

2. **Phase 2**: 更新Dify工作流
- 重命名对应的Dify Workflow
- 更新提示词中的描述

3. **Phase 3**: 清理旧代码
- 移除兼容性代码
- 更新所有引用

---

## 📚 参考文档

### 为什么这样改？

**1. 地道 → 利（产品核心）**
- "地道"让人想到基础设施、供应链，太重了
- "地利"更精准：产品是核心，产品足够长就是产业
- 符合中国商业"单点突破，逐步扩展"的实际

**2. 人道 → 人和（商业模式）**
- "人道"让人想到流量、获客，太表面了
- "人和" = 商业模式 = 团结谁 + 对抗谁
- 这是生态设计能力，比流量更深

**3. 内容更强调**
- 2026年，内容是获取流量的最高效方式
- 好的内容 = 免费流量 = 持续获客
- 内容是连接产品与商业的桥梁

### 实战案例

```
美业培训创业者的六脉路径：

1. 天道·战略：定位创业者教育（差异化）
2. 地利·产品：实战课程 → SaaS工具 → 供应链平台
3. 人和·模式：盟友（培训机构）+ 客户（从业者）
4. 神韵·内容：小红书内容 → 免费流量 → 持续获客
5. 财帛·转化：免费 → 低价 → 中价 → 高价
6. 法度·风险：全程合规审查
```

---

## ✅ 完成检查

- [ ] 所有文档已更新
- [ ] 代码已更新
- [ ] 数据库已迁移
- [ ] 环境变量已更新
- [ ] 测试已通过
- [ ] 文档已同步

---

> 这次修正不是命名游戏，而是对商业本质的深刻理解
> 让六脉真正成为中国创业者的实战工具
>
> ——— 2026年3月2日
> ——— 版本：v3.0（接地气版）
