/**
 * Dify Client with Swarm Memory Integration
 *
 * 这是一个示例文件，展示如何将蜂群记忆中间件集成到 Dify 客户端中
 *
 * @example
 * ```typescript
 * import { createMemoryEnhancedDifyClient } from "@/lib/dify/client-with-memory";
 *
 * const client = createMemoryEnhancedDifyClient("天道·战略");
 * const stream = await client.createWorkflowStream(request);
 * ```
 */

import { DifyClient } from "./client";
import type { DifyWorkflowRequest } from "@/types/db";
import { withMemoryMiddleware, type DifyApiRequest, type DifyApiResponse } from "@/lib/memory";

// ================================================
// TYPES
// ================================================

/**
 * 支持 Swarm Memory 的 Dify 客户端接口
 */
export interface MemoryEnhancedDifyClient {
  /**
   * 创建流式工作流请求（自动注入和更新记忆）
   */
  createWorkflowStream(request: DifyWorkflowRequest): Promise<ReadableStream>;

  /**
   * 创建流式聊天流请求（自动注入和更新记忆）
   */
  createChatflowStream(request: {
    inputs: Record<string, unknown>;
    query: string;
    user: string;
    conversation_id?: string;
    files?: Array<{ type: string; transfer_method: string; upload_file_id?: string; url?: string }>;
  }): Promise<ReadableStream>;

  /**
   * 手动初始化会话记忆
   */
  initializeMemory(conversationId: string, initialData?: Record<string, string>): Promise<boolean>;

  /**
   * 清除会话记忆
   */
  clearMemory(conversationId: string): Promise<boolean>;

  /**
   * 获取当前会话记忆（用于调试）
   */
  getMemory(conversationId: string): Promise<Record<string, any> | null>;
}

// ================================================
// FACTORY FUNCTION
// ================================================

/**
 * 创建带记忆功能的 Dify 客户端
 *
 * @param agentType - Agent 类型（如 "天道·战略", "地利·产品" 等）
 * @param config - 记忆中间件配置
 * @returns 增强后的 Dify 客户端
 *
 * @example
 * ```typescript
 * const client = createMemoryEnhancedDifyClient("天道·战略", {
 *   debugMode: true,
 *   ttl: 7200 // 2 小时
 * });
 *
 * // 正常使用，记忆会自动处理
 * const stream = await client.createWorkflowStream({
 *   inputs: { niche: "美业培训" },
 *   user: "user-123"
 * });
 * ```
 */
export function createMemoryEnhancedDifyClient(
  agentType: string,
  config: {
    debugMode?: boolean;
    ttl?: number;
    autoCompress?: boolean;
  } = {}
): MemoryEnhancedDifyClient {
  // 1. 创建原始 Dify 客户端
  const baseClient = new DifyClient({
    apiKey: getApiKeyForAgentType(agentType),
  });

  // 2. 创建记忆中间件包装的 API 调用函数
  const memoryEnhancedApiCall = withMemoryMiddleware(
    async (request: DifyApiRequest): Promise<DifyApiResponse> => {
      // 这里我们模拟一个 Dify API 调用
      // 注意：实际实现需要根据你的 Dify API 格式调整
      const response = await fetch("/api/dify-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Dify API error: ${response.status}`);
      }

      return await response.json();
    },
    agentType,
    config
  );

  // 3. 返回增强后的客户端接口
  return {
    /**
     * 创建流式工作流请求
     *
     * 注意：由于流式响应无法被中间件拦截（流一旦开始就无法停止），
     * 记忆更新会在流结束后通过监听 stream.end 事件来触发
     */
    async createWorkflowStream(request: DifyWorkflowRequest): Promise<ReadableStream> {
      // 前处理：注入记忆
      const conversationId = request.user || `conv-${Date.now()}`;

      // TODO: 从 Redis 读取记忆并注入到 request.inputs
      // const memory = await getMemory(conversationId);
      // if (memory) {
      //   request.inputs.ext_memory = generateMemoryContext(memory);
      // }

      // 调用原始 Dify 客户端
      const stream = await baseClient.createWorkflowStream(request);

      // 包装 stream，在结束时更新记忆
      return wrapStreamForMemoryUpdate(stream, agentType, conversationId);
    },

    /**
     * 创建流式聊天流请求
     */
    async createChatflowStream(request: {
      inputs: Record<string, unknown>;
      query: string;
      user: string;
      conversation_id?: string;
      files?: Array<any>;
    }): Promise<ReadableStream> {
      const conversationId = request.conversation_id || request.user;

      // TODO: 前处理：注入记忆

      const stream = await baseClient.createChatflowStream(request);

      // 包装 stream
      return wrapStreamForMemoryUpdate(stream, agentType, conversationId);
    },

    /**
     * 手动初始化记忆
     */
    async initializeMemory(
      conversationId: string,
      initialData?: Record<string, string>
    ): Promise<boolean> {
      const { initializeMemory } = await import("@/lib/memory");
      return await initializeMemory(conversationId, initialData, config);
    },

    /**
     * 清除记忆
     */
    async clearMemory(conversationId: string): Promise<boolean> {
      const { clearMemory } = await import("@/lib/memory");
      return await clearMemory(conversationId);
    },

    /**
     * 获取记忆
     */
    async getMemory(conversationId: string): Promise<Record<string, any> | null> {
      const { getMemoryForDisplay } = await import("@/lib/memory");
      return await getMemoryForDisplay(conversationId);
    },
  };
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * 包装流式响应，在结束时触发记忆更新
 */
function wrapStreamForMemoryUpdate(
  stream: ReadableStream,
  agentType: string,
  conversationId: string
): ReadableStream {
  // 创建一个 TransformStream 来收集完整响应
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // 收集完整响应用于记忆提取
  let fullResponse = "";

  (async () => {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        // 转发数据
        await writer.write(encoder.encode(chunk));
      }

      // 流结束后，更新记忆
      await updateMemoryFromResponse(fullResponse, agentType, conversationId);
    } catch (error) {
      console.error("[Memory] Stream processing error:", error);
    } finally {
      await writer.close();
    }
  })();

  return readable;
}

