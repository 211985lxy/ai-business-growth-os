/**
 * Server Actions for AI Workflow Generation
 * Core orchestrator for streaming Dify workflows with context injection
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { getDifyClient } from "@/lib/dify/client";
import {
  getUserProfile,
  checkUserCredits,
  deductCredits,
  buildContextInjection,
  createTask,
  updateTask,
  linkAssetsToTask,
} from "@/lib/supabase/queries";
import type { TaskInput, WorkflowType } from "@/types/db";
import { InsufficientCreditsError, UnauthorizedError } from "@/types/db";

/**
 * Core Workflow Orchestrator
 * Handles: Auth check -> Context loading -> Credit validation -> AI execution
 * Returns a Response with streaming capability
 *
 * @param requireAuth - Whether to require user authentication (default: true)
 */
export async function streamWorkflow(
  workflowType: WorkflowType,
  workflowId: string,
  formData: Record<string, unknown>,
  selectedAssetIds: string[] = [],
  requireAuth: boolean = true
): Promise<Response> {
  // ========================================
  // 1. Security Check - Auth
  // ========================================
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Only require auth if requireAuth is true
  if (requireAuth && (authError || !user)) {
    throw new UnauthorizedError();
  }

  // For anonymous users, use a default user ID
  const userId = user?.id || "anonymous";
  const profile = user ? await getUserProfile(user.id) : null;

  if (requireAuth && !profile) {
    throw new Error("User profile not found");
  }

  // ========================================
  // 2. Context Injection (skip for anonymous users)
  // ========================================
  const contextData = profile
    ? await buildContextInjection(profile.id, selectedAssetIds)
    : { persona: "", products: "", audience: "", style: "" };

  // ========================================
  // 3. Credit Validation (skip for anonymous users)
  // ========================================
  if (profile) {
    const creditsRequired = 1; // Default credit cost

    const hasCredits = await checkUserCredits(profile.id, creditsRequired);

    if (!hasCredits) {
      throw new InsufficientCreditsError(creditsRequired, profile.credits);
    }
  }

  // ========================================
  // 4. Create Task Record (skip for anonymous users)
  // ========================================
  let task = null;
  if (profile) {
    const creditsRequired = 1; // Default credit cost

    const taskInput: TaskInput = {
      workflow_type: workflowType,
      workflow_id: workflowId,
      input_data: {
        ...formData,
        _context: contextData, // Inject context into input
      },
      credits_used: creditsRequired,
    };

    task = await createTask(profile.id, taskInput);

    if (!task) {
      throw new Error("Failed to create task");
    }

    // Link assets to task
    if (selectedAssetIds.length > 0) {
      await linkAssetsToTask(task.id, selectedAssetIds);
    }
  }

  // ========================================
  // 5. Call Dify API with Streaming
  // ========================================
  const difyClient = getDifyClient();

  try {
    // Convert camelCase to snake_case for Dify Chatflow
    const strengths = formData.strengths as string[] | undefined;
    const fileId = formData.file_id as string | undefined;
    const difyInputs: Record<string, unknown> = {
      niche: formData.niche,
      target_user: "entrepreneur", // Default target audience
      revenue_goal: formData.revenueGoal || "",
      founder_story: formData.founderStory || "",
      strengths: strengths && strengths.length > 0 ? strengths.join("\n") : "",
      uploaded_file: [], // Always define as array, avoid serialization issues
    };

    // Prepare files array for Dify Chatflow
    const fileList = fileId
      ? [
          {
            type: "document",
            transfer_method: "local_file",
            upload_file_id: fileId,
          },
        ]
      : [];

    // Update uploaded_file if files exist
    if (fileList.length > 0) {
      difyInputs.uploaded_file = fileList;
    }

    const stream = await difyClient.createChatflowStream({
      inputs: difyInputs,
      query: "生成战略报告", // Required for Chatflow API
      user: userId,
      files: fileList,
    });

    // Return streaming response using standard Response
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
            if (task) {
              await updateTask(task.id, {
                status: "completed",
                output_content: fullOutput,
              });

              // Deduct credits after successful completion
              const creditsRequired = 1;
              await deductCredits(profile!.id, creditsRequired);
            }

            controller.close();
          } catch (error) {
            // Mark task as failed (only for authenticated users)
            if (task) {
              await updateTask(task.id, {
                status: "failed",
                error_message: error instanceof Error ? error.message : "Unknown error",
              });
            }

            controller.error(error);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Transfer-Encoding": "chunked",
        },
      }
    );
  } catch (error) {
    // Mark task as failed immediately (only for authenticated users)
    if (task) {
      await updateTask(task.id, {
        status: "failed",
        error_message: error instanceof Error ? error.message : "Dify API error",
      });
    }

    throw error;
  }
}

