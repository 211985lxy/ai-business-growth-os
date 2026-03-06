/**
 * Knowledge File Upload API
 * POST /api/knowledge/upload
 *
 * 上传知识文件到 Dify 并保存到 Supabase
 * 支持六脉分类（天道、地利、人和、神韵、财库、法度）
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — knowledge_files / knowledge_sync_log 尚未纳入 Supabase 生成类型
import { getKnowledgeService, MERIDIAN_CONFIG } from "@/lib/dify/knowledge-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// TYPES
// ============================================================================

interface _UploadRequestBody {
  userId: string;
  fileName: string;
  fileType: string;
  meridianType: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  console.log("\n=== [API] /api/knowledge/upload 开始执行 ===");

  try {
    // Step A: 获取用户会话
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Step A] 用户未认证");
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    console.log("[Step A] 用户已认证:", user.id);

    // Step B: 解析 FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const meridianType = formData.get("meridianType") as string;
    const userId = user.id;

    console.log("[Step B] 接收到上传请求:", {
      userId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      meridianType,
    });

    // Step C: 参数验证
    if (!file) {
      console.error("[Step C] 参数验证失败: 缺少文件");
      return NextResponse.json({ success: false, error: "缺少文件" }, { status: 400 });
    }

    if (!meridianType || !["tian", "di", "ren", "shen", "cai", "fa"].includes(meridianType)) {
      console.error("[Step C] 参数验证失败: 无效的脉络类型");
      return NextResponse.json({ success: false, error: "无效的脉络类型" }, { status: 400 });
    }

    // Step D: 上传文件到 Dify
    console.log("[Step D] 开始上传到 Dify...");
    const knowledgeService = getKnowledgeService();
    const uploadResult = await knowledgeService.uploadFile(file, userId);

    if (!uploadResult.success || !uploadResult.file_id) {
      console.error("[Step D] Dify 上传失败:", uploadResult.error);
      return NextResponse.json(
        { success: false, error: uploadResult.error || "文件上传失败" },
        { status: 500 }
      );
    }

    console.log("[Step D] Dify 上传成功:", {
      fileId: uploadResult.file_id,
      fileName: uploadResult.file_name,
    });

    // Step E: 保存到 Supabase knowledge_files 表
    console.log("[Step E] 保存到 Supabase...");

    const meridianConfig = MERIDIAN_CONFIG.find((m) => m.type === meridianType);
    const datasetId = meridianConfig?.datasetId;

    const { data: knowledgeFile, error: insertError } = await supabase
      .from("knowledge_files" as never)
      .insert({
        user_id: userId,
        file_name: uploadResult.file_name || file.name,
        file_type: uploadResult.file_name?.split(".").pop() || file.type,
        file_size: uploadResult.file_size || file.size,
        dify_file_id: uploadResult.file_id,
        dify_dataset_id: datasetId,
        meridian_type: meridianType,
        sync_status: "uploading",
        page_count: null,
        word_count: null,
      } as never)
      .select()
      .single();

    if (insertError) {
      console.error("[Step E] Supabase 插入失败:", insertError);
      // 注意：这里可以选择删除 Dify 上的文件，但为了简化，暂不处理
      return NextResponse.json({ success: false, error: "保存文件信息失败" }, { status: 500 });
    }

    console.log("[Step E] Supabase 保存成功:", knowledgeFile.id);

    // Step F: 更新或创建同步日志
    console.log("[Step F] 更新同步日志...");
    const { error: syncError } = await supabase
      .from("knowledge_sync_log")
      .upsert(
        {
          user_id: userId,
          sync_status: "syncing",
          last_sync_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (syncError) {
      console.error("[Step F] 同步日志更新失败:", syncError);
      // 不影响主流程，继续执行
    } else {
      console.log("[Step F] 同步日志更新成功");
    }

    // Step G: 返回成功响应
    console.log("[Step G] 准备返回响应...");

    const responseData = {
      success: true,
      file_id: knowledgeFile.id,
      dify_file_id: uploadResult.file_id,
      file_name: knowledgeFile.file_name,
      file_size: knowledgeFile.file_size,
      meridian_type: knowledgeFile.meridian_type,
      sync_status: "uploading",
    };

    console.log("[Step G] 响应数据准备完成");
    console.log("=== [API] /api/knowledge/upload 执行成功 ===\n");

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("\n=== [API] /api/knowledge/upload 执行失败 ===");
    console.error("错误类型:", error instanceof Error ? error.name : typeof error);
    console.error("错误信息:", error instanceof Error ? error.message : String(error));
    console.error("错误堆栈:", error instanceof Error ? error.stack : "No stack trace");

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - 获取用户的文件列表
// ============================================================================

export async function GET(req: NextRequest) {
  console.log("\n=== [API] /api/knowledge/upload GET 请求 ===");

  try {
    // Step A: 获取用户会话
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Step A] 用户未认证");
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    console.log("[Step A] 用户已认证:", user.id);

    // Step B: 获取文件列表
    const { data: files, error: fetchError } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("[Step B] 获取文件列表失败:", fetchError);
      return NextResponse.json({ success: false, error: "获取文件列表失败" }, { status: 500 });
    }

    console.log(`[Step B] 获取到 ${files?.length || 0} 个文件`);

    // Step C: 返回文件列表
    return NextResponse.json({
      success: true,
      files: files || [],
    });
  } catch (error) {
    console.error("\n=== [API] /api/knowledge/upload GET 执行失败 ===");
    console.error("错误信息:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE HANDLER - 删除文件
// ============================================================================

export async function DELETE(req: NextRequest) {
  console.log("\n=== [API] /api/knowledge/upload DELETE 请求 ===");

  try {
    // Step A: 获取用户会话
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Step A] 用户未认证");
      return NextResponse.json({ success: false, error: "未授权访问" }, { status: 401 });
    }

    console.log("[Step A] 用户已认证:", user.id);

    // Step B: 获取文件 ID
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      console.error("[Step B] 缺少文件 ID");
      return NextResponse.json({ success: false, error: "缺少文件 ID" }, { status: 400 });
    }

    console.log("[Step B] 删除文件:", fileId);

    // Step C: 从 Supabase 获取文件信息
    const { data: file, error: fetchError } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError || !file) {
      console.error("[Step C] 文件不存在");
      return NextResponse.json({ success: false, error: "文件不存在" }, { status: 404 });
    }

    // Step D: 验证所有权
    if (file.user_id !== user.id) {
      console.error("[Step D] 无权删除此文件");
      return NextResponse.json({ success: false, error: "无权删除此文件" }, { status: 403 });
    }

    // Step E: 从 Dify 删除文件
    console.log("[Step E] 从 Dify 删除文件...");
    const knowledgeService = getKnowledgeService();
    const deleteResult = await knowledgeService.deleteFile(file.dify_file_id);

    if (!deleteResult) {
      console.warn("[Step E] Dify 删除失败，但继续删除 Supabase 记录");
    }

    // Step F: 从 Supabase 删除记录
    console.log("[Step F] 从 Supabase 删除记录...");
    const { error: deleteError } = await supabase.from("knowledge_files").delete().eq("id", fileId);

    if (deleteError) {
      console.error("[Step F] Supabase 删除失败:", deleteError);
      return NextResponse.json({ success: false, error: "删除文件失败" }, { status: 500 });
    }

    console.log("[Step F] 文件删除成功");

    // Step G: 返回成功响应
    return NextResponse.json({
      success: true,
      message: "文件已删除",
    });
  } catch (error) {
    console.error("\n=== [API] /api/knowledge/upload DELETE 执行失败 ===");
    console.error("错误信息:", error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
