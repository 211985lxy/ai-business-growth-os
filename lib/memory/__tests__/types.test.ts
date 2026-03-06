/**
 * Swarm Memory - Unit Tests
 *
 * 运行测试：
 * npm test -- lib/memory/__tests__
 */

import {
  generateMemoryContext,
  compressMemory,
  extractMemoryUpdates,
  validateMemorySize,
  type SwarmMemory,
} from "../types";

// ================================================
// FIXTURES
// ================================================

const createMockMemory = (overrides?: Partial<SwarmMemory>): SwarmMemory => ({
  business_profile: "美业培训，10年经验",
  strategic_goal: "帮助100+创业者成功转型",
  product_matrix: "核心产品：《美业创业实战课》",
  market_insights: "目标客户：30-45岁美业从业者",
  brand_voice: "专业、实战、可信赖",
  monetization_path: "免费→低价→中价→高价",
  risk_constraints: "禁用词：第一、最、保证",
  last_pulse_summary: "[天道·战略执行完毕]",
  update_at: Date.now(),
  version: 1,
  ...overrides,
});

// ================================================
// TESTS: generateMemoryContext
// ================================================

describe("generateMemoryContext", () => {
  test("应该生成完整的记忆上下文", () => {
    const memory = createMockMemory();
    const context = generateMemoryContext(memory);

    expect(context).toContain("【商业背景】");
    expect(context).toContain("美业培训，10年经验");
    expect(context).toContain("【战略目标】");
    expect(context).toContain("帮助100+创业者成功转型");
    expect(context).toContain("【产品矩阵】");
    expect(context).toContain("【市场洞察】");
    expect(context).toContain("【品牌调性】");
    expect(context).toContain("【变现路径】");
    expect(context).toContain("【风险边界】");
    expect(context).toContain("【前序结论】");
  });

  test("应该只包含有值的字段", () => {
    const memory = createMockMemory({
      business_profile: undefined,
      strategic_goal: undefined,
    });
    const context = generateMemoryContext(memory);

    expect(context).not.toContain("【商业背景】");
    expect(context).not.toContain("【战略目标】");
    expect(context).toContain("【产品矩阵】");
  });

  test("空记忆应该返回空字符串", () => {
    const memory: SwarmMemory = {
      update_at: Date.now(),
      version: 1,
    };
    const context = generateMemoryContext(memory);

    expect(context).toBe("");
  });

  test("应该正确换行分隔各部分", () => {
    const memory = createMockMemory();
    const context = generateMemoryContext(memory);

    const parts = context.split("\n\n");
    expect(parts.length).toBeGreaterThan(1);
  });
});

// ================================================
// TESTS: compressMemory
// ================================================

describe("compressMemory", () => {
  test("应该压缩超长记忆", () => {
    const longText = "【商业背景】\n".repeat(100) + "a".repeat(2000);
    const compressed = compressMemory(longText);

    expect(compressed.length).toBeLessThan(longText.length);
  });

  test("应该保留关键部分", () => {
    const longText = `
      【商业背景】
      美业培训，10年经验

      【战略目标】
      帮助100+创业者成功转型

      ${"其他内容\n".repeat(50)}

      【产品矩阵】
      核心产品：《美业创业实战课》
    `;

    const compressed = compressMemory(longText);

    expect(compressed).toContain("【商业背景】");
    expect(compressed).toContain("【战略目标】");
    expect(compressed).toContain("【产品矩阵】");
  });

  test("空文本应该返回空字符串", () => {
    const compressed = compressMemory("");
    expect(compressed).toBe("");
  });

  test("没有关键部分的文本应该返回部分内容", () => {
    const text = "这是一段没有关键标记的文本\n第二行\n第三行";
    const compressed = compressMemory(text);

    expect(compressed).toBeTruthy();
  });
});

// ================================================
// TESTS: extractMemoryUpdates
// ================================================

