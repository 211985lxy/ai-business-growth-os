#!/usr/bin/env tsx
/**
 * 检查传感器系统配置
 *
 * 用法：
 *   npx tsx scripts/check-sensor-config.ts
 *
 * @module scripts/check-sensor-config
 */

// 加载环境变量
import { config } from "dotenv";
config({ path: ".env.local" });

import { printConfigStatus, validateAllConfigs } from "../lib/openclaw/config";

console.log("🔍 六脉蜂群 - 传感器系统配置检查\n");

const result = validateAllConfigs();

printConfigStatus();

// 退出码
if (result.valid) {
  console.log("✅ 所有配置有效\n");
  process.exit(0);
} else {
  console.log("❌ 配置无效，请检查环境变量\n");
  process.exit(1);
}
