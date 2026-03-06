/**
 * OpenClaw 传感器系统
 *
 * 统一导出所有传感器相关模块
 *
 * @module openclaw
 */

// 先导入类型和类
import {
  SensorManager,
  createConfiguredSensorManager,
  type SensorQueryResult,
} from "./sensor-manager";

// 然后重新导出
export {
  SensorManager,
  createConfiguredSensorManager,
  type SensorQueryResult,
} from "./sensor-manager";

// API 传感器
export { ApiSensor, type ApiSensorConfig, type ApiSensorQueryResult } from "./sensors/api-sensor";

// Scraper 传感器
export { ScraperSensor, type ScraperConfig, type ScrapeResult } from "./sensors/scraper-sensor";

// Database 传感器
export {
  DatabaseSensor,
  type AdCostRecord,
  type CompetitorPricingRecord,
} from "./sensors/db-sensor";

/**
 * 快速创建传感器管理器
 *
 * 使用环境变量自动配置
 *
 * @example
 * ```typescript
 * import { createSensorManager } from '@/lib/openclaw';
 *
 * const sensorManager = createSensorManager();
 * const result = await sensorManager.query('广告成本查询', { platform: '小红书' });
 * ```
 */
export function createSensorManager(): SensorManager {
  return createConfiguredSensorManager();
}
