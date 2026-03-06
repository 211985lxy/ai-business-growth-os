/**
 * useApiStreaming Hook
 * Handles streaming responses from API routes (not Server Actions)
 * This avoids serialization issues with Response objects
 */

"use client";

import { useState, useCallback, useRef } from "react";

interface UseApiStreamingReturn {
  content: string;
  isStreaming: boolean;
  isPaused: boolean;
  error: string | null;
  startStreaming: <T>(url: string, data: T) => Promise<void>;
  togglePause: () => void;
  reset: () => void;
}

/**
 * API-based streaming hook
 * Calls API routes directly and handles streaming response
 *
 * @example
 * ```tsx
 * const { content, isStreaming, startStreaming } = useApiStreaming();
 *
 * const handleGenerate = async (data) => {
 *   await startStreaming('/api/strategy', data);
 * };
 * ```
 */
export function useApiStreaming(): UseApiStreamingReturn {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pauseRef = useRef(false);

  /**
   * Start streaming from API route
   * @param url - API route URL
   * @param data - Request body data
   */
  const startStreaming = useCallback(async <T>(url: string, data: T) => {
    setIsStreaming(true);
    setError(null);
    setContent("");

    console.warn("🚀 Starting API streaming:", url, data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.warn("📡 Response received:", response.status, response.statusText);

      if (!response.ok) {
        // Try to parse error JSON, but fall back to status text if body is empty
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Response body is empty or not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get ReadableStream reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      console.warn("📖 Starting to read stream...");
      console.warn("🔍 Response headers:", Object.fromEntries(response.headers.entries()));

      // Read stream chunks
      while (true) {
        // Check if paused and wait
        while (pauseRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const { done, value } = await reader.read();

        if (done) {
          console.warn("✅ Stream reading complete. Total length:", fullContent.length);
          if (fullContent.length === 0) {
            console.warn("⚠️ WARNING: Stream completed but received 0 bytes!");
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.warn(
          "📦 Received chunk, length:",
          chunk.length,
          "content:",
          chunk.substring(0, 100)
        );
        fullContent += chunk;
        setContent(fullContent);
      }
    } catch (err) {
      console.error("❌ Streaming error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setContent(`Error: ${errorMessage}`);
    } finally {
      setIsStreaming(false);
      console.warn("🏁 Streaming finished");
    }
  }, []);

  /**
   * Reset streaming state
   */
  const reset = useCallback(() => {
    setContent("");
    setIsStreaming(false);
    setIsPaused(false);
    pauseRef.current = false;
    setError(null);
  }, []);

  /**
   * Toggle pause/resume streaming
   */
  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const newPaused = !prev;
      pauseRef.current = newPaused;
      return newPaused;
    });
  }, []);

  return {
    content,
    isStreaming,
    isPaused,
    error,
    startStreaming,
    togglePause,
    reset,
  };
}
