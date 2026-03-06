#!/usr/bin/env tsx
/**
 * 测试 Mock 传感器
 *
 * 用法：
 *   npx tsx scripts/test-sensor-mock.ts
 *
 * @module scripts/test-sensor-mock
 */

import { createDevSensorManager } from "../lib/openclaw/index.dev";

async function testSensors() {
  console.log("🧪 测试传感器系统\n");

  const sensorManager = createDevSensorManager();

  // 测试用例
  const tests = [
    {
      name: "广告成本查询",
      sensor: "广告成本查询",
      params: { platform: "小红书", days: 30 },
    },
    {
      name: "竞品定价",
      sensor: "竞品定价",
      params: { competitorId: "competitor_001" },
    },
    {
      name: "行业法规查询",
      sensor: "行业法规查询",
      params: { industry: "广告" },
    },
    {
      name: "市场规模",
      sensor: "市场规模",
      params: { industry: "AI咨询", year: 2026 },
    },
  ];

  console.log(`运行 ${tests.length} 个测试...\n`);

  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log("─".repeat(50));

    const startTime = Date.now();
    const result = await sensorManager.query(test.sensor, test.params);
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log("✅ 成功");
      console.log(`⏱️  耗时: ${duration}ms`);
      console.log(`📊 数据:`, JSON.stringify(result.data, null, 2));
    } else {
      console.log("❌ 失败");
      console.log(`🔴 错误:`, result.error);
    }
  }

  // 测试批量查询
  console.log("\n\n📋 批量查询测试");
  console.log("─".repeat(50));

  const batchStartTime = Date.now();
  const batchResults = await sensorManager.queryMultiple([
    { sensorName: "广告成本查询", params: { platform: "小红书" } },
    { sensorName: "广告成本查询", params: { platform: "抖音" } },
    { sensorName: "竞品定价", params: { competitorId: "competitor_001" } },
  ]);
  const batchDuration = Date.now() - batchStartTime;

  console.log(`✅ 批量查询完成`);
  console.log(`⏱️  总耗时: ${batchDuration}ms`);
  console.log(`📊 结果数: ${batchResults.size}`);

  batchResults.forEach((result, sensorName) => {
    console.log(`  - ${sensorName}: ${result.success ? "✅" : "❌"}`);
  });

  console.log("\n\n✨ 所有测试完成！");
}

testSensors().catch(console.error);
