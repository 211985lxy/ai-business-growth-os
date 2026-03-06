/**
 * 传感器管理器
 *
 * 统一管理所有传感器，提供统一的查询接口
 * 支持三种传感器类型：API、Scraper、Database
 *
 * @module openclaw/sensor-manager
 */

import { ApiSensor, ApiSensorConfig } from "./sensors/api-sensor";
import { ScraperSensor, ScraperConfig } from "./sensors/scraper-sensor";
import { DatabaseSensor } from "./sensors/db-sensor";
import { getOpenClawConfig } from "./config";

export interface SensorQueryResult<T = any> {
  sensorName: string;
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source: string;
}

export class SensorManager {
  private apiSensors: Map<string, ApiSensor> = new Map();
  private scraperSensor: ScraperSensor;
  private dbSensor: DatabaseSensor;

  constructor(openclawUrl?: string, apiKey?: string) {
    // 获取 OpenClaw 配置（验证环境变量）
    let config: { gatewayUrl: string; apiKey: string };

    try {
      config = getOpenClawConfig();
    } catch (error) {
      // 如果配置无效，使用默认值（允许开发环境继续运行）
      console.warn("[SensorManager] OpenClaw 配置无效，使用默认值");
      config = {
        gatewayUrl:
          openclawUrl || process.env.OPENCLAW_GATEWAY_URL || "https://gateway.openclaw.com",
        apiKey: apiKey || process.env.OPENCLAW_API_KEY || "",
      };
    }

    // 初始化 Scraper 传感器
    this.scraperSensor = new ScraperSensor({
      openclawUrl: config.gatewayUrl,
      apiKey: config.apiKey,
    });

    // 初始化 Database 传感器
    this.dbSensor = new DatabaseSensor();

    console.log("[SensorManager] Initialized");
  }

  /**
   * 注册 API 传感器
   *
   * @param name - 传感器名称
   * @param config - API 传感器配置
   */
  registerApiSensor(name: string, config: ApiSensorConfig): void {
    const sensor = new ApiSensor(config);
    this.apiSensors.set(name, sensor);
    console.log(`[SensorManager] Registered API sensor: ${name}`);
  }

  /**
   * 批量注册 API 传感器
   *
   * @param sensors - 传感器配置数组
   */
  registerApiSensors(sensors: Array<{ name: string; config: ApiSensorConfig }>): void {
    sensors.forEach(({ name, config }) => {
      this.registerApiSensor(name, config);
    });
  }

