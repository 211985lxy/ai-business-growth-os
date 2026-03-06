/**
 * Unified Workplace API Router
 * 统一的工作空间 API 路由器
 *
 * 六脉智能体矩阵：
 * - strategy (天道·战略): 商业战略生成
 * - content (神韵·内容): IP 架构与内容生成
 * - earth (地道·产业): 供应链与行业数据库
 * - man (人道·流量): 流量分析与用户画像
 * - law (法度·风险): 合规审核与风险控制
 * - money (财帛·转化): ROI 计算与转化策略
 *
 * Features:
 * - Unified endpoint for all AI agents
 * - Streaming response support
 * - Context injection (strategy → other agents)
 * - User isolation with Supabase Auth
 * - Credit system integration
 */

import { createClient } from "@/lib/supabase/server";
import { DifyClient } from "@/lib/dify/client";
import { persistFilesAsync } from "@/lib/supabase/storage";

// ================================================
// TYPES
// ================================================

type AgentType = "strategy" | "content" | "earth" | "man" | "law" | "money";

interface WorkplaceRequest {
  agentType: AgentType;
  query?: string;
  inputs?: Record<string, unknown>;
  conversation_id?: string;
  files?: Array<{ type: string; transfer_method: string; upload_file_id?: string; url?: string }>;
}

interface AgentConfig {
  apiKeyEnv: string;
  description: string;
  requiresStrategyContext: boolean;
}

// ================================================
// AGENT CONFIGURATION
// ================================================

/**
 * 智能体配置映射表
 * 每个智能体对应一个环境变量和描述
 */
const AGENT_CONFIG: Record<AgentType, AgentConfig> = {
  strategy: {
    apiKeyEnv: "DIFY_STRATEGY_KEY",
    description: "天道·战略 - 商业战略生成",
    requiresStrategyContext: false,
  },
  content: {
    apiKeyEnv: "DIFY_CONTENT_KEY",
    description: "神韵·内容 - IP 架构与内容生成",
    requiresStrategyContext: true,
  },
  earth: {
    apiKeyEnv: "DIFY_EARTH_KEY",
    description: "地道·产业 - 供应链与行业数据库",
    requiresStrategyContext: true,
  },
  man: {
    apiKeyEnv: "DIFY_MAN_KEY",
    description: "人道·流量 - 流量分析与用户画像",
    requiresStrategyContext: true,
  },
  law: {
    apiKeyEnv: "DIFY_LAW_KEY",
    description: "法度·风险 - 合规审核与风险控制",
    requiresStrategyContext: false,
  },
  money: {
    apiKeyEnv: "DIFY_MONEY_KEY",
    description: "财帛·转化 - ROI 计算与转化策略",
    requiresStrategyContext: true,
  },
};

// ================================================
// VALIDATION
// ================================================

/**
 * 验证请求体格式
 */
function validateWorkplaceRequest(body: unknown): WorkplaceRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { agentType, query, inputs, conversation_id, files } = body as any;

  // 验证 agentType
  if (!agentType || typeof agentType !== "string") {
    throw new Error("agentType is required and must be a string");
  }

  if (!AGENT_CONFIG[agentType as AgentType]) {
    throw new Error(
      `Invalid agentType: ${agentType}. Must be one of: ${Object.keys(AGENT_CONFIG).join(", ")}`
    );
  }

  // 验证 query (可选)
  if (query !== undefined && typeof query !== "string") {
    throw new Error("query must be a string");
  }

  // 验证 inputs (可选)
  if (inputs !== undefined && typeof inputs !== "object") {
    throw new Error("inputs must be an object");
  }

  // 验证 conversation_id (可选)
  if (conversation_id !== undefined && typeof conversation_id !== "string") {
    throw new Error("conversation_id must be a string");
  }

  // 验证 files (可选)
  if (files !== undefined) {
    if (!Array.isArray(files)) {
      throw new Error("files must be an array");
    }
    for (const file of files) {
      if (typeof file !== "object") {
        throw new Error("Each file must be an object");
      }
    }
  }

  return {
    agentType: agentType as AgentType,
    query,
    inputs: inputs || {},
    conversation_id,
    files,
  };
}

// ================================================
// CONTEXT INJECTION
// ================================================

/**
 * 从 strategy_contexts 表获取最新的战略内容
 * 用于为其他智能体提供上下文
 */
async function getLatestStrategyContext(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("strategy_contexts")
    .select("output_content")
    .eq("user_id", userId)
    .not("output_content", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Workplace API] Error fetching strategy context:", error);
    return "";
  }

  if (!data || !(data as any).output_content) {
    return "";
  }

  // 只返回前 2000 个字符作为上下文，避免超出 token 限制
  const content =
    typeof (data as any).output_content === "string"
      ? (data as any).output_content
      : JSON.stringify((data as any).output_content);
  return content.substring(0, 2000);
}

// ================================================
// CREDIT SYSTEM
// ================================================

/**
 * 检查用户积分
 */
