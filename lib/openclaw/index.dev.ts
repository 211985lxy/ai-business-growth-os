/**
 * 开发环境传感器入口
 *
 * 自动选择真实传感器或 Mock 传感器
 *
 * @module openclaw/development
 */

import { SensorManager, createConfiguredSensorManager } from "./sensor-manager";
import { createMockSensorManager, MockSensorManager } from "./sensors/mock-sensor";
import { validateOpenClawConfig } from "./config";

/**
 * 开发环境传感器管理器
 *
 * 根据配置自动选择：
 * - 如果 OpenClaw 配置有效 → 使用真实传感器
 * - 如果 OpenClaw 配置无效 → 使用 Mock 传感器
 */
export function createDevSensorManager(): SensorManager | MockSensorManager {
  const validation = validateOpenClawConfig();

  if (validation.valid) {
    console.log("✅ 使用真实传感器");
    return createConfiguredSensorManager();
  } else {
    console.log("⚠️  OpenClaw 配置无效，使用 Mock 传感器");
    console.log("   提示：在 .env.local 中设置 OPENCLAW_GATEWAY_URL 和 OPENCLAW_API_KEY");
    return createMockSensorManager({
      latency: 300, // 开发环境更快
      errorRate: 0, // 开发环境不模拟错误
    });
  }
}

// 导出所有类型和类
export * from "./index";
export * from "./sensors/mock-sensor";