  /**
   * 统一查询接口
   *
   * 根据传感器名称自动路由到对应的传感器类型
   *
   * @param sensorName - 传感器名称
   * @param params - 查询参数
   * @returns Promise<SensorQueryResult>
   */
  async query<T = any>(
    sensorName: string,
    params: Record<string, any>
  ): Promise<SensorQueryResult<T>> {
    const startTime = Date.now();
    console.log(`[SensorManager] Querying: ${sensorName}`, params);

    try {
      let result: any;

      // 路由逻辑：根据传感器名称判断类型
      if (sensorName.includes("查询") || sensorName.includes("API")) {
        // API 传感器
        const sensor = this.apiSensors.get(sensorName);
        if (!sensor) {
          throw new Error(`API Sensor not found: ${sensorName}`);
        }
        const apiResult = await sensor.query<T>(params);

        if (!apiResult.success) {
          return {
            sensorName,
            success: false,
            error: apiResult.error,
            timestamp: apiResult.timestamp,
            source: apiResult.source,
          };
        }

        result = apiResult.data;
      } else if (
        sensorName.includes("抓取") ||
        sensorName.includes("网页") ||
        sensorName.includes("scrape")
      ) {
        // Scraper 传感器
        const scrapeResult = await this.scraperSensor.scrape(params.url, params.options);

        if (!scrapeResult.success) {
          return {
            sensorName,
            success: false,
            error: scrapeResult.error,
            timestamp: scrapeResult.timestamp,
            source: scrapeResult.source,
          };
        }

        result = scrapeResult.data;
      } else if (
        sensorName.includes("历史") ||
        sensorName.includes("数据库") ||
        sensorName.includes("db")
      ) {
        // Database 传感器
        if (sensorName.includes("广告成本")) {
          result = await this.dbSensor.queryAdCost(params.platform, params.days);
        } else if (sensorName.includes("竞品定价")) {
          result = await this.dbSensor.queryCompetitorPricing(params.competitorId);
        } else {
          throw new Error(`Unknown database sensor: ${sensorName}`);
        }
      } else {
        throw new Error(`Unknown sensor: ${sensorName}`);
      }

      const duration = Date.now() - startTime;
      console.log(`[SensorManager] ${sensorName} completed in ${duration}ms`);

      return {
        sensorName,
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        source: "sensor-manager",
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[SensorManager] ${sensorName} failed after ${duration}ms:`, error);

      return {
        sensorName,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        source: "sensor-manager",
      };
    }
  }

  /**
   * 批量查询多个传感器（并行）
   *
   * @param queries - 查询数组
   * @returns Promise<Map<string, SensorQueryResult>>
   */
  async queryMultiple(
    queries: Array<{ sensorName: string; params: Record<string, any> }>
  ): Promise<Map<string, SensorQueryResult>> {
    console.log(`[SensorManager] Batch querying ${queries.length} sensors`);

    const results = new Map<string, SensorQueryResult>();

    // 并行查询所有传感器
    await Promise.all(
      queries.map(async ({ sensorName, params }) => {
        const result = await this.query(sensorName, params);
        results.set(sensorName, result);
      })
    );

    // 统计结果
    const successCount = Array.from(results.values()).filter((r) => r.success).length;
    console.log(
      `[SensorManager] Batch query completed: ${successCount}/${queries.length} successful`
    );

    return results;
  }

  /**
   * 查询所有已注册的 API 传感器
   *
   * @returns string[] - 传感器名称数组
   */
  getRegisteredApiSensors(): string[] {
    return Array.from(this.apiSensors.keys());
  }

  /**
   * 检查传感器是否已注册
   *
   * @param sensorName - 传感器名称
   * @returns boolean
   */
  isRegistered(sensorName: string): boolean {
    return this.apiSensors.has(sensorName);
  }

  /**
   * 获取传感器统计信息
   *
   * @returns 统计信息对象
   */
  getStats(): {
    apiSensorsCount: number;
    hasScraperSensor: boolean;
    hasDbSensor: boolean;
  } {
    return {
      apiSensorsCount: this.apiSensors.size,
      hasScraperSensor: !!this.scraperSensor,
      hasDbSensor: !!this.dbSensor,
    };
  }
}

/**
 * 创建预配置的传感器管理器
 *
 * 自动注册所有常用的六脉传感器
 *
 * @returns SensorManager
 */
export function createConfiguredSensorManager(): SensorManager {
  const manager = new SensorManager();

  // 注册法度·风险传感器
  if (process.env.LAW_API_KEY) {
    manager.registerApiSensor("行业法规查询", {
      name: "行业法规查询",
      baseUrl: "https://api.law.gov.cn/v1/search",
      apiKey: process.env.LAW_API_KEY,
      timeout: 10000,
    });
  }

  if (process.env.NEWS_API_KEY) {
    manager.registerApiSensor("竞品暴雷新闻", {
      name: "竞品暴雷新闻",
      baseUrl: "https://api.news.com/v1/search",
      apiKey: process.env.NEWS_API_KEY,
      timeout: 15000,
    });
  }

  manager.registerApiSensor("广告法违禁词", {
    name: "广告法违禁词",
    baseUrl: "https://api.adlaw.com/v1/keywords",
    apiKey: process.env.AD_LAW_API_KEY,
    timeout: 10000,
  });

  // 注册财帛·转化传感器
  if (process.env.AD_COST_API_KEY) {
    manager.registerApiSensor("广告成本查询", {
      name: "广告成本查询",
      baseUrl: "https://api.adcost.com/v1/query",
      apiKey: process.env.AD_COST_API_KEY,
      timeout: 10000,
    });
  }

  manager.registerApiSensor("竞品定价", {
    name: "竞品定价",
    baseUrl: "https://api.competitor.com/v1/price",
    apiKey: process.env.COMPETITOR_API_KEY,
    timeout: 10000,
  });

  manager.registerApiSensor("汇率查询", {
    name: "汇率查询",
    baseUrl: "https://api.exchangerate.com/v1/latest",
    timeout: 10000,
  });

  // 注册天道·战略传感器
  manager.registerApiSensor("市场规模", {
    name: "市场规模",
    baseUrl: "https://api.marketresearch.com/v1/size",
    apiKey: process.env.MARKET_RESEARCH_API_KEY,
    timeout: 15000,
  });

  manager.registerApiSensor("行业趋势", {
    name: "行业趋势",
    baseUrl: "https://api.industry.com/v1/trend",
    apiKey: process.env.INDUSTRY_API_KEY,
    timeout: 15000,
  });

  // 注册人和·模式传感器
  manager.registerApiSensor("招聘数据", {
    name: "招聘数据",
    baseUrl: "https://api.jobs.com/v1/search",
    apiKey: process.env.JOBS_API_KEY,
    timeout: 10000,
  });

  manager.registerApiSensor("薪资水平", {
    name: "薪资水平",
    baseUrl: "https://api.salary.com/v1/query",
    apiKey: process.env.SALARY_API_KEY,
    timeout: 10000,
  });

  console.log("[SensorManager] Pre-configured sensor manager created with", manager.getStats());

  return manager;
}
