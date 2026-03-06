/**
 * useStreaming Hook
 * 封装流式响应处理逻辑，提供统一的流式数据管理
 */

"use client";

import { useState, useCallback } from "react";

interface UseStreamingReturn {
  content: string;
  isStreaming: boolean;
  error: string | null;
  startStreaming: (responsePromise: Promise<Response>) => Promise<void>;
  reset: () => void;
}

/**
 * 流式响应 Hook
 * 处理来自 Server Actions 的流式响应
 *
 * @example
 * ```tsx
 * const { content, isStreaming, startStreaming } = useStreaming();
 *
 * const handleGenerate = async (data) => {
 *   const response = await streamStrategyResearch(data);
 *   await startStreaming(response);
 * };
 * ```
 */
export function useStreaming(): UseStreamingReturn {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 开始流式读取响应
   * @param responsePromise - 返回 Response 对象的 Promise
   */
  const startStreaming = useCallback(async (responsePromise: Promise<Response>) => {
    setIsStreaming(true);
    setError(null);
    setContent("");

    try {
      const response = await responsePromise;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取 ReadableStream reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      // 逐块读取流式数据
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        setContent(fullContent);
      }
    } catch (err) {
      console.error("Streaming error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setContent(`Error: ${errorMessage}`);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  /**
   * 重置流式状态
   */
  const reset = useCallback(() => {
    setContent("");
    setIsStreaming(false);
    setError(null);
  }, []);

  return {
    content,
    isStreaming,
    error,
    startStreaming,
    reset,
  };
}
