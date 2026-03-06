/**
 * Swarm Memory - Memory Middleware
 *
 * 蜂群记忆中间件：
 * 1. 前处理：从 Redis 读取记忆，注入到 Dify API 请求
 * 2. 后处理：从 Dify 响应中提取更新，保存到 Redis
 * 3. 错误处理：Redis 不可用时优雅降级
 */

import type { SwarmMemory, ExtractedUpdate } from "./types";
import { generateMemoryContext, extractMemoryUpdates, validateMemorySize } from "./types";
import { getMemory, saveMemory, updateMemory } from "./redis-client";
import { isRedisAvailable } from "../config/redis";

// ================================================
// TYPES
// ================================================

/**
 * Dify API 请求参数
 */
export interface DifyApiRequest {
  inputs: Record<string, any>;
  user: string;
  query?: string;
  conversation_id?: string;
  [key: string]: any;
}

/**
 * Dify API 响应
 */
export interface DifyApiResponse {
  answer: string;
  conversation_id: string;
  message_id: string;
  created_at: number;
  [key: string]: any;
}

/**
 * 中间件配置
 */
export interface MemoryMiddlewareConfig {
  enabled?: boolean; // 是否启用记忆功能
  autoCompress?: boolean; // 是否自动压缩超长记忆
  maxMemorySize?: number; // 最大记忆大小（字符）
  ttl?: number; // 记忆过期时间（秒）
  debugMode?: boolean; // 调试模式（打印详细日志）
}

// 默认配置
const DEFAULT_CONFIG: MemoryMiddlewareConfig = {
  enabled: true,
  autoCompress: true,
  maxMemorySize: 2000,
  ttl: 7200, // 2 小时
  debugMode: process.env.NODE_ENV === "development",
};

// ================================================
// MIDDLEWARE FUNCTION
// ================================================

/**
 * 蜂群记忆中间件
 *
 * 使用方式：
 * ```typescript
 * const wrappedCall = withMemoryMiddleware(originalDifyCall, {
 *   agentType: "天道·战略",
 *   config: { debugMode: true }
 * });
 *
 * const result = await wrappedCall(requestParams);
 * ```
 */
export function withMemoryMiddleware(
  difyApiCall: (request: DifyApiRequest) => Promise<DifyApiResponse>,
  agentType: string,
  config: MemoryMiddlewareConfig = {}
): (request: DifyApiRequest) => Promise<DifyApiResponse> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (request: DifyApiRequest): Promise<DifyApiResponse> => {
    // 1. 检查是否启用记忆功能
    if (!finalConfig.enabled) {
      if (finalConfig.debugMode) {
        console.log("[Memory] Memory middleware disabled");
      }
      return difyApiCall(request);
    }

    // 2. 检查 Redis 是否可用
    const redisAvailable = await isRedisAvailable();
    if (!redisAvailable) {
      console.warn("[Memory] Redis unavailable, proceeding without memory");
      return difyApiCall(request);
    }

    // 3. 获取 conversation_id
    const conversationId = request.conversation_id || request.user;
    if (!conversationId) {
      console.warn("[Memory] No conversation_id, proceeding without memory");
      return difyApiCall(request);
    }

    // ==========================================
    // PRE-PROCESSING: 注入记忆
    // ==========================================

    let memory: SwarmMemory | null = null;
    let injectedContext = "";

    try {
      memory = await getMemory(conversationId);

      if (memory) {
        // 验证记忆大小
        if (finalConfig.autoCompress && !validateMemorySize(memory)) {
          if (finalConfig.debugMode) {
            console.log("[Memory] Memory size exceeds limit, will be compressed");
          }
        }

        // 生成上下文字符串
        injectedContext = generateMemoryContext(memory);

        if (injectedContext && finalConfig.debugMode) {
          console.log("[Memory] Injected context:", {
            conversationId,
            agentType,
            contextLength: injectedContext.length,
            memoryVersion: memory.version,
          });
        }

        // 注入到 Dify 请求的 inputs 中
        if (injectedContext) {
          request.inputs = request.inputs || {};
          request.inputs.ext_memory = injectedContext;
          request.inputs.memory_version = memory.version;
        }
      } else {
        if (finalConfig.debugMode) {
          console.log("[Memory] No existing memory found, creating new memory");
        }

        // 初始化空记忆
        memory = {
          update_at: Date.now(),
          version: 1,
        };
      }
    } catch (error) {
      console.error("[Memory] Pre-processing error:", error);
      // 继续执行，不阻塞 API 调用
    }

    // ==========================================
    // DIFY API CALL
    // ==========================================

    let response: DifyApiResponse;
    try {
      response = await difyApiCall(request);
    } catch (error) {
      console.error("[Memory] Dify API call failed:", error);
      throw error;
    }

    // ==========================================
    // POST-PROCESSING: 更新记忆
    // ==========================================

    try {
      // 从响应中提取记忆更新
      const extractedUpdate = extractMemoryUpdates(response.answer, agentType);

      if (extractedUpdate && memory) {
        if (finalConfig.debugMode) {
          console.log("[Memory] Extracted memory updates:", {
            agentType: extractedUpdate.agentType,
            confidence: extractedUpdate.confidence,
            fields: Object.keys(extractedUpdate.updates),
          });
        }

        // 更新记忆
        const success = await updateMemory(
          conversationId,
          extractedUpdate.updates,
          "merge" // 增量合并模式
        );

        if (success && finalConfig.debugMode) {
          console.log("[Memory] Memory updated successfully");
        }
      } else {
        if (finalConfig.debugMode) {
          console.log("[Memory] No memory updates found in response");
        }

        // 即使没有更新，也刷新 TTL（表示用户活跃）
        if (memory) {
          await saveMemory(conversationId, memory, finalConfig.ttl!);
        }
      }
    } catch (error) {
      console.error("[Memory] Post-processing error:", error);
      // 记忆更新失败不影响响应返回
    }

    return response;
  };
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * 手动创建/初始化记忆
 * 用于首次创建会话时
 */
export async function initializeMemory(
  conversationId: string,
  initialData?: Partial<SwarmMemory>,
  config: MemoryMiddlewareConfig = {}
): Promise<boolean> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    console.warn("[Memory] Redis unavailable, cannot initialize memory");
    return false;
  }

  const memory: SwarmMemory = {
    update_at: Date.now(),
    version: 1,
    ...initialData,
  };

  return await saveMemory(conversationId, memory, finalConfig.ttl!);
}

/**
 * 清除会话记忆
 */
export async function clearMemory(conversationId: string): Promise<boolean> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    console.warn("[Memory] Redis unavailable, cannot clear memory");
    return false;
  }

  const { deleteMemory } = await import("./redis-client");
  return await deleteMemory(conversationId);
}

/**
 * 获取会话记忆（用于调试或展示）
 */
export async function getMemoryForDisplay(conversationId: string): Promise<SwarmMemory | null> {
  const redisAvailable = await isRedisAvailable();
  if (!redisAvailable) {
    console.warn("[Memory] Redis unavailable, cannot retrieve memory");
    return null;
  }

  return await getMemory(conversationId);
}

// ================================================
// BATCH OPERATIONS
// ================================================

/**
 * 批量预处理多个请求（用于并行调用多个 Agent）
 */
export async function preProcessBatch(
  requests: Array<{ conversationId: string; agentType: string }>
): Promise<Map<string, SwarmMemory>> {
  const { getMultipleMemories } = await import("./redis-client");
  const conversationIds = requests.map((r) => r.conversationId);
  return await getMultipleMemories(conversationIds);
}
