/**
 * Dify API Client
 * Handles all communication with Dify workflows and chatflows
 *
 * Security features:
 * - Timeout control for all requests
 * - Safe API key validation
 * - Graceful error handling
 */

import type { DifyWorkflowRequest, DifyStreamChunk } from "@/types/db";

// ================================================
// CONFIGURATION
// ================================================

const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";
const DEFAULT_TIMEOUT = 60000; // 60 seconds
const STREAM_TIMEOUT = 120000; // 120 seconds for streaming

// ================================================
// TYPES
// ================================================

type AgentType = "strategy" | "content" | "earth" | "man" | "law" | "money";

interface DifyClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

interface DifyClientError extends Error {
  code?: string;
  status?: number;
}

// ================================================
// TIMEOUT HELPER
// ================================================

/**
 * Fetch with timeout support
 * Aborts request if it takes longer than specified timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      const timeoutError: DifyClientError = new Error(
        `Dify API request timeout after ${timeout}ms - service did not respond in time`
      );
      timeoutError.code = "TIMEOUT";
      throw timeoutError;
    }

    throw error;
  }
}

// ================================================
// DIFY CLIENT CLASS
// ================================================

export class DifyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: DifyClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DIFY_API_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;

    // Validate API key format (Dify keys are typically app-xxx or sk-xxx)
    if (!this.apiKey || this.apiKey.length < 10) {
      throw new Error(
        `Invalid Dify API key format (length: ${this.apiKey?.length || 0}). ` +
          `Expected format: app-xxxxxxxx or sk-xxxxxxxx`
      );
    }
  }

  /**
   * Create a streaming workflow execution
   * For pure Workflow apps (non-interactive)
   */
  async createWorkflowStream(request: DifyWorkflowRequest): Promise<ReadableStream> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/workflows/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...request,
          response_mode: "streaming",
        }),
      },
      STREAM_TIMEOUT // Longer timeout for streaming
    );

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw error;
    }

    if (!response.body) {
      const error: DifyClientError = new Error("No response body from Dify API");
      error.code = "NO_BODY";
      throw error;
    }

    return response.body;
  }

  /**
   * Create a streaming chatflow execution
   * For Chatflow apps (conversational workflows)
   */
  async createChatflowStream(request: {
    inputs: Record<string, unknown>;
    query: string;
    user: string;
    conversation_id?: string;
    files?: Array<{ type: string; transfer_method: string; upload_file_id?: string; url?: string }>;
  }): Promise<ReadableStream> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/chat-messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...request,
          response_mode: "streaming",
        }),
      },
      STREAM_TIMEOUT
    );

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw error;
    }

    if (!response.body) {
      const error: DifyClientError = new Error("No response body from Dify API");
      error.code = "NO_BODY";
      throw error;
    }

    return response.body;
  }

  /**
   * Create a blocking (non-streaming) request
   */
  async createBlockingRequest<T = unknown>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}${endpoint}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      this.timeout
    );

    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw error;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Parse error response from Dify API
   */
  private async parseErrorResponse(response: Response): Promise<DifyClientError> {
    let errorText = "";
    let errorCode = `HTTP_${response.status}`;

    try {
      const errorData = await response.json();
      errorText = errorData.message || errorData.error || JSON.stringify(errorData);

      // Extract error code if present
      if (errorData.code) {
        errorCode = errorData.code;
      }
    } catch {
      // Response is not JSON
      errorText = await response.text();
      if (!errorText) {
        errorText = response.statusText || `HTTP ${response.status}`;
      }
    }

    const error: DifyClientError = new Error(`Dify API error: ${response.status} - ${errorText}`);
    error.code = errorCode;
    error.status = response.status;
    return error;
  }

  /**
   * Parse Dify stream chunks
   * Returns the parsed object (can be Workflow or Chatflow format)
   */
  parseStreamLine(line: string): Record<string, unknown> | null {
    if (!line.startsWith("data: ")) {
      return null;
    }

    try {
      const jsonStr = line.slice(6);
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  /**
   * Process stream and yield readable chunks
   * Supports both Workflow API (data.text) and Chatflow API (answer)
   */
  async *processStream(stream: ReadableStream): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let lineCount = 0;
    let yieldCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.warn(
            `🏁 Stream ended. Processed ${lineCount} lines, yielded ${yieldCount} chunks`
          );
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          lineCount++;
          const chunk = this.parseStreamLine(line);

          // Debug: log first 10 raw lines
          if (lineCount <= 10) {
            console.warn(`📝 Raw line #${lineCount}:`, line.substring(0, 200));
            console.warn(`🔍 Parsed chunk #${lineCount}:`, JSON.stringify(chunk));
          }

          if (!chunk) continue;

          // Workflow API format: data.text
          if (chunk.data && typeof chunk.data === "object" && "text" in chunk.data) {
            const text = String(chunk.data.text);
            if (text) {
              yieldCount++;
              yield text;
            }
          }

          // Chatflow API format: answer field at root level
          if ("answer" in chunk && typeof chunk.answer === "string") {
            yieldCount++;
            yield chunk.answer;
          }

          // Direct text field at root level (some Dify response formats)
          if ("text" in chunk && typeof chunk.text === "string") {
            yieldCount++;
            yield chunk.text;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

// ================================================
// CLIENT FACTORY (Safe creation)
// ================================================

/**
 * Get API key for specific agent type
 */
function getApiKeyForAgent(agentType?: AgentType): string | null {
  if (agentType) {
    const key = process.env[`DIFY_${agentType.toUpperCase()}_KEY`];
    if (key) return key;
  }

  // Fallback to default key
  const defaultKey = process.env.DIFY_API_KEY;
  if (defaultKey) return defaultKey;

  return null;
}

/**
 * Create Dify client with validation
 * Returns null if API key is not configured (graceful degradation)
 */
export function createDifyClient(agentType?: AgentType): DifyClient | null {
  try {
    const apiKey = getApiKeyForAgent(agentType);

    if (!apiKey) {
      console.error(
        `[Dify] No API key configured${agentType ? ` for agent: ${agentType}` : ""}. ` +
          `Set DIFY_API_KEY or DIFY_${agentType?.toUpperCase()}_KEY environment variable.`
      );
      return null;
    }

    return new DifyClient({
      apiKey,
      baseUrl: DIFY_API_URL,
      timeout: DEFAULT_TIMEOUT,
    });
  } catch (error) {
    console.error("[Dify] Failed to create client:", error);
    return null;
  }
}

/**
 * Legacy singleton getter (deprecated, use createDifyClient instead)
 * @deprecated Use createDifyClient() for better error handling
 */
let difyClientInstance: DifyClient | null = null;

export function getDifyClient(): DifyClient {
  if (!difyClientInstance) {
    const client = createDifyClient();
    if (!client) {
      throw new Error("Failed to initialize Dify client - API key not configured");
    }
    difyClientInstance = client;
  }
  return difyClientInstance;
}

// ================================================
// ERROR RESPONSES
// ================================================

/**
 * Standard error response for API routes
 */
export function createDifyErrorResponse(error: unknown) {
  console.error("[Dify API] Error:", error);

  if (error instanceof Error) {
    // Check for timeout
    if ((error as DifyClientError).code === "TIMEOUT") {
      return {
        error: "Request timeout",
        message: "AI service did not respond in time. Please try again.",
        status: 504,
      };
    }

    // Check for invalid API key
    if (error.message.includes("API key")) {
      return {
        error: "Configuration error",
        message: "AI service is not properly configured",
        status: 500,
      };
    }

    return {
      error: "AI service error",
      message: error.message,
      status: 500,
    };
  }

  return {
    error: "Unknown error",
    message: "An unexpected error occurred",
    status: 500,
  };
}

// ============================================================================
// OPENCLAW INTEGRATION (预留接口，待后续实现)
// ============================================================================

/**
 * TODO: OpenClaw Skill 接口
 * 当 OpenClaw 接入后，六脉智能体将通过此接口被调用
 * 每个 Skill 对应一个 agent_type
 *
 * 调用方式：
 * WhatsApp/Telegram → OpenClaw Gateway → callAgentSkill() → Dify API
 */
export async function callAgentSkill(
  agentType: AgentType,
  _input: Record<string, unknown>
): Promise<void> {
  // TODO: OpenClaw 接入后在此实现
  console.warn(`[OpenClaw] Agent skill called: ${agentType}`);
}
