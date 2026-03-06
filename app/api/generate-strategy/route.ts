/**
 * Generate Strategy API
 * POST /api/generate-strategy
 *
 * 调用 Dify API 生成战略全案，并将结果存储到 Supabase
 *
 * Security features:
 * - Rate limiting for anonymous users
 * - Content validation
 * - IP-based tracking
 */

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// ================================================
// CONFIGURATION
// ================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DIFY_API_KEY = process.env.DIFY_STRATEGY_API_KEY;
const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

// Rate limiting: anonymous users can only make 5 requests per hour
const ANONYMOUS_RATE_LIMIT = 5;
const ANONYMOUS_RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

// Content validation limits
const MIN_NICHE_LENGTH = 5;
const MIN_CONTENT_LENGTH = 50;
const MAX_CONTENT_LENGTH = 100000; // 100k characters

// ================================================
// TYPES
// ================================================

interface RateLimitRecord {
  ip_address: string;
  request_count: number;
  window_start: string;
  last_request: string;
}

// ================================================
// RATE LIMITING
// ================================================

/**
 * Check and enforce rate limit for anonymous users
 * Uses Supabase for distributed rate limiting
 */
async function checkRateLimit(
  supabase: any,
  ipAddress: string
): Promise<{ allowed: boolean; remaining?: number; resetAt?: string }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - ANONYMOUS_RATE_WINDOW);

  try {
    // Get or create rate limit record
    const { data: existing } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip_address", ipAddress)
      .gte("window_start", windowStart.toISOString())
      .order("window_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Check if window has expired
      const windowExpiry = new Date(
        new Date(existing.window_start).getTime() + ANONYMOUS_RATE_WINDOW
      );

      if (now > windowExpiry) {
        // Create new window
        const { data: newRecord } = await supabase
          .from("rate_limits")
          .upsert({
            ip_address: ipAddress,
            request_count: 1,
            window_start: now.toISOString(),
            last_request: now.toISOString(),
          })
          .select()
          .single();

        return {
          allowed: true,
          remaining: ANONYMOUS_RATE_LIMIT - 1,
          resetAt: new Date(now.getTime() + ANONYMOUS_RATE_WINDOW).toISOString(),
        };
      }

      // Check if limit exceeded
      if (existing.request_count >= ANONYMOUS_RATE_LIMIT) {
        return {
          allowed: false,
          resetAt: windowExpiry.toISOString(),
        };
      }

      // Increment count
      const { data: updated } = await supabase
        .from("rate_limits")
        .update({
          request_count: existing.request_count + 1,
          last_request: now.toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      return {
        allowed: true,
        remaining: ANONYMOUS_RATE_LIMIT - existing.request_count - 1,
        resetAt: windowExpiry.toISOString(),
      };
    }

    // Create new record
    await supabase.from("rate_limits").insert({
      ip_address: ipAddress,
      request_count: 1,
      window_start: now.toISOString(),
      last_request: now.toISOString(),
    });

    return {
      allowed: true,
      remaining: ANONYMOUS_RATE_LIMIT - 1,
      resetAt: new Date(now.getTime() + ANONYMOUS_RATE_WINDOW).toISOString(),
    };
  } catch (error) {
    console.error("[Rate Limit] Error checking rate limit:", error);
    // Fail open - allow request if rate limit check fails
    return { allowed: true };
  }
}

/**
 * Clean up old rate limit records
 * Should be called periodically (e.g., via cron job)
 */
async function cleanupOldRateLimits(supabase: any): Promise<void> {
  const cutoff = new Date(Date.now() - ANONYMOUS_RATE_WINDOW * 2);

  try {
    await supabase.from("rate_limits").delete().lt("window_start", cutoff.toISOString());
  } catch (error) {
    console.error("[Rate Limit] Error cleaning up old records:", error);
  }
}

// ================================================
// CONTENT VALIDATION
// ================================================

/**
 * Validate input content
 */
function validateNiche(niche: string): { valid: boolean; error?: string } {
  if (!niche || typeof niche !== "string") {
    return { valid: false, error: "Niche is required and must be a string" };
  }

  if (niche.length < MIN_NICHE_LENGTH) {
    return {
      valid: false,
      error: `Niche description is too short (minimum ${MIN_NICHE_LENGTH} characters)`,
    };
  }

  if (niche.length > 1000) {
    return {
      valid: false,
      error: "Niche description is too long (maximum 1000 characters)",
    };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onload=, etc.
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(niche)) {
      return { valid: false, error: "Niche contains invalid characters" };
    }
  }

  return { valid: true };
}

/**
 * Validate AI-generated content
 */
function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== "string") {
    return { valid: false, error: "Content is required and must be a string" };
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    return {
      valid: false,
      error: `Generated content is too short (minimum ${MIN_CONTENT_LENGTH} characters)`,
    };
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      error: "Generated content exceeds maximum length",
    };
  }

  return { valid: true };
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for IP (reverse proxy, cloudflare, etc.)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a hash of the request (not ideal but better than nothing)
  return "unknown-" + Date.now();
}

// ================================================
// MAIN API HANDLER
// ================================================

