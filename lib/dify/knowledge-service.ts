/**
 * Dify Knowledge Service
 * 管理知识库文件上传、同步和检索
 * 支持六脉知识库的动态挂载
 */

import { DifyClient, createDifyClient } from "./client";

// ============================================================================
// TYPES
// ============================================================================

export interface FileUploadResult {
  success: boolean;
  file_id?: string;
  file_name?: string;
  file_size?: number;
  error?: string;
}

export interface DatasetInfo {
  id: string;
  name: string;
  permission: "only_me" | "all_team_members" | "partial_members";
  data_source_type: string;
  indexing_technique: "high_quality" | "economy";
  chunk_method: "automatic" | "custom";
  created_by: string;
  created_at: string;
}

export interface SyncStatus {
  total_files: number;
  indexing_files: number;
  completed_files: number;
  failed_files: number;
  last_sync_at: string | null;
}

export interface SearchResultWithCitations {
  answer: string;
  citations: Array<{
    number: number;
    file_name: string;
    page?: number;
    content?: string;
    confidence?: number;
  }>;
  consistency_score?: number;
}

export interface MeridianConfig {
  type: "tian" | "di" | "ren" | "shen" | "cai" | "fa";
  name: string;
  datasetId?: string;
}

// ============================================================================
// KNOWLEDGE SERVICE CLASS
// ============================================================================

export class DifyKnowledgeService {
  private client: DifyClient | null;
  private baseUrl: string;

  constructor() {
    // 使用默认的 Dify API key（后续可以支持传入不同的 API key）
    this.client = createDifyClient();
    this.baseUrl = process.env.DIFY_API_URL || "https://api.dify.ai/v1";

    if (!this.client) {
      console.error("[DifyKnowledge] Failed to initialize Dify client");
    }
  }

  /**
   * 上传文件到 Dify
   */
  async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    console.log(`[DifyKnowledge] Uploading file: ${file.name} (${file.size} bytes)`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user", userId);

      const response = await fetch(`${this.baseUrl}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          // 注意：fetch 会自动设置 Content-Type 为 multipart/form-data
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DifyKnowledge] Upload failed: ${errorText}`);
        return {
          success: false,
          error: `文件上传失败: ${errorText}`,
        };
      }

      const data = await response.json();
      console.log(`[DifyKnowledge] Upload successful: ${data.id}`);

