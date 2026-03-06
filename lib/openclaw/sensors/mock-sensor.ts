/**
 * Mock 传感器
 *
 * 用于开发和测试，返回模拟数据
 *
 * @module openclaw/sensors/mock-sensor
 */

export interface MockSensorConfig {
  latency?: number; // 模拟网络延迟（毫秒）
  errorRate?: number; // 错误率（0-1）
}

export class MockSensorManager {
  private config: MockSensorConfig;

  constructor(config: MockSensorConfig = {}) {
    this.config = {
      latency: 500, // 默认 500ms 延迟
      errorRate: 0.05, // 默认 5% 错误率
      ...config,
    };
  }

  /**
   * 模拟网络延迟
   */
  private async delay(): Promise<void> {
    if (this.config.latency) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.config.latency! * (0.5 + Math.random()))
      );
    }
  }

  /**
   * 模拟随机错误
   */
  private shouldError(): boolean {
    return Math.random() < (this.config.errorRate || 0);
  }

  /**
   * 获取 Mock 数据
   */
  private getMockData(sensorName: string, params: any): any {
    // 广告成本查询
    if (sensorName.includes("广告成本")) {
      const platform = params.platform || "小红书";
      const baseCpm: Record<string, number> = {
        小红书: 150,
        抖音: 180,
        公众号: 200,
        快手: 120,
        B站: 160,
      };

      return {
        platform,
        cpm: baseCpm[platform] || 150 + Math.random() * 50,
        cpc: (baseCpm[platform] || 150) / 65 + Math.random() * 0.5,
        ctr: 0.01 + Math.random() * 0.02,
        date_range: params.days || 30,
        data_points: 30,
        trend: Math.random() > 0.5 ? "up" : "down",
      };
    }

    // 竞品定价
    if (sensorName.includes("竞品定价")) {
      return {
        competitor_id: params.competitorId || "competitor_001",
        competitor_name: "竞品A公司",
        products: [
          { name: "基础套餐", price: 4999, original_price: 5999 },
          { name: "高级套餐", price: 9999, original_price: 12999 },
          { name: "企业套餐", price: 19999, original_price: 19999 },
        ],
        updated_at: new Date().toISOString(),
      };
    }

    // 行业法规查询
    if (sensorName.includes("法规") || sensorName.includes("LAW")) {
      return {
        industry: params.industry || "广告",
        risk_level: "LOW",
        forbidden_words: ["最", "第一", "顶级", "独家"],
        latest_regulations: [
          { title: "广告法修订案", date: "2026-02-15", impact: "MEDIUM" },
          { title: "互联网广告管理办法", date: "2026-01-20", impact: "LOW" },
        ],
        updated_at: new Date().toISOString(),
      };
    }

    // 竞品暴雷新闻
    if (sensorName.includes("新闻") || sensorName.includes("NEWS")) {
      return {
        platform: params.platform || "小红书",
        timeframe: params.timeframe || "last_6_months",
        violations: [
          {
            company: "某竞品公司",
            date: "2026-02-10",
            reason: "虚假宣传",
            penalty: "罚款20万元",
          },
        ],
        total_count: 3,
        risk_level: "LOW",
      };
    }

    // 广告法违禁词
    if (sensorName.includes("违禁词") || sensorName.includes("AD_LAW")) {
      return {
        category: "广告违禁词",
        words: ["最", "第一", "顶级", "独家", "国家级", "万能", "绝对", "100%", "永久", "祖传"],
        count: 10,
        last_updated: new Date().toISOString(),
      };
    }

    // 市场规模
    if (sensorName.includes("市场规模") || sensorName.includes("MARKET")) {
      const industry = params.industry || "AI咨询";
      return {
        industry,
        year: params.year || new Date().getFullYear(),
        market_size: 500 + Math.random() * 200, // 亿元
        growth_rate: 15 + Math.random() * 10, // %
        competitors: 150 + Math.floor(Math.random() * 100),
        cr: 35 + Math.random() * 15, // 集中度
      };
    }

    // 行业趋势
    if (sensorName.includes("行业趋势") || sensorName.includes("INDUSTRY")) {
      return {
        industry: params.industry || "AI咨询",
        timeframe: params.timeframe || "last_12_months",
        trends: [
          { name: "AI 智能体爆发", impact: "HIGH", growth: 300 },
          { name: "企业数字化加速", impact: "HIGH", growth: 150 },
          { name: "SaaS 订阅制普及", impact: "MEDIUM", growth: 80 },
        ],
        growth_rate: 25 + Math.random() * 15,
      };
    }

    // 招聘数据
    if (sensorName.includes("招聘") || sensorName.includes("JOBS")) {
      return {
        position: params.position || "AI顾问",
        city: params.city || "北京",
        average_salary: 15000 + Math.random() * 10000,
        openings: 500 + Math.floor(Math.random() * 500),
        top_companies: ["某科技公司", "某咨询公司", "某创业公司"],
      };
    }

    // 薪资水平
    if (sensorName.includes("薪资") || sensorName.includes("SALARY")) {
      return {
        position: params.position || "AI顾问",
        level: params.level || "mid",
        salary_range: {
          min: 12000,
          max: 25000,
          average: 18000,
        },
        by_city: [
          { city: "北京", average: 20000 },
          { city: "上海", average: 19500 },
          { city: "深圳", average: 19000 },
          { city: "杭州", average: 17500 },
        ],
      };
    }

    // 汇率查询
    if (sensorName.includes("汇率")) {
      return {
        from: params.from || "USD",
        to: params.to || "CNY",
        rate: 7.2 + Math.random() * 0.2,
        updated_at: new Date().toISOString(),
      };
    }

    // 默认返回
    return {
      sensor: sensorName,
      params,
      message: "Mock data",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 查询传感器
   */
  async query(
    sensorName: string,
    params: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    timestamp: string;
    source: string;
  }> {
    await this.delay();

    // 模拟随机错误
    if (this.shouldError()) {
      return {
        success: false,
        error: "Mock sensor error (random failure)",
        timestamp: new Date().toISOString(),
        source: "mock-sensor",
      };
    }

    console.log(`[MockSensor] Querying: ${sensorName}`, params);

    const data = this.getMockData(sensorName, params);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      source: "mock-sensor",
    };
  }

  /**
   * 批量查询
   */
  async queryMultiple(
    queries: Array<{ sensorName: string; params: Record<string, any> }>
  ): Promise<Map<string, any>> {
    const results = new Map();

    await Promise.all(
      queries.map(async ({ sensorName, params }) => {
        const result = await this.query(sensorName, params);
        results.set(sensorName, result);
      })
    );

    return results;
  }
}

/**
 * 创建 Mock 传感器管理器
 */
export function createMockSensorManager(config?: MockSensorConfig): MockSensorManager {
  return new MockSensorManager(config);
}
