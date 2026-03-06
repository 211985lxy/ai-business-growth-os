/**
 * Supabase Storage Helper
 * Supabase 存储工具函数
 *
 * 功能：
 * - 上传文件到 Supabase Storage
 * - 持久化 Dify 临时文件 URL
 * - 管理用户资产文件
 */

import { createClient } from "./server";

// ================================================
// TYPES
// ================================================

interface PersistFileResult {
  success: boolean;
  originalUrl: string;
  permanentUrl?: string;
  error?: string;
}

interface AssetFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  original_url: string;
  permanent_url: string;
  created_at: string;
}

// ================================================
// CONSTANTS
// ================================================

const STORAGE_BUCKET = "assets";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
];

// ================================================
// STORAGE OPERATIONS
// ================================================

/**
 * 上传文件到 Supabase Storage
 *
 * @param file - File 或 Buffer 对象
 * @param userId - 用户 ID
 * @param folder - 文件夹路径（如 "strategy", "content"）
 * @returns 文件的公共 URL
 */
export async function uploadFileToStorage(
  file: File | Buffer,
  userId: string,
  folder: string
): Promise<{ path: string; url: string } | null> {
  const supabase = await createClient();

  try {
    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = file instanceof File ? file.name : `file_${timestamp}_${randomStr}`;
    const filePath = `${userId}/${folder}/${timestamp}_${randomStr}_${fileName}`;

    // 上传文件
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      console.error("[Storage] Upload error:", error);
      return null;
    }

    // 获取公共 URL
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error("[Storage] Upload exception:", error);
    return null;
  }
}

/**
 * 从 URL 下载文件并上传到 Supabase Storage
 *
 * @param fileUrl - 文件 URL
 * @param userId - 用户 ID
 * @param folder - 文件夹路径
 * @returns 上传结果
 */
export async function downloadAndPersistFile(
  fileUrl: string,
  userId: string,
  folder: string
): Promise<PersistFileResult> {
  try {
    console.warn(`[Storage] Starting file download: ${fileUrl}`);

    // 1. 下载文件
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 2. 检查文件大小
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`File size (${blob.size} bytes) exceeds limit (${MAX_FILE_SIZE} bytes)`);
    }

    // 3. 检查文件类型
    if (!blob.type || !ALLOWED_FILE_TYPES.includes(blob.type)) {
      console.warn(`[Storage] Unexpected file type: ${blob.type}, continuing anyway`);
    }

    // 4. 转换为 File 对象
    const fileName = getFileNameFromUrl(fileUrl) || `file_${Date.now()}`;
    const file = new File([blob], fileName, { type: blob.type });

    // 5. 上传到 Supabase Storage
    const uploadResult = await uploadFileToStorage(file, userId, folder);

    if (!uploadResult) {
      return {
        success: false,
        originalUrl: fileUrl,
        error: "Failed to upload file to storage",
      };
    }

    console.warn(`[Storage] File persisted successfully: ${uploadResult.url}`);

    return {
      success: true,
      originalUrl: fileUrl,
      permanentUrl: uploadResult.url,
    };
  } catch (error) {
    console.error("[Storage] Persist file error:", error);
    return {
      success: false,
      originalUrl: fileUrl,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 批量持久化文件 URL
 *
 * @param content - Dify 返回的内容
 * @param userId - 用户 ID
 * @param folder - 文件夹路径
 * @returns 替换后的内容和持久化结果列表
 */
export async function persistFilesInContent(
  content: string,
  userId: string,
  folder: string
): Promise<{ replacedContent: string; results: PersistFileResult[] }> {
  console.warn(`[Storage] Scanning content for file URLs...`);

  // 1. 提取所有文件 URL
  const fileUrls = extractFileUrls(content);

  if (fileUrls.length === 0) {
    console.warn("[Storage] No file URLs found in content");
    return { replacedContent: content, results: [] };
  }

  console.warn(`[Storage] Found ${fileUrls.length} file URLs`);

  // 2. 批量下载并上传
  const results: PersistFileResult[] = [];
  let replacedContent = content;

  // 使用 Set 去重
  const uniqueUrls = Array.from(new Set(fileUrls));

  for (const url of uniqueUrls) {
    try {
      const result = await downloadAndPersistFile(url, userId, folder);
      results.push(result);

      // 如果成功，替换内容中的 URL
      if (result.success && result.permanentUrl) {
        // 使用全局替换，确保所有出现都被替换
        replacedContent = replacedContent.split(url).join(result.permanentUrl);
      }
    } catch (error) {
      console.error(`[Storage] Failed to persist file ${url}:`, error);
      results.push({
        success: false,
        originalUrl: url,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  console.warn(
    `[Storage] Persisted ${results.filter((r) => r.success).length}/${results.length} files`
  );

  return { replacedContent, results };
}

// ================================================
// HELPERS
// ================================================

/**
 * 从 URL 提取文件名
 */
function getFileNameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split("/");
    return segments[segments.length - 1] || null;
  } catch {
    return null;
  }
}

/**
 * 从内容中提取文件 URL
 * 支持：
 * - HTTP/HTTPS URL
 * - 图片标签 (![](url))
 * - Markdown 链接 [text](url)
 * - HTML 标签 <img src="url">
 */
function extractFileUrls(content: string): string[] {
  const urls: string[] = [];

  // 1. 匹配 HTTP/HTTPS URL（图片、文档等）
  const httpUrlRegex =
    /https?:\/\/[^\s\]]*\.(?:jpg|jpeg|png|gif|webp|svg|pdf|txt|md)(?:\?[^\s\]]*)?/gi;
  const httpMatches = content.match(httpUrlRegex);
  if (httpMatches) {
    urls.push(...httpMatches);
  }

  // 2. 匹配 Markdown 图片链接
  // 格式: ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi;
  let match;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    urls.push(match[2]);
  }

  // 3. 匹配 HTML img 标签
  const htmlImgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = htmlImgRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  // 4. 匹配 Dify 特殊的文件链接格式
  // Dify 可能返回: [file:https://xxx.com/file.pdf] 或类似格式
  const difyFileRegex = /\[file:([^\]]+)\]/gi;
  while ((match = difyFileRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }

  // 去重并返回
  return Array.from(new Set(urls));
}

/**
 * 异步处理文件持久化（不阻塞主流程）
 *
 * @param content - 流式输出的完整内容
 * @param userId - 用户 ID
 * @param folder - 文件夹路径
 */
export async function persistFilesAsync(
  content: string,
  userId: string,
  folder: string = "strategy"
): Promise<void> {
  // 使用 setImmediate 或 setTimeout 将任务放入事件队列
  // 这样不会阻塞流式文字的输出
  setTimeout(async () => {
    try {
      const { replacedContent, results } = await persistFilesInContent(content, userId, folder);

      // 如果有文件被成功持久化，更新数据库
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        console.warn(`[Storage] Successfully persisted ${successCount} files`);

        // TODO: 更新数据库中的 content
        // 这里需要根据具体的表结构来更新
        // 例如：await updateStrategyContent(strategyId, replacedContent);
      }
    } catch (error) {
      console.error("[Storage] Async persist files error:", error);
    }
  }, 100); // 延迟 100ms，确保流式输出完成
}

