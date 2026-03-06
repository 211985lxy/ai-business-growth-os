/**
 * Scraper 传感器
 *
 * 通过 OpenClaw 的网页抓取能力获取数据
 *
 * @module openclaw/sensors/scraper-sensor
 */

export interface ScraperConfig {
  openclawUrl: string;
  apiKey: string;
  timeout?: number; // 请求超时时间（毫秒）
}

export interface ScrapeResult {
  success: boolean;
  data?: {
    url: string;
    title?: string;
    content?: string;
    extracted_data?: Record<string, any>;
    images?: string[];
  };
  error?: string;
  timestamp: string;
  source: string;
}

export class ScraperSensor {
  private config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = {
      timeout: 30000, // 默认 30 秒超时（网页抓取较慢）
      ...config,
    };
  }

  /**
   * 抓取网页内容
   *
   * @param url - 目标 URL
   * @param options - 抓取选项
   * @returns Promise<ScrapeResult>
   */
  async scrape(
    url: string,
    options?: {
      selector?: string; // CSS 选择器
      extractType?: "content" | "html" | "markdown" | "structured";
      waitFor?: number; // 等待时间（毫秒）
      screenshot?: boolean; // 是否截图
    }
  ): Promise<ScrapeResult> {
    const startTime = Date.now();

    try {
      console.log(`[ScraperSensor] Scraping: ${url}`);

      const response = await fetch(`${this.config.openclawUrl}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          url,
          selector: options?.selector,
          extract_type: options?.extractType || "content",
          wait_for: options?.waitFor,
          screenshot: options?.screenshot || false,
        }),
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        throw new Error(`Scrape request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const duration = Date.now() - startTime;
      console.log(`[ScraperSensor] Scrape completed in ${duration}ms`);

      return {
        success: true,
        data: {
          url,
          title: data.title,
          content: data.content,
          extracted_data: data.extracted_data,
          images: data.images,
        },
        timestamp: new Date().toISOString(),
        source: "openclaw-scraper",
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[ScraperSensor] Scrape failed after ${duration}ms:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
        source: "openclaw-scraper",
      };
    }
  }

  /**
   * 批量抓取多个网页
   *
   * @param urls - URL 列表
   * @param options - 抓取选项
   * @returns Promise<ScrapeResult[]>
   */
  async scrapeMultiple(
    urls: string[],
    options?: {
      selector?: string;
      extractType?: "content" | "html" | "markdown" | "structured";
      concurrency?: number; // 并发数，默认 3
    }
  ): Promise<ScrapeResult[]> {
    const concurrency = options?.concurrency || 3;
    const results: ScrapeResult[] = [];

    console.log(
      `[ScraperSensor] Batch scraping ${urls.length} URLs with concurrency ${concurrency}`
    );

    // 分批处理
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map((url) => this.scrape(url, options)));
      results.push(...batchResults);
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `[ScraperSensor] Batch scrape completed: ${successCount}/${urls.length} successful`
    );

    return results;
  }

  /**
   * 监控网页变化
   *
   * @param url - 目标 URL
   * @param selector - CSS 选择器（用于精确比较）
   * @param previousContent - 上次抓取的内容
   * @returns Promise<{ hasChanged: boolean; newContent?: string }>
   */
  async detectChanges(
    url: string,
    selector: string,
    previousContent: string
  ): Promise<{ hasChanged: boolean; newContent?: string; error?: string }> {
    const result = await this.scrape(url, { selector, extractType: "content" });

    if (!result.success || !result.data?.content) {
      return {
        hasChanged: false,
        error: result.error || "No content retrieved",
      };
    }

    const newContent = result.data.content;
    const hasChanged = newContent !== previousContent;

    return {
      hasChanged,
      newContent: hasChanged ? newContent : undefined,
    };
  }
}