      return {
        success: true,
        file_id: data.id,
        file_name: data.name,
        file_size: data.size,
      };
    } catch (error) {
      console.error("[DifyKnowledge] Upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
      };
    }
  }

  /**
   * 获取数据集信息
   */
  async getDataset(datasetId: string): Promise<DatasetInfo | null> {
    console.log(`[DifyKnowledge] Getting dataset info: ${datasetId}`);

    try {
      const response = await fetch(`${this.baseUrl}/datasets/${datasetId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`[DifyKnowledge] Failed to get dataset: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data as DatasetInfo;
    } catch (error) {
      console.error("[DifyKnowledge] Get dataset error:", error);
      return null;
    }
  }

  /**
   * 获取数据集同步状态
   */
  async getDatasetSyncStatus(datasetId: string): Promise<SyncStatus | null> {
    console.log(`[DifyKnowledge] Getting sync status: ${datasetId}`);

    try {
      const response = await fetch(`${this.baseUrl}/datasets/${datasetId}/indexing-status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`[DifyKnowledge] Failed to get sync status: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data as SyncStatus;
    } catch (error) {
      console.error("[DifyKnowledge] Get sync status error:", error);
      return null;
    }
  }

  /**
   * 使用知识库检索并生成答案（带引用）
   * 支持动态传入多个 dataset_ids
   */
  async searchWithKnowledge(
    query: string,
    datasetIds: string[],
    userId: string,
    meridianTypes: string[] = []
  ): Promise<SearchResultWithCitations> {
    console.log(`[DifyKnowledge] Searching with knowledge: ${query}`);
    console.log(`[DifyKnowledge] Using datasets: ${datasetIds.join(", ")}`);
    console.log(`[DifyKnowledge] Active meridians: ${meridianTypes.join(", ") || "all"}`);

    try {
      // 使用 Chatflow API（支持检索增强生成 RAG）
      const response = await fetch(`${this.baseUrl}/chat-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            query,
            dataset_ids: datasetIds,
            meridian_types: meridianTypes,
          },
          query,
          user: userId,
          response_mode: "blocking", // 使用阻塞模式以获取完整响应和引用
          retrieval_model: {
            search_method: "semantic_search",
            reranking_enable: true,
            reranking_model: {
              reranking_provider_name: "cohere",
              reranking_model_name: "rerank-english-v2.0",
            },
            top_k: 3,
            top_n: 5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DifyKnowledge] Search failed: ${errorText}`);
        throw new Error(`知识库检索失败: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[DifyKnowledge] Search successful`);

      // 解析响应，提取答案和引用
      const answer = data.answer || "";
      const citations: Array<{
        number: number;
        file_name: string;
        page?: number;
        content?: string;
        confidence?: number;
      }> = [];

      // 从 metadata 中提取引用信息
      if (data.metadata?.retrieve_resources) {
        data.metadata.retrieve_resources.forEach((resource: any, index: number) => {
          citations.push({
            number: index + 1,
            file_name: resource.document_name || "未知文件",
            page: resource.position?.position_index,
            content: resource.content,
            confidence: resource.score,
          });
        });
      }

      // 计算一致性评分（基于引用的置信度）
      const consistencyScore =
        citations.length > 0
          ? Math.round(
              (citations.reduce((sum, c) => sum + (c.confidence || 0.5), 0) / citations.length) *
                100
            )
          : 0;

      return {
        answer,
        citations,
        consistency_score: consistencyScore,
      };
    } catch (error) {
      console.error("[DifyKnowledge] Search error:", error);
      throw error;
    }
  }

  /**
   * 创建知识库数据集（可选）
   * 用于为每个脉络创建独立的知识库
   */
  async createDataset(name: string, meridianType: string): Promise<{ id: string } | null> {
    console.log(`[DifyKnowledge] Creating dataset: ${name} (${meridianType})`);

    try {
      const response = await fetch(`${this.baseUrl}/datasets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${name} - ${meridianType}`,
          permission: "only_me",
          indexing_technique: "high_quality",
          data_source_type: "upload_file",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DifyKnowledge] Failed to create dataset: ${errorText}`);
        return null;
      }

      const data = await response.json();
      console.log(`[DifyKnowledge] Dataset created: ${data.id}`);
      return { id: data.id };
    } catch (error) {
      console.error("[DifyKnowledge] Create dataset error:", error);
      return null;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(fileId: string): Promise<boolean> {
    console.log(`[DifyKnowledge] Deleting file: ${fileId}`);

    try {
      const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(`[DifyKnowledge] Failed to delete file: ${response.status}`);
        return false;
      }

      console.log(`[DifyKnowledge] File deleted successfully`);
      return true;
    } catch (error) {
      console.error("[DifyKnowledge] Delete file error:", error);
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let knowledgeServiceInstance: DifyKnowledgeService | null = null;

export function getKnowledgeService(): DifyKnowledgeService {
  if (!knowledgeServiceInstance) {
    knowledgeServiceInstance = new DifyKnowledgeService();
  }
  return knowledgeServiceInstance;
}

// ============================================================================
// MERIDIAN CONFIGURATION
// ============================================================================

/**
 * 六脉配置
 * 每个脉络对应一个 Dify 数据集 ID
 * 后续可以从环境变量或数据库中动态读取
 */
export const MERIDIAN_CONFIG: MeridianConfig[] = [
  {
    type: "tian",
    name: "天道·战略",
    datasetId: process.env.DIFY_DATASET_TIAN,
  },
  {
    type: "di",
    name: "地利·产品",
    datasetId: process.env.DIFY_DATASET_DI,
  },
  {
    type: "ren",
    name: "人和·模式",
    datasetId: process.env.DIFY_DATASET_REN,
  },
  {
    type: "shen",
    name: "神韵·内容",
    datasetId: process.env.DIFY_DATASET_SHEN,
  },
  {
    type: "cai",
    name: "财库·成交",
    datasetId: process.env.DIFY_DATASET_CAI,
  },
  {
    type: "fa",
    name: "法度·管理",
    datasetId: process.env.DIFY_DATASET_FA,
  },
];

/**
 * 根据脉络类型获取数据集 ID
 */
export function getDatasetIdsByMeridians(meridianTypes: string[]): string[] {
  return meridianTypes
    .map((type) => MERIDIAN_CONFIG.find((m) => m.type === type))
    .filter((config): config is MeridianConfig => !!config && !!config.datasetId)
    .map((config) => config.datasetId!);
}

/**
 * 获取所有配置的数据集 ID
 */
export function getAllDatasetIds(): string[] {
  return MERIDIAN_CONFIG.filter((config) => !!config.datasetId).map((config) => config.datasetId!);
}