export async function POST(req: NextRequest) {
  console.log("\n=== [API] /api/generate-strategy 开始执行 ===");

  // ========================================
  // Initialize Supabase client
  // ========================================
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // ========================================
    // Step A: Parse and validate request body
    // ========================================
    const body = await req.json();
    const { userId, niche, founderStory, revenueGoal, strengths, file_id } = body;

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    console.log("[Step A] 接收到请求参数:", {
      userId: userId || "anonymous",
      clientIp,
      niche: niche?.substring(0, 50) + "...",
    });

    // ========================================
    // Step B: Rate limiting for anonymous users
    // ========================================
    if (!userId || userId === "anonymous") {
      console.log("[Step B] Checking rate limit for anonymous user");

      const rateLimitResult = await checkRateLimit(supabase, clientIp);

      if (!rateLimitResult.allowed) {
        console.warn("[Step B] Rate limit exceeded for IP:", clientIp);

        // Clean up old records periodically
        void cleanupOldRateLimits(supabase);

        return NextResponse.json(
          {
            success: false,
            error: "RATE_LIMIT_EXCEEDED",
            message: `You have reached the maximum number of anonymous requests. Please try again later.`,
            resetAt: rateLimitResult.resetAt,
          },
          {
            status: 429,
            headers: {
              "Retry-After": "3600",
              "X-RateLimit-Limit": ANONYMOUS_RATE_LIMIT.toString(),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }

      console.log("[Step B] Rate limit check passed. Remaining:", rateLimitResult.remaining);
    }

    // ========================================
    // Step C: Validate niche (required field)
    // ========================================
    const nicheValidation = validateNiche(niche);
    if (!nicheValidation.valid) {
      console.error("[Step C] Niche validation failed:", nicheValidation.error);

      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message: nicheValidation.error,
        },
        { status: 400 }
      );
    }

    console.log("[Step C] Niche validation passed");

    // ========================================
    // Step D: Check Dify API Key
    // ========================================
    if (!DIFY_API_KEY) {
      console.error("[Step D] Dify API key not configured");

      return NextResponse.json(
        {
          success: false,
          error: "CONFIGURATION_ERROR",
          message: "AI service is not properly configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    // ========================================
    // Step E: Call Dify API
    // ========================================
    console.log("[Step E] 开始调用 Dify API...");

    const difyResponse = await fetch(`${DIFY_API_URL}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      // Add timeout using AbortController
      signal: AbortSignal.timeout(60000), // 60 second timeout
      body: JSON.stringify({
        inputs: {
          niche,
          founder_story: founderStory || "",
          revenue_goal: revenueGoal || "",
          strengths: strengths || "",
        },
        query: "生成战略全案",
        user: userId || "anonymous",
        response_mode: "blocking",
        conversation_id: "",
        files: file_id
          ? [
              {
                type: "dify",
                transfer_method: "local_file",
                upload_file_id: file_id,
              },
            ]
          : [],
      }),
    });

    console.log(`[Step E] Dify API 响应状态: ${difyResponse.status}`);

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error("[Step E] Dify API 调用失败:", errorText);

      return NextResponse.json(
        {
          success: false,
          error: "DIFY_API_ERROR",
          message: "Failed to generate strategy. Please try again.",
          details: process.env.NODE_ENV === "development" ? errorText : undefined,
        },
        { status: difyResponse.status }
      );
    }

    const difyData = await difyResponse.json();
    const strategyContent = difyData.answer;

    console.log("[Step E] Dify API 响应成功");
    console.log(`[Step E] 内容长度: ${strategyContent?.length || 0} 字符`);

    // ========================================
    // Step F: Validate generated content
    // ========================================
    const contentValidation = validateContent(strategyContent);
    if (!contentValidation.valid) {
      console.error("[Step F] Content validation failed:", contentValidation.error);

      return NextResponse.json(
        {
          success: false,
          error: "CONTENT_VALIDATION_ERROR",
          message: contentValidation.error,
        },
        { status: 500 }
      );
    }

    console.log("[Step F] Content validation passed");

    // ========================================
    // Step G: Store in database
    // ========================================
    console.log("[Step G] 开始存储到数据库...");

    const finalUserId = userId || "anonymous";

    try {
      if (finalUserId === "anonymous") {
        // Anonymous users: store in temp_strategies with expiration
        const { error: insertError } = await supabase.from("temp_strategies").insert({
          ip_address: clientIp,
          niche: niche,
          content: strategyContent,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });

        if (insertError) {
          console.error("[Step G] Failed to store temp strategy:", insertError);
        } else {
          console.log("[Step G] Temp strategy stored successfully");
        }
      } else {
        // Authenticated users: store in strategies table
        const { error: insertError } = await supabase.from("strategies").insert({
          user_id: finalUserId,
          niche: niche,
          content: strategyContent,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("[Step G] Database write failed:", insertError);
        } else {
          console.log("[Step G] Strategy stored successfully");
        }
      }
    } catch (dbError) {
      console.error("[Step G] Database operation exception:", dbError);
    }

    // ========================================
    // Step H: Return success response
    // ========================================
    console.log("[Step H] 准备返回响应...");

    const responseData = {
      success: true,
      data: {
        content: strategyContent,
        conversationId: difyData.conversation_id,
        messageId: difyData.message_id,
        createdAt: new Date().toISOString(),
      },
    };

    console.log("[Step H] 响应数据准备完成");
    console.log("=== [API] /api/generate-strategy 执行成功 ===\n");

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("\n=== [API] /api/generate-strategy 执行失败 ===");
    console.error("错误类型:", error instanceof Error ? error.name : typeof error);
    console.error("错误信息:", error instanceof Error ? error.message : String(error));

    // Handle timeout specifically
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "AI service did not respond in time. Please try again.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
