/**
 * AI Monitoring Utilities
 * Provides logging and tracking for AI API calls
 */

export interface AIMetrics {
  startTime: number;
  endTime?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  model?: string;
  provider?: string;
  status: "pending" | "success" | "error";
  error?: string;
}

export class AIMonitor {
  private metrics: AIMetrics;

  constructor(provider: string = "dify", model?: string) {
    this.metrics = {
      startTime: Date.now(),
      provider,
      model,
      status: "pending",
    };
  }

  /**
   * Record token usage
   */
  recordTokens(input: number, output: number, total?: number): this {
    this.metrics.inputTokens = input;
    this.metrics.outputTokens = output;
    this.metrics.totalTokens = total ?? input + output;
    return this;
  }

  /**
   * Mark the call as successful
   */
  success(): this {
    this.metrics.endTime = Date.now();
    this.metrics.status = "success";
    return this;
  }

  /**
   * Mark the call as failed
   */
  error(error: string): this {
    this.metrics.endTime = Date.now();
    this.metrics.status = "error";
    this.metrics.error = error;
    return this;
  }

  /**
   * Get duration in milliseconds
   */
  getDuration(): number {
    const endTime = this.metrics.endTime ?? Date.now();
    return endTime - this.metrics.startTime;
  }

  /**
   * Generate input summary (max 200 chars)
   */
  static generateInputSummary(input: Record<string, unknown>): string {
    const keys = Object.keys(input).slice(0, 3);
    const parts = keys.map((key) => {
      const value = input[key];
      if (typeof value === "string") {
        return `${key}: ${value.substring(0, 50)}${value.length > 50 ? "..." : ""}`;
      }
      return `${key}: ${JSON.stringify(value).substring(0, 50)}`;
    });
    return parts.join(" | ").substring(0, 200);
  }

  /**
   * Generate output summary (max 200 chars)
   */
  static generateOutputSummary(output: string): string {
    // Remove markdown formatting for cleaner summary
    const cleanText = output
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/```[\s\S]*?```/g, "[代码]")
      .replace(/\n/g, " ")
      .trim();

    return cleanText.substring(0, 200) + (cleanText.length > 200 ? "..." : "");
  }

  /**
   * Convert metrics to database format
   */
  toDatabaseFormat(): Partial<{
    token_total_tokens: number;
    token_input_tokens: number;
    token_output_tokens: number;
    duration_ms: number;
    model_used: string;
    provider: string;
    metadata: Record<string, unknown>;
  }> {
    return {
      token_total_tokens: this.metrics.totalTokens,
      token_input_tokens: this.metrics.inputTokens,
      token_output_tokens: this.metrics.outputTokens,
      duration_ms: this.getDuration(),
      model_used: this.metrics.model,
      provider: this.metrics.provider,
      metadata: {
        status: this.metrics.status,
        error: this.metrics.error,
        startTime: new Date(this.metrics.startTime).toISOString(),
        endTime: this.metrics.endTime ? new Date(this.metrics.endTime).toISOString() : null,
      },
    };
  }

  /**
   * Log to console (for debugging)
   */
  log(context: string): void {
    const duration = this.getDuration();
    console.log(`[AI Monitor] ${context}:`, {
      provider: this.metrics.provider,
      model: this.metrics.model,
      status: this.metrics.status,
      duration: `${duration}ms`,
      tokens: this.metrics.totalTokens
        ? {
            input: this.metrics.inputTokens,
            output: this.metrics.outputTokens,
            total: this.metrics.totalTokens,
          }
        : "N/A",
      error: this.metrics.error,
    });
  }
}

/**
 * Create a monitoring instance for an AI call
 */
export function createAIMonitor(provider?: string, model?: string): AIMonitor {
  return new AIMonitor(provider, model);
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${tokens}`;
}

/**
 * Estimate cost based on token usage (very rough estimate)
 * Dify pricing varies by model and provider
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = "gpt-3.5-turbo"
): number {
  // Rough estimates in USD (adjust based on actual Dify pricing)
  const pricingPer1K: Record<string, { input: number; output: number }> = {
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    "gpt-4": { input: 0.03, output: 0.06 },
    "claude-3-haiku": { input: 0.00025, output: 0.00125 },
    "claude-3-sonnet": { input: 0.003, output: 0.015 },
    "claude-3-opus": { input: 0.015, output: 0.075 },
  };

  const modelPricing = pricingPer1K[model] || pricingPer1K["gpt-3.5-turbo"];

  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
}
