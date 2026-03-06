/**
 * Swarm Memory - 蜂群记忆系统
 *
 * 为六脉Agent提供共享记忆，实现跨Agent的上下文传递
 * 所有Agent的记忆存储在同一个对象中，按照"脉"进行组织
 */

// ================================================
// TYPES
// ================================================

/**
 * 蜂群记忆对象（SwarmMemory）
 * 为每个 conversation_id 维护一个 JSON 对象
 */
export interface SwarmMemory {
  // 天道·战略（天）
  business_profile?: string; // 用户行业、规模等基础背景
  strategic_goal?: string; // 当前核心目标

  // 地利·产品（地）
  product_matrix?: string; // 已定义的产品信息

  // 人和·模式（人）
  market_insights?: string; // 市场调研结论（盟友、客户、对手）

  // 神韵·内容（神）
  brand_voice?: string; // 品牌调性、内容风格

  // 财帛·转化（财）
  monetization_path?: string; // 变现路径、定价策略

  // 法度·风险（法）
  risk_constraints?: string; // 法律与风险边界

  // 跨脉信息
  last_pulse_summary?: string; // 上一个 Agent 执行的核心结论

  // 元数据
  update_at: number; // 最后更新时间戳（Unix timestamp）
  version: number; // 记忆版本号（每次更新递增）
}

/**
 * 记忆更新请求
 */
export interface MemoryUpdateRequest {
  agentType: string; // 哪个Agent在更新
  conversationId: string; // 会话ID
  updateType: "replace" | "merge" | "append"; // 更新模式
  data: Partial<SwarmMemory>; // 要更新的数据
}

/**
 * 记忆查询结果
 */
export interface MemoryQueryResult {
  memory: SwarmMemory; // 完整记忆对象
  isEmpty: boolean; // 是否为空（首次使用）
  isStale: boolean; // 是否过期（超过2小时未更新）
}

/**
 * 记忆摘要（用于Token优化）
 */
export interface MemorySummary {
  business_profile?: string;
  strategic_goal?: string;
  product_matrix?: string;
  key_insights?: string; // 关键洞察（压缩版）
  last_agent?: string; // 上一个执行的Agent
  update_time?: string; // 最后更新时间
}

/**
 * 提取的更新（从Dify响应中）
 */
export interface ExtractedUpdate {
  agentType: string;
  updates: Partial<SwarmMemory>;
  confidence: number; // 置信度（0-1）
}

// ================================================
// CONSTANTS
// ================================================

const MEMORY_PREFIX = "swarm:memory:";
const MEMORY_TTL = 2 * 60 * 60; // 2小时（秒）
const MAX_MEMORY_SIZE = 2000; // 最大字符数（超过需要压缩）
const MEMORY_VERSION_KEY = "version"; // 记忆版本号字段

// 默认空记忆
const EMPTY_MEMORY: SwarmMemory = {
  update_at: Date.now(),
  version: 1,
};

// ================================================
// HELPERS
// ================================================

/**
 * 获取Redis key
 */
export function getMemoryKey(conversationId: string): string {
  return `${MEMORY_PREFIX}${conversationId}`;
}

/**
 * 生成记忆上下文字（用于注入到Dify）
 */
export function generateMemoryContext(memory: SwarmMemory): string {
  if (!memory) return "";

  const parts: string[] = [];

  if (memory.business_profile) {
    parts.push(`【商业背景】\n${memory.business_profile}`);
  }
  if (memory.strategic_goal) {
    parts.push(`【战略目标】\n${memory.strategic_goal}`);
  }
  if (memory.product_matrix) {
    parts.push(`【产品矩阵】\n${memory.product_matrix}`);
  }
  if (memory.market_insights) {
    parts.push(`【市场洞察】\n${memory.market_insights}`);
  }
  if (memory.brand_voice) {
    parts.push(`【品牌调性】\n${memory.brand_voice}`);
  }
  if (memory.monetization_path) {
    parts.push(`【变现路径】\n${memory.monetization_path}`);
  }
  if (memory.risk_constraints) {
    parts.push(`【风险边界】\n${memory.risk_constraints}`);
  }
  if (memory.last_pulse_summary) {
    parts.push(`【前序结论】\n${memory.last_pulse_summary}`);
  }

  const fullText = parts.join("\n\n");

  // 如果超过最大长度，进行压缩
  if (fullText.length > MAX_MEMORY_SIZE) {
    return compressMemory(fullText);
  }

  return fullText;
}

/**
 * 压缩记忆（简单版本：保留关键信息）
 */
export function compressMemory(fullText: string): string {
  const lines = fullText.split("\n").filter((line) => line.trim());
  const keySections = ["商业背景", "战略目标", "产品矩阵", "市场洞察"];

  const compressed: string[] = [];
  for (const section of keySections) {
    const found = lines.find((line) => line.includes(section));
    if (found) {
      compressed.push(found);
      // 添加该section的第一行内容
      const idx = lines.indexOf(found);
      if (idx + 1 < lines.length) {
        compressed.push(lines[idx + 1]);
      }
    }
  }

  return compressed.join("\n");
}

/**
 * 解析Dify响应中的记忆更新
 * 支持 [MEMORY_UPDATE]...[/MEMORY_UPDATE] 标签
 */
export function extractMemoryUpdates(answer: string, agentType: string): ExtractedUpdate | null {
  // 提取 MEMORY_UPDATE 标签
  const memoryTagRegex = /\[MEMORY_UPDATE\]([\s\S]*?)\[\/MEMORY_UPDATE\]/gi;
  const matches = answer.match(memoryTagRegex);

  if (!matches || matches.length === 0) {
    // 尝试从整个回答中提取（启发式）
    return extractFromAnswer(answer, agentType);
  }

  const content = matches[0];
  const updates: Partial<SwarmMemory> = {};

  // 根据Agent类型，解析对应字段
  if (agentType === "天道·战略") {
    updates.strategic_goal = content;
  } else if (agentType === "地利·产品") {
    updates.product_matrix = content;
  } else if (agentType === "人和·模式") {
    updates.market_insights = content;
  } else if (agentType === "神韵·内容") {
    updates.brand_voice = content;
  } else if (agentType === "财帛·转化") {
    updates.monetization_path = content;
  } else if (agentType === "法度·风险") {
    updates.risk_constraints = content;
  }

  // 保存上一个Agent的结论
  updates.last_pulse_summary = `[${agentType}执行完毕]`;

  return {
    agentType,
    updates,
    confidence: 0.9, // 从标签提取的置信度较高
  };
}

/**
 * 从回答中启发式提取更新
 */
function extractFromAnswer(answer: string, agentType: string): ExtractedUpdate | null {
  // 这里可以接入轻量级模型，或者使用规则
  // 暂时实现：如果用户要求记忆更新，使用标签
  return null;
}

/**
 * 验证记忆大小
 */
export function validateMemorySize(memory: SwarmMemory): boolean {
  const context = generateMemoryContext(memory);
  return context.length <= MAX_MEMORY_SIZE;
}
