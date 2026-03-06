/**
 * File Upload API
 * POST /api/upload-file
 *
 * 上传文件到 Dify，返回 file_id 供后续工作流使用
 */

import { NextRequest, NextResponse } from "next/server";

// 环境变量
const DIFY_API_URL = process.env.DIFY_API_URL || "https://api.dify.ai/v1";
const DIFY_API_KEY = process.env.DIFY_STRATEGY_API_KEY!;

export async function POST(req: NextRequest) {
  console.log("\n=== [API] /api/upload-file 开始执行 ===");

  try {
    // Step A: 从请求体获取参数
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    console.log("[Step A] 接收到文件上传请求:", {
      userId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
    });

    // 参数验证
    if (!file) {
      console.error("[Step A] 参数验证失败: 缺少文件");
      return NextResponse.json({ success: false, error: "缺少文件" }, { status: 400 });
    }

    if (!userId) {
      console.error("[Step A] 参数验证失败: 缺少用户ID");
      return NextResponse.json({ success: false, error: "缺少用户ID" }, { status: 400 });
    }

    // Step B: 创建 FormData 转发给 Dify
    console.log("[Step B] 准备上传到 Dify...");

    const difyFormData = new FormData();
    difyFormData.append("file", file);
    difyFormData.append("user", userId);

    // Step C: 调用 Dify 文件上传接口
    console.log(`[Step C] Dify API URL: ${DIFY_API_URL}/files/upload`);

    const difyResponse = await fetch(`${DIFY_API_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        // 注意：fetch 会自动设置 Content-Type 为 multipart/form-data，不要手动设置
      },
      body: difyFormData,
    });

    console.log(`[Step C] Dify API 响应状态: ${difyResponse.status}`);

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      console.error("[Step C] Dify API 上传失败:", errorText);
      return NextResponse.json(
        { success: false, error: "文件上传失败: " + errorText },
        { status: difyResponse.status }
      );
    }

    const difyData = await difyResponse.json();
    console.log("[Step C] Dify API 上传成功");
    console.log("[Step C] Dify 响应数据:", {
      id: difyData.id,
      name: difyData.name,
      size: difyData.size,
    });

    // Step D: 返回 file_id 给前端
    console.log("[Step D] 准备返回响应...");
    const responseData = {
      success: true,
      file_id: difyData.id,
      file_name: difyData.name,
      file_size: difyData.size,
    };

    console.log("[Step D] 响应数据准备完成");
    console.log("=== [API] /api/upload-file 执行成功 ===\n");

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("\n=== [API] /api/upload-file 执行失败 ===");
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
