/**
 * Swarm Memory - 蜂群记忆系统
 *
 * 为六脉Agent提供共享记忆，实现跨Agent的上下文传递
 *
 * @example
 * ```typescript
 * import { withMemoryMiddleware } from "@/lib/memory";
 *
 * // 包装 Dify API 调用
 * const enhancedDifyCall = withMemoryMiddleware(
 *   originalDifyCall,
 *   "天道·战略",
 *   { debugMode: true }
 * );
 *
 * // 正常调用，记忆会自动注入和更新
 * const result = await enhancedDifyCall(requestParams);
 * ```
 */

// ================================================
// TYPES
// ================================================

export type {
  SwarmMemory,
  MemoryUpdateRequest,
  MemoryQueryResult,
  MemorySummary,
  ExtractedUpdate,
} from "./types";

// ================================================
// HELPERS
// ================================================

export {
  getMemoryKey,
  generateMemoryContext,
  compressMemory,
  extractMemoryUpdates,
  validateMemorySize,
} from "./types";

// ================================================
// MIDDLEWARE
// ================================================

export type { DifyApiRequest, DifyApiResponse, MemoryMiddlewareConfig } from "./middleware";

export {
  withMemoryMiddleware,
  initializeMemory,
  clearMemory,
  getMemoryForDisplay,
  preProcessBatch,
} from "./middleware";

// ================================================
// REDIS CLIENT
// ================================================

export type { MemoryOperationResult } from "./redis-client";

export {
  getMemory,
  saveMemory,
  updateMemory,
  deleteMemory,
  checkMemoryExists,
  getMemoryTTL,
  getMultipleMemories,
  cleanupExpiredMemories,
} from "./redis-client";

// ================================================
// REDIS CONFIG
// ================================================

export {
  getRedisClient,
  closeRedisClient,
  isRedisAvailable,
  safeRedisOperation,
} from "../config/redis";
