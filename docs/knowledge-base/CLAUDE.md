# CLAUDE.md — 六脉增长系统项目指令

> 这是本项目的AI助手总指令文件。Claude Code在每次任务开始时会自动读取此文件。

## 项目概述

六脉增长系统是一个AI驱动的商业增长操作系统，帮助中小企业主和创业者制定增长策略。
技术栈：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase + Dify

## 必读文档（按优先级排列）

每次编码前，根据任务类型阅读对应文档：

### 编码任务
- `docs/AI_INSTRUCTION.md` — 代码规范、设计规范、Git规范（必读）

### 智能体/提示词任务
- `docs/knowledge-base/SKILL_INDEX.md` — 知识库索引，告诉你有哪些知识可用
- `docs/knowledge-base/thinking-core.md` — 刀法×心法思维内核（所有智能体共享的思维规则）

### 产品/业务任务
- `docs/methodology.md` — 六脉方法论（六脉是什么、服务谁、怎么用）
- `docs/architecture-v3.md` — 架构蓝图（技术方向和阶段规划）

## 六脉知识库架构

```
docs/knowledge-base/
├── SKILL_INDEX.md              ← 知识库总索引（先读这个）
├── thinking-core.md            ← 刀法×心法思维内核（所有智能体共享）
│
├── western-frameworks/         ← 西方商业分析工具
│   ├── mece-decomposition.md   ← MECE问题拆解模板
│   ├── porter-five-forces.md   ← 波特五力分析模板
│   ├── swot-analysis.md        ← SWOT分析模板
│   ├── blue-ocean-strategy.md  ← 蓝海战略模板
│   └── pyramid-principle.md    ← 金字塔原理输出规则
│
├── eastern-wisdom/             ← 东方经营智慧（隐性，不向用户展示术语）
│   ├── yijing-business.md      ← 易经三易+阴阳辩证的商业决策规则
│   ├── daodejing-strategy.md   ← 道德经经营智慧
│   ├── sunzi-competition.md    ← 孙子兵法竞争策略
│   ├── timing-cycles.md        ← 时运周期与行业节奏
│   └── wuxing-archetypes.md    ← 五行人格原型（用户画像增强）
│
└── industry-templates/         ← 行业分析模板（按需扩展）
    └── _template.md            ← 行业模板的模板
```

## 知识库使用规则

1. 编写或修改智能体提示词时，先读 `thinking-core.md` 了解思维规则
2. 分析具体问题时，根据需要读取 `western-frameworks/` 中的工具模板
3. 东方智慧是**隐性融入**的——AI用这些原则思考，但不向用户展示术语
4. 行业模板按需创建，不要提前写没验证过的行业

## 快速命令

```bash
# 启动开发
npm run dev

# 构建
npm run build
```

## 当前阶段

Phase 1：天道·战略 + 神韵·内容两个模块上线
详见 `docs/MVP上线行动清单.md`
