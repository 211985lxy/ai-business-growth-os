/**
 * SiliconFlow Chat API Route
 * 使用 SiliconFlow 提供AI对话功能
 */

import { SiliconFlowClient } from "@/lib/siliconflow/client";

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const {
      messages,
      model = "Pro/deepseek-ai/DeepSeek-R1",
      temperature = 0.7,
      max_tokens = 4096,
    } = body;

    // 验证消息
    if (!messages || messages.length === 0) {
      return Response.json({ error: "Messages are required" }, { status: 400 });
    }

    console.log(`[SiliconFlow Chat] Request received with ${messages.length} messages`);
    console.log(`[SiliconFlow Chat] 🤖 Using model: ${model}`);
    console.log(`[SiliconFlow Chat] 📊 Temperature: ${temperature}, Max tokens: ${max_tokens}`);

    // 创建 SiliconFlow 客户端
    const client = new SiliconFlowClient();

    // 创建流式响应
    const stream = await client.createChatStream({
      model,
      messages: messages as any,
      temperature,
      max_tokens,
    });

    // 返回流式响应
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          try {
            for await (const chunk of client.processStream(stream)) {
              controller.enqueue(encoder.encode(chunk));
            }

            controller.close();
            console.log("[SiliconFlow Chat] Stream completed successfully");
          } catch (error) {
            console.error("[SiliconFlow Chat] Stream error:", error);
            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      }
    );
  } catch (error) {
    console.error("[SiliconFlow Chat] API error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "SiliconFlow API error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
