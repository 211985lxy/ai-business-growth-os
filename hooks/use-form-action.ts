/**
 * useFormAction Hook
 * 封装表单提交逻辑，整合认证、流式响应和错误处理
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";
import { useStreaming } from "./use-streaming";

interface UseFormActionOptions<T> {
  /**
   * Server Action 函数
   */
  action: (data: T) => Promise<Response>;

  /**
   * 成功后的回调
   */
  onSuccess?: () => void;

  /**
   * 失败后的回调
   */
  onError?: (error: string) => void;

  /**
   * 是否需要认证
   * @default true
   */
  requireAuth?: boolean;
}

interface UseFormActionReturn<T> {
  isLoading: boolean;
  content: string;
  isStreaming: boolean;
  error: string | null;
  isAuthenticated: boolean | null;
  handleSubmit: (data: T) => Promise<void>;
  clearError: () => void;
}

/**
 * 表单提交 Hook
 * 整合认证检查、流式响应和错误处理
 *
 * @example
 * ```tsx
 * const { handleSubmit, isLoading, content, isStreaming } = useFormAction({
 *   action: streamStrategyResearch,
 *   requireAuth: true,
 * });
 *
 * <StrategyForm onSubmit={handleSubmit} isLoading={isLoading} />
 * <StreamingOutput content={content} isStreaming={isStreaming} />
 * ```
 */
export function useFormAction<T>({
  action,
  onSuccess,
  onError,
  requireAuth = true,
}: UseFormActionOptions<T>): UseFormActionReturn<T> {
  const router = useRouter();
  // 免登录模式下不加载认证状态
  const { isAuthenticated, isLoading: authLoading } = requireAuth
    ? useAuth()
    : { isAuthenticated: true, isLoading: false };
  const { content, isStreaming, error, startStreaming, reset: resetStreaming } = useStreaming();

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(
    async (data: T) => {
      // 认证检查
      if (requireAuth && !isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      setIsLoading(true);
      setSubmitError(null);
      resetStreaming();

      try {
        // 调用 Server Action 并开始流式读取
        const responsePromise = action(data);
        await startStreaming(responsePromise);

        // 成功回调
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error("Form submission error:", err);
        const errorMessage = err instanceof Error ? err.message : "提交失败，请重试";
        setSubmitError(errorMessage);

        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      action,
      isAuthenticated,
      requireAuth,
      router,
      startStreaming,
      onSuccess,
      onError,
      resetStreaming,
    ]
  );

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  return {
    isLoading: isLoading || authLoading,
    content,
    isStreaming,
    error: submitError || error,
    isAuthenticated,
    handleSubmit,
    clearError,
  };
}
