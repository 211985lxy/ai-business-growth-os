/**
 * Swarm Memory - Redis Client Wrapper
 *
 * 为蜂群记忆提供类型安全的 Redis 操作接口
 * 支持优雅降级（Redis 不可用时返回 null）
 */

import type { SwarmMemory } from "./types";
import { getMemoryKey } from "./types";
import { safeRedisOperation } from "../config/redis";

// ================================================
// TYPES
// ================================================

/**
 * Redis 操作结果
 */
export interface MemoryOperationResult {
  success: boolean;
  memory: SwarmMemory | null;
  error?: string;
}

// ================================================
// OPERATIONS
// ================================================

/**
 * 从 Redis 读取记忆
 */
export async function getMemory(conversationId: string): Promise<SwarmMemory | null> {
  return safeRedisOperation(async (client) => {
    const key = getMemoryKey(conversationId);
    const data = await client.get(key);

    if (!data) {
      console.log(`[Memory] No memory found for ${conversationId}`);
      return null;
    }

    try {
      const memory = JSON.parse(data) as SwarmMemory;
      console.log(`[Memory] Loaded memory for ${conversationId}`, {
        version: memory.version,
        update_at: memory.update_at,
      });
      return memory;
    } catch (error) {
      console.error("[Memory] Failed to parse memory JSON:", error);
      return null;
    }
  }, null);
}

/**
 * 保存记忆到 Redis
 * @param conversationId 会话ID
 * @param memory 记忆对象
 * @param ttl 过期时间（秒），默认 2 小时
 */
export async function saveMemory(
  conversationId: string,
  memory: SwarmMemory,
  ttl: number = 7200
): Promise<boolean> {
  const result = await safeRedisOperation(async (client) => {
    const key = getMemoryKey(conversationId);

    // 更新元数据
    memory.update_at = Date.now();
    memory.version = (memory.version || 0) + 1;

    const data = JSON.stringify(memory);
    await client.setex(key, ttl, data);

    console.log(`[Memory] Saved memory for ${conversationId}`, {
      version: memory.version,
      ttl,
      size: data.length,
    });

    return true;
  }, false);
  return result ?? false;
}

/**
 * 更新记忆的特定字段（增量更新）
 * @param conversationId 会话ID
 * @param updates 要更新的字段
 * @param updateMode 更新模式：replace=替换, merge=合并, append=追加
 */
export async function updateMemory(
  conversationId: string,
  updates: Partial<SwarmMemory>,
  updateMode: "replace" | "merge" | "append" = "merge"
): Promise<boolean> {
  const result = await safeRedisOperation(async (client) => {
    const key = getMemoryKey(conversationId);

    // 读取现有记忆
    const existingData = await client.get(key);
    let memory: SwarmMemory;

    if (!existingData) {
      // 创建新记忆
      memory = {
        update_at: Date.now(),
        version: 1,
        ...updates,
      };
    } else {
      // 解析现有记忆
      memory = JSON.parse(existingData) as SwarmMemory;

      // 根据模式更新
      if (updateMode === "replace") {
        // 替换模式：直接覆盖
        Object.assign(memory, updates);
      } else if (updateMode === "merge") {
        // 合并模式：只更新提供的字段
        Object.keys(updates).forEach((field) => {
          const value = updates[field as keyof SwarmMemory];
          if (value !== undefined) {
            (memory as any)[field] = value;
          }
        });
      } else if (updateMode === "append") {
        // 追加模式：在现有内容后追加
        Object.keys(updates).forEach((field) => {
          const value = updates[field as keyof SwarmMemory];
          if (value !== undefined) {
            const existing = (memory as any)[field] || "";
            (memory as any)[field] = existing ? `${existing}\n\n${value}` : value;
          }
        });
      }
    }

    // 更新元数据
    memory.update_at = Date.now();
    memory.version = (memory.version || 0) + 1;

    // 保存回 Redis
    const data = JSON.stringify(memory);
    await client.setex(key, 7200, data); // 2 小时过期

    console.log(`[Memory] Updated memory for ${conversationId}`, {
      mode: updateMode,
      version: memory.version,
      fields: Object.keys(updates),
    });

    return true;
  }, false);
  return result ?? false;
}

/**
 * 删除记忆
 */
export async function deleteMemory(conversationId: string): Promise<boolean> {
  const result = await safeRedisOperation(async (client) => {
    const key = getMemoryKey(conversationId);
    await client.del(key);
    console.log(`[Memory] Deleted memory for ${conversationId}`);
    return true;
  }, false);
  return result ?? false;
}

/**
 * 检查记忆是否存在且未过期
 */
export async function checkMemoryExists(conversationId: string): Promise<boolean> {
  const result =
    (await safeRedisOperation(async (client) => {
      const key = getMemoryKey(conversationId);
      const exists = await client.exists(key);
      return exists === 1;
    }, false)) ?? false;
  return result as boolean;
}

/**
 * 获取记忆的 TTL（剩余时间，秒）
 */
export async function getMemoryTTL(conversationId: string): Promise<number | null> {
  return safeRedisOperation(async (client) => {
    const key = getMemoryKey(conversationId);
    const ttl = await client.ttl(key);
    return ttl;
  }, null);
}

// ================================================
// BATCH OPERATIONS
// ================================================

/**
 * 批量获取多个会话的记忆
 */
export async function getMultipleMemories(
  conversationIds: string[]
): Promise<Map<string, SwarmMemory>> {
  const resultMap = new Map<string, SwarmMemory>();

  await safeRedisOperation(async (client) => {
    const pipeline = client.pipeline();
    const keys = conversationIds.map((id) => getMemoryKey(id));

    keys.forEach((key) => pipeline.get(key));
    const results = await pipeline.exec();

    if (results) {
      results.forEach((result: any, index: number) => {
        if (result && result[1]) {
          try {
            const memory = JSON.parse(result[1] as string) as SwarmMemory;
            resultMap.set(conversationIds[index], memory);
          } catch (error) {
            console.error(`[Memory] Failed to parse memory for ${conversationIds[index]}:`, error);
          }
        }
      });
    }
  });

  return resultMap;
}

/**
 * 清理过期记忆（主动清理，通常不需要，Redis 会自动过期）
 */
export async function cleanupExpiredMemories(): Promise<number> {
  // Redis 会自动清理过期键，这个函数主要用于手动清理
  // 通常在测试或调试时使用
  const result =
    (await safeRedisOperation(async (client) => {
      const keys = await client.keys("swarm:memory:*");
      if (keys.length === 0) {
        return 0;
      }

      // 检查每个 key 的 TTL
      const pipeline = client.pipeline();
      keys.forEach((key: string) => pipeline.ttl(key));
      const results = await pipeline.exec();

      let cleanedCount = 0;
      if (results) {
        const expiredKeys: string[] = [];
        results.forEach((result: any, index: number) => {
          // TTL 为 -2 表示 key 已过期但未被删除
          if (result && result[1] === -2) {
            expiredKeys.push(keys[index]);
          }
        });

        if (expiredKeys.length > 0) {
          await client.del(...expiredKeys);
          cleanedCount = expiredKeys.length;
        }
      }

      return cleanedCount;
    }, 0)) ?? 0;
  return result as number;
}
