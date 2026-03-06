/**
 * API 传感器
 *
 * 用于调用外部 API 获取实时数据
 *
 * @module openclaw/sensors/api-sensor
 */

export interface ApiSensorConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
  headers?: Record<string, string>;
  timeout?: number; // 请求超时时间（毫秒）
}

export interface ApiSensorQueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  source: string;
}

export class ApiSensor {
  private config: ApiSensorConfig;

  constructor(config: ApiSensorConfig) {
    this.config = {
      timeout: 10000, // 默认 10 秒超时
      ...config,
    };
  }

  /**
   * 查询传感器
   *
   * @param params - 查询参数
   * @returns Promise<ApiSensorQueryResult>
   */
  async query<T = any>(params: Record<string, any>): Promise<ApiSensorQueryResult<T>> {
    const startTime = Date.now();

    try {
      console.log(`[ApiSensor] Querying ${this.config.name}:`, JSON.stringify(params, null, 2));

      // 构建 URL
      const url = new URL(this.config.baseUrl);
      Object.keys(params).forEach((key) => url.searchParams.append(key, String(params[key])));

      // 发起请求
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
          ...this.config.headers,
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const duration = Date.now() - startTime;
      console.log(`[ApiSensor] ${this.config.name} completed in ${duration}ms`);

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        source: this.config.baseUrl,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[ApiSensor] ${this.config.name} failed after ${duration}ms:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        source: this.config.baseUrl,
      };
    }
  }

  /**
   * POST 请求
   *
   * @param data - POST 数据
   * @returns Promise<ApiSensorQueryResult>
   */
  async post<T = any>(data: Record<string, any>): Promise<ApiSensorQueryResult<T>> {
    const startTime = Date.now();

    try {
      console.log(`[ApiSensor] POST to ${this.config.name}:`, JSON.stringify(data, null, 2));

      const response = await fetch(this.config.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
          ...this.config.headers,
        },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      const duration = Date.now() - startTime;
      console.log(`[ApiSensor] ${this.config.name} POST completed in ${duration}ms`);

      return {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
        source: this.config.baseUrl,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[ApiSensor] ${this.config.name} POST failed after ${duration}ms:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        source: this.config.baseUrl,
      };
    }
  }
}
