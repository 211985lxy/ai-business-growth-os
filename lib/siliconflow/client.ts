/**
 * SiliconFlow API Client
 * OpenAI-compatible chat completions API
 * Documentation: https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions
 */

export interface SiliconFlowMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SiliconFlowRequest {
  model: string;
  messages: SiliconFlowMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface SiliconFlowStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class SiliconFlowClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SILICONFLOW_API_KEY || "";
    this.baseUrl = "https://api.siliconflow.cn/v1";

    if (!this.apiKey) {
      throw new Error("SILICONFLOW_API_KEY is not configured");
    }
  }

  /**
   * Create a streaming chat completion
   */
  async createChatStream(request: SiliconFlowRequest): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...request,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SiliconFlow API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error("No response body from SiliconFlow API");
    }

    return response.body;
  }

  /**
   * Create a non-streaming chat completion
   */
  async createChatCompletion(request: SiliconFlowRequest): Promise<{
    id: string;
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...request,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SiliconFlow API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Parse SSE stream line
   */
  parseStreamLine(line: string): SiliconFlowStreamChunk | null {
    if (!line.startsWith("data: ")) {
      return null;
    }

    const data = line.slice(6).trim();

    // Stream end marker
    if (data === "[DONE]") {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Process stream and yield text chunks
   */
  async *processStream(stream: ReadableStream): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const chunk = this.parseStreamLine(line);

          if (!chunk) continue;

          // Extract content from delta
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            yield content;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * Singleton SiliconFlow client instance
 */
let siliconFlowClientInstance: SiliconFlowClient | null = null;

export function getSiliconFlowClient(): SiliconFlowClient {
  if (!siliconFlowClientInstance) {
    siliconFlowClientInstance = new SiliconFlowClient();
  }
  return siliconFlowClientInstance;
}
