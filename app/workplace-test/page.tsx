/**
 * Workplace Test Page
 * New Feishu-style dark mode workspace layout
 */

"use client";

import { WorkplaceLayout } from "@/components/workplace/layout";
import { WorkspaceCanvas } from "@/components/workplace/workspace-canvas";

export default function WorkplaceTestPage() {
  // Sample content for testing - displayed in placeholder state
  const sampleContent = `# 商业战略分析报告

## 一、市场分析

### 1.1 行业概览
当前市场规模约 500 亿人民币，年增长率保持在 15% 左右。

### 1.2 竞争格局
主要竞争对手包括：
- 头部企业 A：市场份额 35%
- 新兴企业 B：快速增长中
- 传统企业 C：转型中

## 二、核心战略

### 2.1 差异化定位
聚焦细分市场，提供个性化解决方案。

### 2.2 增长路径
1. 短期：建立品牌认知
2. 中期：扩大市场份额
3. 长期：建立生态壁垒

## 三、执行计划

### 第一季度
- 完成产品迭代
- 建立核心团队
- 获得首批种子用户

### 第二季度
- 拓展市场渠道
- 优化用户体验
- 实现盈亏平衡

---

*本报告由 AI 战略分析系统自动生成*
`;

  return (
    <WorkplaceLayout>
      <WorkspaceCanvas />
    </WorkplaceLayout>
  );
}
