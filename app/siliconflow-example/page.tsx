/**
 * SiliconFlow Chat Example
 * 演示如何使用 SiliconFlow API
 */

"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";

export default function SiliconFlowExample() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "system", content: "你是一个有用的助手，擅长回答各种问题。" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [selectedModel, setSelectedModel] = useState("Pro/deepseek-ai/DeepSeek-R1");

  // 可用模型列表
  const models = [
    { id: "Pro/deepseek-ai/DeepSeek-R1", name: "DeepSeek-R1", category: "推理" },
    { id: "Pro/deepseek-ai/DeepSeek-V3", name: "DeepSeek-V3", category: "对话" },
    { id: "MiniMax/MiniMax-M2.5", name: "MiniMax M2.5", category: "情感" },
    { id: "MiniMax/MiniMax-M2.1", name: "MiniMax M2.1", category: "对话" },
    { id: "MiniMax/MiniMax-M2", name: "MiniMax M2", category: "稳定" },
    { id: "Qwen/Qwen3-72B-Instruct", name: "Qwen3-72B", category: "通用" },
    { id: "Pro/zai-org/GLM-4.7", name: "GLM-4.7", category: "对话" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamContent("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          model: selectedModel,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          assistantContent += text;
          setStreamContent(assistantContent);
        }
      }

      setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      setStreamContent("");
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: `错误: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">SiliconFlow Chat 示例</h1>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">选择模型进行对话测试</p>

          {/* Model Selector */}
          <div className="flex items-center justify-center gap-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">模型:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isLoading}
              className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4 max-h-125 overflow-y-auto">
          {messages.slice(1).map((msg, idx) => (
            <div key={idx} className={`mb-4 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Streaming Content */}
          {streamContent && (
            <div className="mb-4 text-left">
              <div className="inline-block max-w-[80%] px-4 py-2 rounded-lg bg-zinc-100 text-zinc-800 dark:text-zinc-100">
                <p className="whitespace-pre-wrap">{streamContent}</p>
                <span className="inline-block w-2 h-4 bg-indigo-600 animate-pulse ml-1" />
              </div>
            </div>
          )}

          {isLoading && !streamContent && (
            <div className="text-center text-zinc-500 dark:text-zinc-400">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>思考中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
                  发送中
                </>
              ) : (
                <>
                  <MaterialIcon icon="send" size={18} />
                  发送
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>支持模型：DeepSeek-R1, GLM-4, Qwen3 等</p>
          <p className="mt-1">
            API 文档：
            <a
              href="https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline ml-1"
            >
              SiliconFlow Docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
