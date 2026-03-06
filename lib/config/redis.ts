/**
 * Redis Configuration
 *
 * 用于蜂群记忆系统的 Redis 连接配置
 */

// 动态导入 ioredis 以避免构建时依赖
type Redis = any;

let RedisModule: any = null;

// ================================================
// CONFIG
// ================================================

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = parseInt(process.env.REDIS_DB || "0", 10);

// 连接配置
const REDIS_CONFIG = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// ================================================
// SINGLETON INSTANCE
// ================================================

let redisInstance: Redis | null = null;

/**
 * 获取 Redis 客户端实例（单例模式）
 */
export function getRedisClient(): Redis | null {
  if (redisInstance) {
    return redisInstance;
  }

  // 检查是否启用 Redis（通过环境变量）
  if (process.env.REDIS_ENABLED === "false") {
    console.warn("[Redis] Redis is disabled via REDIS_ENABLED=false");
    return null;
  }

  try {
    if (!RedisModule) {
      RedisModule = require("ioredis");
    }
    const client = new RedisModule.Redis(REDIS_URL, {
      password: REDIS_PASSWORD,
      db: REDIS_DB,
      ...REDIS_CONFIG,
    });

    // 错误处理
    client.on("error", (error: Error) => {
      console.error("[Redis] Connection error:", error.message);
    });

    client.on("connect", () => {
      console.log("[Redis] Connected successfully");
    });

    client.on("close", () => {
      console.warn("[Redis] Connection closed");
    });

    redisInstance = client;
    return client;
  } catch (error) {
    console.error("[Redis] Failed to create client:", error);
    return null;
  }
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedisClient(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit();
    redisInstance = null;
    console.log("[Redis] Connection closed");
  }
}

/**
 * 检查 Redis 是否可用
 */
export async function isRedisAvailable(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    const result = await client.ping();
    return result === "PONG";
  } catch (error) {
    console.error("[Redis] Health check failed:", error);
    return false;
  }
}

// ================================================
// HELPERS
// ================================================

/**
 * Graceful degradation: 如果 Redis 不可用，返回 null
 * 所有调用方应该处理 null 的情况
 */
export async function safeRedisOperation<T>(
  operation: (client: Redis) => Promise<T>,
  fallbackValue?: T
): Promise<T | null> {
  const client = getRedisClient();
  if (!client) {
    console.warn("[Redis] Client not available, using fallback");
    return fallbackValue ?? null;
  }

  try {
    return await operation(client);
  } catch (error) {
    console.error("[Redis] Operation failed:", error);
    return fallbackValue ?? null;
  }
}
