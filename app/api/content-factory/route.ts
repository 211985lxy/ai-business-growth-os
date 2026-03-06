/**
 * Content Factory API Route (Chatflow Version)
 * 代理 Dify Chatflow Streaming API，支持对话模式。
 *
 * Dify Chatflow Streaming 文档:
 *   POST https://api.dify.ai/v1/chat-messages
 *   Headers: Authorization: Bearer {API_KEY}
 *   Body: {
 *     inputs: {...},
 *     query: string,
 *     response_mode: "streaming",
 *     user: string,
 *     conversation_id: string (optional)
 *   }
 *
 * SSE 事件格式 (来自 Dify Chatflow):
 *   data: {"event": "message", "answer": "..."}      – 流式回答片段
 *   data: {"event": "message_end", ...}              – 回答结束
 *   data: {"event": "error", ...}                    – 错误
 */

import { NextRequest } from "next/server";

const DIFY_API_BASE = process.env.DIFY_API_BASE_URL || "https://api.dify.ai/v1";
const DIFY_CONTENT_KEY = process.env.DIFY_CONTENT_KEY;

/** 转发给前端的 SSE 数据块格式 */
function sseChunk(content: string, conversationId?: string) {
  return `data: ${JSON.stringify({ content, conversationId })}\n\n`;
}

function sseError(message: string) {
  return `data: ${JSON.stringify({ error: message })}\n\n`;
}

export async function POST(req: NextRequest) {
  if (!DIFY_CONTENT_KEY) {
    return Response.json(
      { error: "DIFY_CONTENT_KEY 未配置，请在 .env.local 中添加该变量" },
      { status: 500 }
    );
  }

  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Request body is invalid JSON" }, { status: 400 });
  }

  const {
    category,
    sub_type,
    identity,
    topic,
    brand_voice,
    extra_context,
    conversation_id, // 接收现有对话 ID
    strategy_summary, // 🔥 新增：接收战略上下文
  } = body;

  // 在 Chatflow 中，通常需要一个 query。
  // 我们将核心诉求作为 query，其余作为 inputs。
  const queryText = topic || "开始创作内容";

  // ── 多平台生成指令 ─────────────────────────────────────────────────────────────
  // 生成所有平台的内容：图文、短视频、中长视频、公众号/朋友圈文案
  const multiPlatformInstruction = `
【重要】请为以下选题生成 4 种平台的内容：

1. **图文内容**（小红书/微博）
   - 吸引人的标题
   - 结构化的正文内容
   - 适当的 emoji 使用
   - 标签建议

2. **短视频脚本**（抖音/视频号，60秒内）
   - 开头钩子（3秒内抓住注意力）
   - 主体内容结构
   - 结尾 CTA（行动号召）
   - 画面/镜头建议

3. **中长视频脚本**（B站/YouTube，5-10分钟）
   - 详细的内容大纲
   - 分段脚本
   - 画面/音效建议
   - 转场提示

4. **公众号/朋友圈文案**
   - 公众号：完整的文章内容，适合深度阅读
   - 朋友圈：精简版，适合快速浏览和分享

请使用清晰的分隔符和标题来组织输出，方便用户查看和复制使用。
`.trim();

  // ── 调用 Dify Chatflow Streaming ──────────────────────────────────────────
  let difyResp: Response;
  try {
    difyResp = await fetch(`${DIFY_API_BASE}/chat-messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DIFY_CONTENT_KEY}`,
      },
      body: JSON.stringify({
        inputs: {
          category: category ?? "",
          sub_type: sub_type,
          identity: identity ?? "",
          brand_voice: brand_voice ?? "",
          extra_context: extra_context ?? "",
          strategy_context: strategy_summary || "暂无战略上下文，请基于通用逻辑创作。",
          multi_platform_instruction: multiPlatformInstruction,
        },
        query: `${queryText}\n\n${multiPlatformInstruction}`,
        response_mode: "streaming",
        user: "content-factory-user",
        conversation_id: conversation_id || undefined,
      }),
    });
  } catch (err) {
    return Response.json(
      { error: `连接 Dify 失败: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }

  if (!difyResp.ok || !difyResp.body) {
    const text = await difyResp.text().catch(() => "");
    return Response.json(
      { error: `Dify 返回异常 (${difyResp.status}): ${text}` },
      { status: difyResp.status }
    );
  }

  // ── 将 Dify 的 SSE 流转换为前端期待的 SSE 格式 ─────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      const reader = difyResp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const block of lines) {
            const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
            if (!dataLine) continue;

            const rawJson = dataLine.slice("data: ".length).trim();
            if (rawJson === "[DONE]") {
              controller.close();
              return;
            }

            let evt: any;
            try {
              evt = JSON.parse(rawJson);
            } catch {
              continue;
            }

            const event = evt.event;

            // --- message: Chatflow 流式回答事件 ---
            if (event === "message") {
              const answer = evt.answer;
              if (answer) {
                // 将对话 ID 也传回，方便前端下次请求携带
                controller.enqueue(sseChunk(answer, evt.conversation_id));
              }
              continue;
            }

            // --- error: Dify 报告错误 ---
            if (event === "error") {
              controller.enqueue(sseError(evt.message || "Dify 执行失败"));
              controller.close();
              return;
            }

            // --- message_end: 完成 ---
            if (event === "message_end") {
              // 也可以从这里拿最终的 conversation_id
              continue;
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          sseError(`流式读取中断: ${err instanceof Error ? err.message : String(err)}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
