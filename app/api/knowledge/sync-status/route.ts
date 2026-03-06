/**
 * Knowledge Sync Status API
 * 查询知识库同步状态
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id parameter" }, { status: 400 });
    }

    // 获取最新的同步日志
    const { data: syncLog, error: syncError } = await supabase
      .from("knowledge_sync_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (syncError && syncError.code !== "PGRST116") {
      // PGRST116 表示没有找到记录，这是正常的
      throw syncError;
    }

    // 获取文件统计
    const { data: files, error: filesError } = await supabase
      .from("knowledge_files")
      .select("sync_status, meridian_type, word_count")
      .eq("user_id", userId);

    if (filesError) throw filesError;

    // 计算统计数据
    const totalFiles = files?.length || 0;
    const indexedFiles = files?.filter((f) => f.sync_status === "synced").length || 0;
    const failedFiles = files?.filter((f) => f.sync_status === "failed").length || 0;

    // 按脉络统计
    const meridianStats: Record<string, { count: number; wordCount: number }> = {
      tian: { count: 0, wordCount: 0 },
      di: { count: 0, wordCount: 0 },
      ren: { count: 0, wordCount: 0 },
      shen: { count: 0, wordCount: 0 },
      cai: { count: 0, wordCount: 0 },
      fa: { count: 0, wordCount: 0 },
    };

    files?.forEach((file) => {
      const meridianType = file.meridian_type;
      if (meridianStats[meridianType]) {
        meridianStats[meridianType].count++;
        meridianStats[meridianType].wordCount += file.word_count || 0;
      }
    });

    const totalWordCount = files?.reduce((sum, f) => sum + (f.word_count || 0), 0) || 0;

    // 返回状态
    const status = {
      totalFiles,
      indexedFiles,
      failedFiles,
      coveragePercentage: syncLog?.coverage_percentage || 0,
      syncStatus: syncLog?.sync_status || "idle",
      lastSyncAt: syncLog?.last_sync_at || null,
      meridianStats,
      totalWordCount,
    };

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