describe("extractMemoryUpdates", () => {
  test("应该提取 MEMORY_UPDATE 标签内容", () => {
    const answer = `
      这是正常回答内容。

      [MEMORY_UPDATE]
      根据本次分析，建议的战略定位为：聚焦"美业创业者教育"细分市场。
      [/MEMORY_UPDATE]

      继续回答...
    `;

    const result = extractMemoryUpdates(answer, "天道·战略");

    expect(result).not.toBeNull();
    expect(result?.agentType).toBe("天道·战略");
    expect(result?.updates.strategic_goal).toContain("美业创业者教育");
    expect(result?.confidence).toBe(0.9);
  });

  test("应该根据 Agent 类型映射到正确的字段", () => {
    const testCases = [
      {
        agentType: "天道·战略",
        expectedField: "strategic_goal",
      },
      {
        agentType: "地利·产品",
        expectedField: "product_matrix",
      },
      {
        agentType: "人和·模式",
        expectedField: "market_insights",
      },
      {
        agentType: "神韵·内容",
        expectedField: "brand_voice",
      },
      {
        agentType: "财帛·转化",
        expectedField: "monetization_path",
      },
      {
        agentType: "法度·风险",
        expectedField: "risk_constraints",
      },
    ];

    testCases.forEach(({ agentType, expectedField }) => {
      const answer = `[MEMORY_UPDATE]\n测试内容\n[/MEMORY_UPDATE]`;
      const result = extractMemoryUpdates(answer, agentType);

      expect(result?.updates).toHaveProperty(expectedField);
    });
  });

  test("应该设置 last_pulse_summary", () => {
    const answer = `[MEMORY_UPDATE]\n测试内容\n[/MEMORY_UPDATE]`;
    const result = extractMemoryUpdates(answer, "天道·战略");

    expect(result?.updates.last_pulse_summary).toBe("[天道·战略执行完毕]");
  });

  test("没有标签时应该返回 null", () => {
    const answer = "这是正常回答，没有记忆更新标签。";
    const result = extractMemoryUpdates(answer, "天道·战略");

    expect(result).toBeNull();
  });

  test("应该支持大小写不敏感的标签", () => {
    const answer = `[memory_update]\n测试内容\n[/MEMORY_UPDATE]`;
    const result = extractMemoryUpdates(answer, "天道·战略");

    expect(result).not.toBeNull();
  });

  test("应该支持多行内容", () => {
    const answer = `
      [MEMORY_UPDATE]
      第一行内容
      第二行内容
      第三行内容
      [/MEMORY_UPDATE]
    `;

    const result = extractMemoryUpdates(answer, "地利·产品");

    expect(result?.updates.product_matrix).toContain("第一行内容");
    expect(result?.updates.product_matrix).toContain("第二行内容");
    expect(result?.updates.product_matrix).toContain("第三行内容");
  });
});

// ================================================
// TESTS: validateMemorySize
// ================================================

describe("validateMemorySize", () => {
  test("小记忆应该通过验证", () => {
    const memory = createMockMemory({
      business_profile: "短内容",
    });
    const isValid = validateMemorySize(memory);

    expect(isValid).toBe(true);
  });

  test("大记忆应该不通过验证", () => {
    const memory = createMockMemory({
      business_profile: "a".repeat(3000),
    });
    const isValid = validateMemorySize(memory);

    expect(isValid).toBe(false);
  });

  test("空记忆应该通过验证", () => {
    const memory: SwarmMemory = {
      update_at: Date.now(),
      version: 1,
    };
    const isValid = validateMemorySize(memory);

    expect(isValid).toBe(true);
  });

  test("边界值测试（2000 字符）", () => {
    const memory = createMockMemory({
      business_profile: "a".repeat(2000),
    });
    const isValid = validateMemorySize(memory);

    // 2000 字符应该不通过（需要压缩）
    expect(isValid).toBe(false);
  });

  test("边界值测试（1999 字符）", () => {
    const memory = createMockMemory({
      business_profile: "a".repeat(1999),
    });
    const isValid = validateMemorySize(memory);

    // 1999 字符应该通过
    expect(isValid).toBe(true);
  });
});

// ================================================
// TESTS: Integration Tests
// ================================================

describe("Integration Tests", () => {
  test("完整流程：生成上下文 -> 验证大小 -> 压缩", () => {
    const memory = createMockMemory({
      business_profile: "a".repeat(3000),
    });

    // 生成上下文
    const context = generateMemoryContext(memory);

    // 验证大小
    const isValid = validateMemorySize(memory);
    expect(isValid).toBe(false);

    // 压缩
    const compressed = compressMemory(context);
    expect(compressed.length).toBeLessThan(context.length);
  });

  test("完整流程：提取更新 -> 映射字段", () => {
    const answer = `
      [MEMORY_UPDATE]
      建议产品矩阵：
      1. 单一爆品：实战课程
      2. 工具化：SaaS 系统
      3. 生态化：供应链平台
      [/MEMORY_UPDATE]
    `;

    const result = extractMemoryUpdates(answer, "地利·产品");

    expect(result?.updates.product_matrix).toContain("单一爆品");
    expect(result?.updates.product_matrix).toContain("工具化");
    expect(result?.updates.product_matrix).toContain("生态化");
  });
});