// ================================================
// DATABASE OPERATIONS
// ================================================

/**
 * 保存资产文件记录到数据库
 *
 * @param userId - 用户 ID
 * @param assetData - 资产文件数据
 * @returns 保存的记录
 */
export async function saveAssetRecord(
  userId: string,
  assetData: {
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
    original_url: string;
    permanent_url: string;
  }
): Promise<AssetFile | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await (supabase as any)
      .from("asset_files")
      .insert({
        user_id: userId,
        ...assetData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("[Storage] Database insert error:", error);
      return null;
    }

    return data as AssetFile;
  } catch (error) {
    console.error("[Storage] Database insert exception:", error);
    return null;
  }
}

/**
 * 获取用户的资产文件列表
 *
 * @param userId - 用户 ID
 * @param fileType - 文件类型过滤（可选）
 * @returns 资产文件列表
 */
export async function getUserAssets(userId: string, fileType?: string): Promise<AssetFile[]> {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("asset_files")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fileType) {
      query = query.eq("file_type", fileType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Storage] Database query error:", error);
      return [];
    }

    return (data || []) as AssetFile[];
  } catch (error) {
    console.error("[Storage] Database query exception:", error);
    return [];
  }
}

/**
 * 删除资产文件
 *
 * @param assetId - 资产文件 ID
 * @param userId - 用户 ID（用于权限验证）
 * @returns 是否删除成功
 */
export async function deleteAssetFile(assetId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    // 1. 先获取文件记录
    const { data: asset } = await (supabase as any)
      .from("asset_files")
      .select("*")
      .eq("id", assetId)
      .eq("user_id", userId)
      .single();

    if (!asset) {
      console.error("[Storage] Asset not found or access denied");
      return false;
    }

    // 2. 删除 Storage 中的文件
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error("[Storage] Storage delete error:", storageError);
      return false;
    }

    // 3. 删除数据库记录
    const { error: dbError } = await (supabase as any)
      .from("asset_files")
      .delete()
      .eq("id", assetId);

    if (dbError) {
      console.error("[Storage] Database delete error:", dbError);
      return false;
    }

    console.warn(`[Storage] Asset deleted successfully: ${assetId}`);
    return true;
  } catch (error) {
    console.error("[Storage] Delete asset exception:", error);
    return false;
  }
}
