/**
 * API Route for Strategy Research Streaming
 * Handles POST requests for strategy generation with streaming response
 * Includes comprehensive monitoring and logging
 */

import { createClient } from "@/lib/supabase/server";
import {
  getUserProfile,
  checkUserCredits,
  deductCredits,
  buildContextInjection,
  createTask,
  updateTask,
  linkAssetsToTask,
} from "@/lib/supabase/queries";
import type { WorkflowType, StrategyResearchInput } from "@/types/db";

/**
 * Request validation helper
 */
function validateStrategyRequest(body: unknown): StrategyResearchInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const { niche, revenueGoal, founderStory, strengths, file_id, selectedAssetIds } = body as any;

  if (!niche || typeof niche !== "string" || niche.trim().length === 0) {
    throw new Error("Niche is required and must be a non-empty string");
  }

  if (revenueGoal !== undefined && typeof revenueGoal !== "string") {
    throw new Error("Revenue goal must be a string");
  }

  if (founderStory !== undefined && typeof founderStory !== "string") {
    throw new Error("Founder story must be a string");
  }

  if (strengths !== undefined) {
    if (!Array.isArray(strengths)) {
      throw new Error("Strengths must be an array");
    }
    if (strengths.some((strength) => typeof strength !== "string")) {
      throw new Error("All strengths must be strings");
    }
  }

  if (file_id !== undefined && typeof file_id !== "string") {
    throw new Error("File ID must be a string");
  }

  if (selectedAssetIds !== undefined) {
    if (!Array.isArray(selectedAssetIds)) {
      throw new Error("Selected asset IDs must be an array");
    }
    if (selectedAssetIds.some((id) => typeof id !== "string")) {
      throw new Error("All asset IDs must be strings");
    }
  }

  return {
    niche: niche.trim(),
    revenueGoal: revenueGoal?.trim(),
    founderStory: founderStory?.trim(),
    strengths,
    file_id,
    selectedAssetIds: selectedAssetIds || [],
  };
}

interface StrategyRequest {
  niche: string;
  revenueGoal?: string;
  founderStory?: string;
  strengths?: string[];
  file_id?: string;
  selectedAssetIds?: string[];
}

export async function POST(request: Request) {
  // ========================================
  // 0. Request Validation
  // ========================================
  const startTime = Date.now();
  let task: { id: string } | null = null;
  let profile: { id: string; credits: number } | null = null;

  try {
    const body = await request.json();
    const validatedInput = validateStrategyRequest(body);
    const { niche, revenueGoal, founderStory, strengths, file_id, selectedAssetIds } =
      validatedInput;

    console.log(`[Strategy API] Request validated for niche: ${niche}`);

    // ========================================
    // 1. Security Check - Auth (Optional for strategy)
    // ========================================
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Strategy research allows anonymous access
    const userId = user?.id || "anonymous";
    profile = user ? await getUserProfile(user.id) : null;

    // ========================================
    // 3. Context Injection (skip for anonymous)
    // ========================================
    const contextData = profile
      ? await buildContextInjection(profile.id, selectedAssetIds || [])
      : { persona: "", products: "", audience: "", style: "" };

    // ========================================
    // 4. Credit Validation (skip for anonymous)
    // ========================================
    if (profile) {
      const creditsRequired = 1;
      const hasCredits = await checkUserCredits(profile.id, creditsRequired);

      if (!hasCredits) {
        return Response.json(
          { error: "Insufficient credits", required: creditsRequired, current: profile.credits },
          { status: 402 }
        );
      }

      // Create Task Record
      const taskInput = {
        workflow_type: "strategy_research" as WorkflowType,
        workflow_id: process.env.DIFY_WORKFLOW_STRATEGY_RESEARCH || "workflow_strategy_research",
        input_data: {
          niche,
          revenueGoal,
          founderStory,
          strengths,
          _context: contextData,
        },
        credits_used: creditsRequired,
      };

      task = await createTask(profile.id, taskInput);

      if (!task) {
        return Response.json({ error: "Failed to create task" }, { status: 500 });
      }

      // Link assets to task
      if (selectedAssetIds && selectedAssetIds.length > 0) {
        await linkAssetsToTask(task.id, selectedAssetIds);
      }
    }

    // ========================================
    // 5. Call Dify API with Streaming
    // ========================================
    // Use Strategy API Key for business strategy chatflow
    const { DifyClient } = await import("@/lib/dify/client");
    const difyClient = new DifyClient({ apiKey: process.env.DIFY_STRATEGY_KEY! });

    try {
      // Prepare files array for Dify Chatflow
      const fileList = file_id
        ? [
            {
              type: "document",
              transfer_method: "local_file",
              upload_file_id: file_id,
            },
          ]
        : [];

      // Convert camelCase to snake_case for Dify Chatflow
      const difyInputs: Record<string, unknown> = {
        niche,
        target_user: "entrepreneur",
        revenue_goal: revenueGoal || "",
        founder_story: founderStory || "",
        strengths: strengths && strengths.length > 0 ? strengths.join("\n") : "",
        uploaded_file: fileList, // Use fileList directly
        context_injection: contextData, // Add context injection
        user_id: userId, // Add user identifier
        request_timestamp: new Date().toISOString(), // Add timestamp for monitoring
      };

      const stream = await difyClient.createChatflowStream({
        inputs: difyInputs,
        query: "生成战略报告",
        user: userId,
        files: fileList,
      });

      // Return streaming response
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

              // Mark task as completed and deduct credits (only for authenticated users)
              if (task && profile) {
                const duration = Date.now() - startTime;
                await updateTask(task.id, {
                  status: "completed",
                  output_content: fullOutput,
                });

                const creditsRequired = 1;
                await deductCredits(profile.id, creditsRequired);

                console.log(`[Strategy API] Task ${task.id} completed in ${duration}ms`);
              }

              controller.close();
            } catch (error) {
              console.error("Stream processing error:", error);

              // Mark task as failed (only for authenticated users)
              if (task) {
                const duration = Date.now() - startTime;
                await updateTask(task.id, {
                  status: "failed",
                  error_message: error instanceof Error ? error.message : "Unknown error",
                });

                console.log(`[Strategy API] Task ${task.id} failed after ${duration}ms: ${error}`);
              }

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
      // Mark task as failed immediately (only for authenticated users)
      if (task) {
        const duration = Date.now() - startTime;
        await updateTask(task.id, {
          status: "failed",
          error_message: error instanceof Error ? error.message : "Dify API error",
        });

        console.log(
          `[Strategy API] Task ${task.id} failed immediately after ${duration}ms: ${error}`
        );
      }

      return Response.json(
        { error: error instanceof Error ? error.message : "Dify API error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Strategy API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