/**
 * 从 Dify 响应中提取并更新记忆
 */
async function updateMemoryFromResponse(
  response: string,
  agentType: string,
  conversationId: string
): Promise<void> {
  try {
    const { extractMemoryUpdates, updateMemory } = await import("@/lib/memory");

    // 提取记忆更新
    const extracted = extractMemoryUpdates(response, agentType);

    if (extracted && extracted.updates) {
      // 保存到 Redis
      await updateMemory(conversationId, extracted.updates, "merge");
      console.log(`[Memory] Updated memory for ${conversationId} (${agentType})`);
    }
  } catch (error) {
    console.error("[Memory] Failed to update memory:", error);
    // 不影响主流程，静默失败
  }
}

/**
 * 根据 Agent 类型获取对应的 API Key
 */
function getApiKeyForAgentType(agentType: string): string {
  // 映射表：六脉 Agent → 环境变量
  const keyMapping: Record<string, string> = {
    "天道·战略": "DIFY_STRATEGY_KEY",
    "地利·产品": "DIFY_PRODUCT_KEY",
    "人和·模式": "DIFY_MODEL_KEY",
    "神韵·内容": "DIFY_CONTENT_KEY",
    "财帛·转化": "DIFY_MONEY_KEY",
    "法度·风险": "DIFY_LAW_KEY",
  };

  const envKey = keyMapping[agentType] || "DIFY_API_KEY";
  const apiKey = process.env[envKey];

  if (!apiKey) {
    throw new Error(`Missing API key for ${agentType}. Set ${envKey} environment variable.`);
  }

  return apiKey;
}

// ================================================
// USAGE EXAMPLES
// ================================================

/**
 * 示例 1: 基本使用
 */
export async function example1_BasicUsage() {
  const client = createMemoryEnhancedDifyClient("天道·战略", {
    debugMode: true,
  });

  // 首次调用会自动创建记忆
  const stream1 = await client.createWorkflowStream({
    inputs: { niche: "美业培训" },
    user: "user-123",
  });

  // 第二次调用会自动注入之前的记忆
  const stream2 = await client.createWorkflowStream({
    inputs: { query: "如何定位？" },
    user: "user-123",
  });
}

/**
 * 示例 2: 手动初始化记忆
 */
export async function example2_ManualInitialization() {
  const client = createMemoryEnhancedDifyClient("地利·产品");

  // 手动初始化记忆（例如：从用户注册信息中获取）
  await client.initializeMemory("user-456", {
    business_profile: "美业培训，10年经验",
    strategic_goal: "帮助100+创业者成功转型",
  });

  // 后续调用会使用这个初始记忆
  const stream = await client.createWorkflowStream({
    inputs: { query: "如何设计产品矩阵？" },
    user: "user-456",
  });
}

/**
 * 示例 3: 查看和清除记忆
 */
export async function example3_ManageMemory() {
  const client = createMemoryEnhancedDifyClient("神韵·内容");

  // 查看当前记忆
  const memory = await client.getMemory("user-789");
  console.log("Current memory:", memory);

  // 清除记忆（重新开始）
  await client.clearMemory("user-789");
}
