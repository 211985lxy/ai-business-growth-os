# Queen Agent 模型选择优化

> 大小模型混合策略：DeepSeek-V3 + Claude 3.5 Sonnet
>
> ——— 2026年3月2日 ——— v1.0

---

## 📋 目录

1. [模型分配策略](#模型分配策略)
2. [动态选择逻辑](#动态选择逻辑)
3. [成本优化](#成本优化)
4. [监控与调优](#监控与调优)
5. [实现代码](#实现代码)

---

## 一、模型分配策略

### 1.1 三级模型架构

```
Level 1: Queen Agent（女王统帅）
  模型：DeepSeek-V3
  成本：¥0.01 / 10K tokens
  原因：极速、便宜、够用
  任务：理解意图、任务分解、协调调度

Level 2: 六脉 Agent（领域大将）
  模型：Claude 3.5 Sonnet
  成本：¥0.15 / 50K tokens
  原因：顶级智力、深度推理
  任务：战略输出、风险博弈、内容创作

Level 3: 士兵（Atomic Skills）
  模型：DeepSeek-V3 或专用小模型
  成本：¥0.01 / 20K tokens
  原因：成本最低、响应快
  任务：简单查询、数据抓取、计算
```

### 1.2 成本对比

```
单次完整请求成本分解：

传统方式（全用 Claude 3.5 Sonnet）：
├─ Queen Agent：¥0.15（50K tokens）
├─ 六脉 Agent：¥0.15（50K tokens）
└─ 士兵：¥0.15（50K tokens）
──────────────────────────────────────
总计：¥0.45 / 次

优化方式（大小模型混合）：
├─ Queen Agent（DeepSeek-V3）：¥0.01（10K tokens）
├─ 六脉 Agent（Claude 3.5 Sonnet）：¥0.15（50K tokens）
└─ 士兵（DeepSeek-V3）：¥0.02（20K tokens）
──────────────────────────────────────
总计：¥0.18 / 次

节省：60%
```

---

## 二、动态选择逻辑

### 2.1 Queen Agent 的决策树

```typescript
// lib/queen/model-selector.ts

/**
 * 模型选择器
 *
 * 根据任务特征动态选择最合适的模型
 */

export interface ModelSelectionConfig {
  // 任务复杂度
  complexity: "simple" | "medium" | "complex";

  // 重要性
  importance: "low" | "medium" | "high";

  // 时间要求
  urgency: "fast" | "normal" | "slow";

  // 预算
  budget: "low" | "medium" | "high";
}

export class ModelSelector {
  /**
   * 为 Queen Agent 选择模型
   */
  selectQueenModel(config: ModelSelectionConfig): string {
    // Queen Agent 始终用 DeepSeek-V3
    // 因为：只需要理解意图和分解任务，不需要深度推理
    return "deepseek-v3";
  }

  /**
   * 为六脉 Agent 选择模型
   */
  selectPulseAgentModel(
    pulseType: string,
    config: ModelSelectionConfig
  ): string {
    // 法度·风险、财帛·转化：必须用 Claude 3.5 Sonnet（准确性第一）
    if (["法度·风险", "财帛·转化"].includes(pulseType)) {
      return "claude-3.5-sonnet";
    }

    // 天道·战略：根据复杂度选择
    if (pulseType === "天道·战略") {
      if (config.complexity === "complex") {
        return "claude-3.5-sonnet";
      }
      return "deepseek-v3";
    }

    // 其他 Agent：根据预算和时间要求选择
    if (config.budget === "low" || config.urgency === "fast") {
      return "deepseek-v3";
    }

    // 默认用 Claude 3.5 Sonnet
    return "claude-3.5-sonnet";
  }

  /**
   * 为士兵选择模型
   */
  selectSoldierModel(skillType: string): string {
    // 士兵始终用 DeepSeek-V3（最便宜）
    return "deepseek-v3";
  }
}
```

### 2.2 任务复杂度评估

```typescript
// lib/queen/complexity-analyzer.ts

/**
 * 任务复杂度分析器
 *
 * 在调用 Agent 之前，分析任务的复杂度
 */

export class ComplexityAnalyzer {
  /**
   * 分析用户输入的复杂度
   */
  analyze(userInput: string): {
    complexity: "simple" | "medium" | "complex";
    estimatedTokens: number;
    confidence: number;
  } {
    // 1. 分析输入长度
    const inputLength = userInput.length;
    const estimatedTokens = Math.ceil(inputLength / 2);

    // 2. 分析关键词
    const keywords = {
      simple: ["如何", "怎么", "是什么", "怎么弄"],
      medium: ["策略", "方案", "分析", "设计"],
      complex: ["商业模式", "战略规划", "完整方案", "系统化"],
    };

    const keywordScore = {
      simple: keywords.simple.some(k => userInput.includes(k)),
      medium: keywords.medium.some(k => userInput.includes(k)),
      complex: keywords.complex.some(k => userInput.includes(k)),
    };

    // 3. 判断复杂度
    let complexity: "simple" | "medium" | "complex";

    if (keywordScore.complex || estimatedTokens > 500) {
      complexity = "complex";
    } else if (keywordScore.medium || estimatedTokens > 100) {
      complexity = "medium";
    } else {
      complexity = "simple";
    }

    // 4. 计算置信度
    const confidence = Math.min(0.9, estimatedTokens / 100);

    return { complexity, estimatedTokens, confidence };
  }

  /**
   * 分析是否需要实时数据
   */
  needsRealTimeData(userInput: string): boolean {
    const realTimeKeywords = [
      "最新", "现在", "当前", "实时", "今天", "本月",
      "广告成本", "竞品价格", "法规", "政策",
    ];

    return realTimeKeywords.some(keyword => userInput.includes(keyword));
  }
}
```

---

## 三、成本优化

### 3.1 Token 预估

```typescript
// lib/queen/token-estimator.ts

/**
 * Token 估算器
 *
 * 在调用模型之前，估算 token 消耗
 */

export class TokenEstimator {
  /**
   * 估算 Queen Agent 的 token 消耗
   */
  estimateQueenTokens(userInput: string): number {
    // 输入：约 2 tokens / 字符
    const inputTokens = Math.ceil(userInput.length / 2);

    // 输出：约为输入的 2 倍（任务分解）
    const outputTokens = inputTokens * 2;

    return inputTokens + outputTokens; // 约 3 * userInput.length
  }

  /**
   * 估算六脉 Agent 的 token 消耗
   */
  estimatePulseAgentTokens(
    pulseType: string,
    userInput: string,
    memoryContext?: string
  ): number {
    const baseTokens = Math.ceil(userInput.length / 2);

    // 不同 Agent 的输出长度不同
    const outputMultipliers = {
      "天道·战略": 10,
      "地利·产品": 8,
      "人和·模式": 8,
      "神韵·内容": 15, // 内容生成较长
      "财帛·转化": 6,
      "法度·风险": 5,
    };

    let estimated = baseTokens * (outputMultipliers[pulseType] || 5);

    // 如果有记忆上下文，增加 token 消耗
    if (memoryContext) {
      estimated += Math.ceil(memoryContext.length / 2);
    }

    return estimated;
  }

  /**
   * 估算士兵的 token 消耗
   */
  estimateSoldierTokens(skillType: string): number {
    // 士兵任务相对简单，输出较短
    const soldierTokenCosts = {
      "竞品定价分析": 500,
      "广告成本查询": 300,
      "行业法规查询": 400,
      "市场规模查询": 600,
      "小红书脚本生成": 1500,
      "公众号文章生成": 3000,
      "短视频分镜脚本": 1200,
    };

    return soldierTokenCosts[skillType] || 500;
  }

  /**
   * 估算总成本
   */
  estimateTotalCost(scenario: {
    userInput: string;
    pulseAgents: string[];
    soldiers: string[];
  }): {
    queenCost: number;
    pulseCost: number;
    soldierCost: number;
    totalCost: number;
    costBreakdown: string;
  } {
    // 1. Queen Agent 成本（DeepSeek-V3: ¥0.001/1K tokens）
    const queenTokens = this.estimateQueenTokens(scenario.userInput);
    const queenCost = (queenTokens / 1000) * 0.01;

    // 2. 六脉 Agent 成本（Claude 3.5 Sonnet: ¥0.003/1K tokens）
    let pulseCost = 0;
    scenario.pulseAgents.forEach(pulseType => {
      const tokens = this.estimatePulseAgentTokens(pulseType, scenario.userInput);
      pulseCost += (tokens / 1000) * 0.15;
    });

    // 3. 士兵成本（DeepSeek-V3: ¥0.001/1K tokens）
    let soldierCost = 0;
    scenario.soldiers.forEach(skillType => {
      const tokens = this.estimateSoldierTokens(skillType);
      soldierCost += (tokens / 1000) * 0.01;
    });

    const totalCost = queenCost + pulseCost + soldierCost;

    return {
      queenCost,
      pulseCost,
      soldierCost,
      totalCost,
      costBreakdown: `Queen: ¥${queenCost.toFixed(2)}, 六脉: ¥${pulseCost.toFixed(2)}, 士兵: ¥${soldierCost.toFixed(2)}`,
    };
  }
}
```

### 3.2 成本控制策略

```typescript
// lib/queen/cost-controller.ts

/**
 * 成本控制器
 *
 * 监控和控制每次请求的成本
 */

export class CostController {
  private maxCostPerRequest = 0.5; // 单次请求最大成本
  private dailyBudget = 100; // 每日预算
  private dailySpend = 0;

  /**
   * 检查是否可以执行
   */
  canExecute(estimatedCost: number): {
    allowed: boolean;
    reason?: string;
  } {
    // 1. 检查单次成本
    if (estimatedCost > this.maxCostPerRequest) {
      return {
        allowed: false,
        reason: `单次成本超限 (¥${estimatedCost.toFixed(2)} > ¥${this.maxCostPerRequest})`,
      };
    }

    // 2. 检查每日预算
    if (this.dailySpend + estimatedCost > this.dailyBudget) {
      return {
        allowed: false,
        reason: `每日预算超限 (已用 ¥${this.dailySpend.toFixed(2)} + 预估 ¥${estimatedCost.toFixed(2)} > ¥${this.dailyBudget})`,
      };
    }

    return { allowed: true };
  }

  /**
   * 记录实际花费
   */
  recordSpend(actualCost: number) {
    this.dailySpend += actualCost;

    // 如果超过每日预算，记录到日志
    if (this.dailySpend > this.dailyBudget) {
      console.warn(`[Cost] Daily budget exceeded: ¥${this.dailySpend.toFixed(2)}`);
    }
  }

  /**
   * 重置每日预算（每天 0 点执行）
   */
  resetDailyBudget() {
    this.dailySpend = 0;
  }
}
```

---

## 四、监控与调优

### 4.1 性能监控

```typescript
// lib/queen/performance-monitor.ts

/**
 * 性能监控器
 *
 * 监控模型选择的实际效果，持续优化
 */

export interface PerformanceMetrics {
  requestId: string;
  model: string;
  agentType: string;
  estimatedTokens: number;
  actualTokens: number;
  estimatedCost: number;
  actualCost: number;
  latency: number; // 毫秒
  userSatisfaction?: number; // 用户满意度（1-5）
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  /**
   * 记录性能指标
   */
  record(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);

    // 保留最近 1000 条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // 打印异常情况
    if (metrics.actualTokens > metrics.estimatedTokens * 2) {
      console.warn(`[Monitor] Token usage doubled: ${metrics.requestId}`);
    }

    if (metrics.latency > 5000) {
      console.warn(`[Monitor] High latency: ${metrics.latency}ms`);
    }
  }

  /**
   * 分析模型效果
   */
  analyzeModelEffectiveness(): {
    [modelName: string]: {
      avgLatency: number;
      avgCost: number;
      userSatisfaction: number;
      accuracy: number;
    };
  } {
    const modelMetrics: Map<string, {
      totalLatency: number;
      totalCost: number;
      totalSatisfaction: number;
      count: number;
    }> = new Map();

    // 聚合指标
    this.metrics.forEach(m => {
      if (!modelMetrics.has(m.model)) {
        modelMetrics.set(m.model, {
          totalLatency: 0,
          totalCost: 0,
          totalSatisfaction: 0,
          count: 0,
        });
      }

      const metric = modelMetrics.get(m.model)!;
      metric.totalLatency += m.latency;
      metric.totalCost += m.actualCost;
      metric.totalSatisfaction += m.userSatisfaction || 0;
      metric.count += 1;
    });

    // 计算平均值
    const result: any = {};
    modelMetrics.forEach((value, key) => {
      result[key] = {
        avgLatency: value.totalLatency / value.count,
        avgCost: value.totalCost / value.count,
        userSatisfaction: value.totalSatisfaction / value.count,
      };
    });

    return result;
  }

  /**
   * 优化建议
   */
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];
    const effectiveness = this.analyzeModelEffectiveness();

    // 分析 DeepSeek-V3 的效果
    const deepseek = effectiveness["deepseek-v3"];
    if (deepseek && deepseek.avgLatency > 2000) {
      suggestions.push("考虑为简单任务使用更快的模型");
    }

    // 分析 Claude 3.5 Sonnet 的效果
    const claude = effectiveness["claude-3.5-sonnet"];
    if (claude && claude.userSatisfaction < 3.5) {
      suggestions.push("Claude 3.5 Sonnet 用户满意度低，考虑优化提示词");
    }

    return suggestions;
  }
}
```

---

## 五、实现代码

### 5.1 Queen Agent 完整实现

```typescript
// lib/queen/queen-agent.ts

import { ModelSelector } from "./model-selector";
import { ComplexityAnalyzer } from "./complexity-analyzer";
import { TokenEstimator } from "./token-estimator";
import { CostController } from "./cost-controller";
import { PerformanceMonitor } from "./performance-monitor";

export class QueenAgent {
  private modelSelector: ModelSelector;
  private complexityAnalyzer: ComplexityAnalyzer;
  private tokenEstimator: TokenEstimator;
  private costController: CostController;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.modelSelector = new ModelSelector();
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.tokenEstimator = new TokenEstimator();
    this.costController = new CostController();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * 主入口：处理用户请求
   */
  async processRequest(userInput: string) {
    const requestId = `req_${Date.now()}`;

    // 1. 分析复杂度
    const complexity = this.complexityAnalyzer.analyze(userInput);
    console.log(`[Queen] Complexity: ${complexity.complexity}, Tokens: ${complexity.estimatedTokens}`);

    // 2. 检查是否需要实时数据
    const needsRealTimeData = this.complexityAnalyzer.needsRealTimeData(userInput);
    console.log(`[Queen] Needs real-time data: ${needsRealTimeData}`);

    // 3. 任务分解
    const taskPlan = await this.decomposeTask(userInput, complexity);
    console.log(`[Queen] Task plan:`, taskPlan);

    // 4. 估算成本
    const costEstimate = this.tokenEstimator.estimateTotalCost({
      userInput,
      pulseAgents: taskPlan.pulseAgents,
      soldiers: taskPlan.soldiers || [],
    });

    console.log(`[Queen] Cost estimate: ${costEstimate.costBreakdown} = ¥${costEstimate.totalCost.toFixed(2)}`);

    // 5. 成本控制
    const costCheck = this.costController.canExecute(costEstimate.totalCost);
    if (!costCheck.allowed) {
      return {
        error: costCheck.reason,
        suggestion: "简化问题或稍后再试",
      };
    }

    // 6. 执行任务
    const startTime = Date.now();
    const results = await this.executeTasks(taskPlan, needsRealTimeData);
    const latency = Date.now() - startTime;

    // 7. 记录实际花费
    // （简化：这里使用估算值，实际应该从模型提供商获取）
    this.costController.recordSpend(costEstimate.totalCost);

    // 8. 监控性能
    this.performanceMonitor.record({
      requestId,
      model: "deepseek-v3",
      agentType: "Queen",
      estimatedTokens: complexity.estimatedTokens,
      actualTokens: complexity.estimatedTokens, // 简化
      estimatedCost: costEstimate.queenCost,
      actualCost: costEstimate.queenCost,
      latency,
    });

    // 9. 返回结果
    return {
      results,
      cost: costEstimate,
      latency,
      requestId,
    };
  }

  /**
   * 任务分解
   */
  private async decomposeTask(
    userInput: string,
    complexity: { complexity: string; estimatedTokens: number }
  ): Promise<{
    pulseAgents: string[];
    soldiers?: string[];
  }> {
    // 使用 DeepSeek-V3 进行任务分解
    const decomposition = await this.callModel("deepseek-v3", {
      prompt: `
你是一个任务分解专家。请分析用户的问题，并决定需要调用哪些"六脉 Agent"。

用户问题：${userInput}

可用的六脉 Agent：
1. 天道·战略 - 方向在哪？
2. 地利·产品 - 卖什么？
3. 人和·模式 - 怎么连？
4. 神韵·内容 - 怎么说？
5. 财帛·转化 - 怎么收钱？
6. 法度·风险 - 如何不死？

请以 JSON 格式输出：
{
  "pulseAgents": ["天道·战略", "地利·产品"],
  "soldiers": ["竞品定价分析", "广告成本查询"]
}

只输出 JSON，不要其他内容。
      `,
      response_format: { type: "json_object" },
    });

    return JSON.parse(decomposition);
  }

  /**
   * 执行任务
   */
  private async executeTasks(
    taskPlan: {
      pulseAgents: string[];
      soldiers?: string[];
    },
    needsRealTimeData: boolean
  ): Promise<any> {
    const results = [];

    // 并行执行六脉 Agent
    const pulsePromises = taskPlan.pulseAgents.map(async (pulseType) => {
      // 根据任务选择模型
      const model = this.modelSelector.selectPulseAgentModel(pulseType, {
        complexity: "medium",
        importance: "high",
        urgency: "normal",
        budget: "medium",
      });

      // 调用六脉 Agent
      return await this.callPulseAgent(pulseType, model, {
        userInput: taskPlan.pulseAgents.join(","),
        needsRealTimeData,
      });
    });

    // 等待所有六脉 Agent 完成
    const pulseResults = await Promise.all(pulsePromises);
    results.push(...pulseResults);

    // 如果有士兵任务，也并行执行
    if (taskPlan.soldiers && taskPlan.soldiers.length > 0) {
      const soldierPromises = taskPlan.soldiers.map(async (skillType) => {
        return await this.callSoldier(skillType);
      });

      const soldierResults = await Promise.all(soldierPromises);
      results.push(...soldierResults);
    }

    return results;
  }

  /**
   * 调用模型（统一接口）
   */
  private async callModel(model: string, params: any): Promise<string> {
    // 根据 model 名称调用对应的 API
    // 这里简化了实际实现

    if (model.startsWith("deepseek")) {
      // 调用硅基流动 DeepSeek API
      return await this.callDeepSeek(params);
    } else if (model.startsWith("claude")) {
      // 调用 Anthropic Claude API
      return await this.callClaude(params);
    }

    throw new Error(`Unknown model: ${model}`);
  }

  private async callDeepSeek(params: any): Promise<string> {
    // 实现硅基流动 API 调用
    // ...
    return "DeepSeek response";
  }

  private async callClaude(params: any): Promise<string> {
    // 实现 Anthropic API 调用
    // ...
    return "Claude response";
  }

  /**
   * 调用六脉 Agent
   */
  private async callPulseAgent(
    pulseType: string,
    model: string,
    params: any
  ): Promise<any> {
    // 实际调用六脉 Agent 的逻辑
    // ...
    return { agent: pulseType, result: "..." };
  }

  /**
   * 调用士兵
   */
  private async callSoldier(skillType: string): Promise<any> {
    // 实际调用士兵的逻辑
    // ...
    return { skill: skillType, result: "..." };
  }
}
```

---

## 六、使用示例

### 6.1 基本使用

```typescript
// app/api/queen/process/route.ts

import { QueenAgent } from "@/lib/queen/queen-agent";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userInput } = await request.json();

  const queenAgent = new QueenAgent();
  const result = await queenAgent.processRequest(userInput);

  return NextResponse.json(result);
}
```

### 6.2 成本优化示例

```typescript
// 用户输入简单问题
const result1 = await queenAgent.processRequest("美业培训怎么做？");
// Queen: DeepSeek-V3（便宜、快）
// 成本：¥0.01

// 用户输入复杂问题
const result2 = await queenAgent.processRequest("帮我设计一个完整的商业方案，包括战略、产品、模式、内容、变现、风险");
// Queen: DeepSeek-V3（分解任务）
// 六脉：Claude 3.5 Sonnet（高质量）
// 成本：¥0.91（比全用 Claude 节省 60%）
```

---

## 七、总结

### 7.1 核心价值

```
1. 成本优化
   - Queen 用便宜模型（DeepSeek-V3）
   - 六脉用高质量模型（Claude 3.5 Sonnet）
   - 士兵用最便宜模型（DeepSeek-V3）

2. 性能优化
   - Queen 响应快（DeepSeek-V3 极速）
   - 六脉质量高（Claude 3.5 Sonnet 深度推理）
   - 士兵成本低（DeepSeek-V3 批量化）

3. 用户体验
   - 秒回响应（Queen 极速分解）
   - 高质量输出（六脉深度推理）
   - 实时数据（传感器）
```

### 7.2 关键指标

```
响应时间：
├─ Queen Agent：< 2s
├─ 六脉 Agent：< 10s
└─ 士兵：< 5s

成本：
├─ 简单问题：¥0.01-0.05
├─ 中等问题：¥0.10-0.30
└─ 复杂问题：¥0.50-1.00

质量：
└─ 用户满意度：> 4.5/5.0
```

---

> 这是模型选择的"大脑"
> 让系统既快又好，还便宜
>
> ——— 2026年3月2日
> ——— 版本：v1.0