/**
 * Business Strategy Workflow
 * Uses RAG (Tavily Search) for market intelligence
 * Supports anonymous access
 */
export async function streamBusinessStrategy(
  formData: {
    niche: string;
    revenueGoal?: string;
    founderStory?: string;
    strengths?: string[];
    file_id?: string;
  },
  selectedAssetIds: string[] = []
) {
  // Use DIFY_STRATEGY_KEY for business strategy
  const originalApiKey = process.env.DIFY_API_KEY;
  process.env.DIFY_API_KEY = process.env.DIFY_STRATEGY_KEY || originalApiKey;

  try {
    return streamWorkflow(
      "strategy_research",
      process.env.DIFY_WORKFLOW_STRATEGY_RESEARCH || "workflow_strategy_research",
      formData,
      selectedAssetIds,
      false // requireAuth = false for anonymous access
    );
  } finally {
    // Restore original API key
    if (originalApiKey) {
      process.env.DIFY_API_KEY = originalApiKey;
    }
  }
}

/**
 * Content IP Workflow
 * Phase 1 of Content Factory - The Drafter
 * Requires authentication
 */
export async function streamContentIP(
  formData: {
    topic: string;
    duration?: number;
    platform: "douyin" | "xiaohongshu" | "weibo" | "generic";
    content_type: "educational" | "entertainment" | "promotional" | "story";
  },
  selectedAssetIds: string[] = []
) {
  // Use DIFY_CONTENT_KEY for content IP
  const originalApiKey = process.env.DIFY_API_KEY;
  process.env.DIFY_API_KEY = process.env.DIFY_CONTENT_KEY || originalApiKey;

  try {
    return streamWorkflow(
      "script_draft",
      process.env.DIFY_WORKFLOW_SCRIPT_DRAFT || "workflow_script_draft",
      formData,
      selectedAssetIds,
      true // requireAuth = true
    );
  } finally {
    // Restore original API key
    if (originalApiKey) {
      process.env.DIFY_API_KEY = originalApiKey;
    }
  }
}

/**
 * Script Critic Workflow
 * Phase 2 of Content Factory - The Critic
 * Evaluates quality and requests improvements if score < 80
 * Requires authentication
 */
export async function streamScriptCritic(
  formData: {
    script: string;
    platform: "douyin" | "xiaohongshu" | "weibo" | "generic";
  },
  selectedAssetIds: string[] = []
) {
  return streamWorkflow(
    "script_critic",
    process.env.DIFY_WORKFLOW_SCRIPT_CRITIC || "workflow_script_critic",
    formData,
    selectedAssetIds,
    true // requireAuth = true
  );
}

/**
 * Script Refiner Workflow
 * Phase 3 of Content Factory - The Refiner
 * Improves script based on Critic feedback
 * Requires authentication
 */
export async function streamScriptRefiner(
  formData: {
    original_script: string;
    critic_feedback: string;
  },
  selectedAssetIds: string[] = []
) {
  return streamWorkflow(
    "script_refiner",
    process.env.DIFY_WORKFLOW_SCRIPT_REFINER || "workflow_script_refiner",
    formData,
    selectedAssetIds,
    true // requireAuth = true
  );
}

/**
 * XHS (Xiaohongshu) Generator Workflow
 * Converts content to XHS format with emoji and hashtags
 * Requires authentication
 */
export async function streamXHSGenerator(
  formData: {
    source_content: string;
    include_emoji?: boolean;
    hashtag_count?: number;
    target_engagement?: "high" | "medium" | "low";
  },
  selectedAssetIds: string[] = []
) {
  return streamWorkflow(
    "xhs_generator",
    process.env.DIFY_WORKFLOW_XHS_GENERATOR || "workflow_xhs_generator",
    formData,
    selectedAssetIds,
    true // requireAuth = true
  );
}