async function checkUserCredits(userId: string, required: number): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return (data as any).credits >= required;
}

/**
 * 扣除用户积分
 */
async function deductCredits(userId: string, creditsToDeduct: number): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await (supabase as any).rpc("deduct_credits", {
    p_user_id: userId,
    p_credits_to_deduct: creditsToDeduct,
  });

  if (error) {
    console.error("[Workplace API] Error deducting credits:", error);
    return false;
  }

  return true;
}

// ================================================
// MAIN API HANDLER
// ================================================

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // ========================================
    // 1. 验证请求体
    // ========================================
    const body = await request.json();
    const validatedRequest = validateWorkplaceRequest(body);
    const { agentType, query, inputs, conversation_id, files } = validatedRequest;

    console.log(`[Workplace API] ${agentType.toUpperCase()} request received`);

    // ========================================
    // 2. 验证 API Key
    // ========================================
    const agentConfig = AGENT_CONFIG[agentType];
    const apiKey = process.env[agentConfig.apiKeyEnv];

    if (!apiKey) {
      console.error(`[Workplace API] Missing API key for ${agentType}: ${agentConfig.apiKeyEnv}`);
      return Response.json(
        {
          error: "Configuration error",
          message: `${agentConfig.description} API key is not configured`,
        },
        { status: 500 }
      );
    }

    // ========================================
    // 3. 用户认证
    // ========================================
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: "Unauthorized", message: "User must be authenticated" },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log(`[Workplace API] User authenticated: ${userId}`);

    // ========================================
    // 4. 积分验证
    // ========================================
    const creditsRequired = 1; // 每次请求消耗 1 积分
    const hasCredits = await checkUserCredits(userId, creditsRequired);

    if (!hasCredits) {
      return Response.json(
        {
          error: "Insufficient credits",
          required: creditsRequired,
          message: "您没有足够的积分，请充值",
        },
        { status: 402 }
      );
    }

    // ========================================
    // 5. 上下文注入
    // ========================================
    let injectedContext = "";

    if (agentConfig.requiresStrategyContext) {
      injectedContext = await getLatestStrategyContext(userId);

      if (injectedContext) {
        console.log(`[Workplace API] Injected strategy context (${injectedContext.length} chars)`);
      } else {
        console.warn(`[Workplace API] No strategy context found for user ${userId}`);
      }
    }

    // ========================================
    // 6. 扣除积分
    // ========================================
    await deductCredits(userId, creditsRequired);

    // ========================================
    // 7. 调用 Dify API
    // ========================================
    const difyClient = new DifyClient({ apiKey });

    // 准备请求数据
    const difyInputs: Record<string, unknown> = {
      ...inputs,
    };

    // 如果需要上下文注入，添加到 inputs 中
    if (injectedContext) {
      difyInputs.strategy_context = injectedContext;
    }

    // 使用 query 或默认查询
    const finalQuery = query || `请使用 ${agentConfig.description} 功能`;

    try {
      const stream = await difyClient.createChatflowStream({
        inputs: difyInputs,
        query: finalQuery,
        user: userId,
        conversation_id: conversation_id || "",
        files: files || [],
      });

      // ========================================
      // 8. 返回流式响应
      // ========================================
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let fullOutput = "";

            try {
              for await (const chunk of difyClient.processStream(stream)) {
                fullOutput += chunk;
                controller.enqueue(encoder.encode(chunk));
              }

              // 如果是 strategy 智能体，保存到 strategy_contexts 表
              if (agentType === "strategy" && fullOutput) {
                const { error: insertError } = await (supabase as any)
                  .from("strategy_contexts")
                  .insert({
                    user_id: userId,
                    output_content: fullOutput,
                    niche: (inputs?.niche as string) || "",
                    revenue_goal: (inputs?.revenue_goal as string) || "",
                    founder_story: (inputs?.founder_story as string) || "",
                    strengths: (inputs?.strengths as string[]) || [],
                    is_active: true,
                    source: "ai_generated",
                    created_at: new Date().toISOString(),
                  });

                if (insertError) {
                  console.error("[Workplace API] Error saving strategy:", insertError);
                } else {
                  console.log("[Workplace API] Strategy saved successfully");
                }
              }

              const duration = Date.now() - startTime;
              console.log(`[Workplace API] ${agentType.toUpperCase()} completed in ${duration}ms`);

              // 异步处理文件持久化（不阻塞流式输出）
              if (fullOutput) {
                persistFilesAsync(fullOutput, userId, agentType).catch((error) => {
                  console.error("[Workplace API] Async persist files error:", error);
                });
              }

              controller.close();
            } catch (error) {
              console.error("[Workplace API] Stream processing error:", error);
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
    } catch (difyError) {
      console.error("[Workplace API] Dify API error:", difyError);

      // Dify API 调用失败，返还积分
      // 注意：这里只是简单记录，实际生产环境可能需要更复杂的处理

      return Response.json(
        {
          error: "Dify API error",
          message: difyError instanceof Error ? difyError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Workplace API] Request error:", error);

    return Response.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
