/**
 * Workplace API Usage Examples
 * 统一工作空间 API 使用示例
 */

import { useApiStreaming } from "@/hooks/use-api-streaming";
import { useState } from "react";

// ================================================
// EXAMPLE 1: 基础用法 - 调用战略智能体
// ================================================

export function StrategyGeneratorExample() {
  const { content, isStreaming, startStreaming, error } = useApiStreaming();

  const handleGenerateStrategy = async () => {
    await startStreaming("/api/workplace", {
      agentType: "strategy",
      query: "生成商业战略报告",
      inputs: {
        niche: "美业培训",
        revenue_goal: "年营收 100 万",
        founder_story: "10年美业行业经验",
        strengths: ["专业团队", "标准化流程", "成功案例"],
      },
    });
  };

  return (
    <div>
      <h1>天道·战略生成器</h1>
      <button onClick={handleGenerateStrategy} disabled={isStreaming}>
        {isStreaming ? "生成中..." : "生成战略"}
      </button>
      {error && <div className="error">{error}</div>}
      {content && <div className="content">{content}</div>}
    </div>
  );
}

// ================================================
// EXAMPLE 2: 上下文注入 - 调用内容智能体
// ================================================

export function ContentGeneratorExample() {
  const { content, isStreaming, startStreaming } = useApiStreaming();

  const handleGenerateContent = async () => {
    // 注意：content 智能体会自动注入最新的战略上下文
    // 所以用户只需要关注内容生成的具体需求
    await startStreaming("/api/workplace", {
      agentType: "content",
      query: "帮我生成一个小红书视频脚本",
      inputs: {
        content_type: "video_script",
        platform: "xiaohongshu",
        duration: "60秒",
      },
    });
  };

  return (
    <div>
      <h1>神韵·内容生成器</h1>
      <button onClick={handleGenerateContent} disabled={isStreaming}>
        生成脚本
      </button>
      {content && <div>{content}</div>}
    </div>
  );
}

// ================================================
// EXAMPLE 3: 多轮对话 - 带会话ID
// ================================================

export function ConversationExample() {
  const { content, isStreaming, startStreaming } = useApiStreaming();
  const [conversationId, setConversationId] = useState<string>();

  const handleFirstMessage = async () => {
    await startStreaming("/api/workplace", {
      agentType: "content",
      query: "帮我分析一下小红书的用户画像",
      inputs: {
        platform: "xiaohongshu",
      },
    });
  };

  const handleFollowUp = async () => {
    await startStreaming("/api/workplace", {
      agentType: "content",
      query: "基于刚才的分析，给我一些内容建议",
      inputs: {
        platform: "xiaohongshu",
      },
      conversation_id: conversationId, // 继续之前的对话
    });
  };

  return (
    <div>
      <h1>多轮对话示例</h1>
      <button onClick={handleFirstMessage}>第一轮对话</button>
      <button onClick={handleFollowUp}>第二轮对话</button>
      {content && <div>{content}</div>}
    </div>
  );
}

// ================================================
// EXAMPLE 4: 完整的工作流 - 战略→内容
// ================================================

export function CompleteWorkflowExample() {
  const { content: strategyContent, startStreaming: generateStrategy } = useApiStreaming();
  const { content: scriptContent, startStreaming: generateScript } = useApiStreaming();

  const handleCompleteWorkflow = async () => {
    // 第一步：生成战略
    await generateStrategy("/api/workplace", {
      agentType: "strategy",
      query: "生成美业培训的商业战略",
      inputs: {
        niche: "美业培训",
        revenue_goal: "年营收 100 万",
      },
    });

    // 第二步：基于战略生成内容
    setTimeout(() => {
      generateScript("/api/workplace", {
        agentType: "content",
        query: "基于刚才的战略，生成小红书脚本",
        inputs: {
          content_type: "video_script",
          platform: "xiaohongshu",
        },
        // 注意：这里会自动注入上一步生成的战略作为上下文
      });
    }, 1000);
  };

  return (
    <div>
      <h1>完整工作流：战略→内容</h1>
      <button onClick={handleCompleteWorkflow}>开始工作流</button>

      <div>
        <h2>战略报告</h2>
        {strategyContent && <div>{strategyContent}</div>}
      </div>

      <div>
        <h2>小红书脚本</h2>
        {scriptContent && <div>{scriptContent}</div>}
      </div>
    </div>
  );
}

// ================================================
// EXAMPLE 5: 错误处理
// ================================================

export function ErrorHandlingExample() {
  const { content, isStreaming, error, startStreaming } = useApiStreaming();

  const handleGenerate = async () => {
    await startStreaming("/api/workplace", {
      agentType: "strategy",
      query: "生成战略",
      inputs: {
        niche: "美业培训",
      },
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isStreaming}>
        生成战略
      </button>

      {/* 积分不足 */}
      {error?.includes("Insufficient credits") && (
        <div className="error">
          <h3>积分不足</h3>
          <p>请充值后继续使用</p>
          <button>前往充值</button>
        </div>
      )}

      {/* 未认证 */}
      {error?.includes("Unauthorized") && (
        <div className="error">
          <h3>请先登录</h3>
          <button>登录</button>
        </div>
      )}

      {/* 其他错误 */}
      {error && !error.includes("Insufficient credits") && !error.includes("Unauthorized") && (
        <div className="error">
          <h3>生成失败</h3>
          <p>{error}</p>
        </div>
      )}

      {content && <div>{content}</div>}
    </div>
  );
}

// ================================================
// EXAMPLE 6: React Hook 封装
// ================================================

/**
 * 自定义 Hook：专门用于调用战略智能体
 */
export function useStrategyGenerator() {
  const { content, isStreaming, error, startStreaming, reset } = useApiStreaming();

  const generate = async (params: {
    niche: string;
    revenueGoal?: string;
    founderStory?: string;
    strengths?: string[];
  }) => {
    await startStreaming("/api/workplace", {
      agentType: "strategy",
      query: "生成战略报告",
      inputs: params,
    });
  };

  return {
    strategy: content,
    isGenerating: isStreaming,
    error,
    generate,
    reset,
  };
}

/**
 * 自定义 Hook：专门用于调用内容智能体
 */
export function useContentGenerator() {
  const { content, isStreaming, error, startStreaming, reset } = useApiStreaming();

  const generate = async (params: {
    contentType: string;
    platform: string;
    query: string;
    conversationId?: string;
  }) => {
    await startStreaming("/api/workplace", {
      agentType: "content",
      query: params.query,
      inputs: {
        content_type: params.contentType,
        platform: params.platform,
      },
      conversation_id: params.conversationId,
    });
  };

  return {
    content: content,
    isGenerating: isStreaming,
    error,
    generate,
    reset,
  };
}

// ================================================
// 使用自定义 Hook 的示例
// ================================================

export function CustomHookExample() {
  const { strategy, isGenerating, generate } = useStrategyGenerator();

  const handleGenerate = () => {
    generate({
      niche: "美业培训",
      revenueGoal: "年营收 100 万",
      founderStory: "10年经验",
      strengths: ["专业", "标准化"],
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isGenerating}>
        生成战略
      </button>
      {strategy && <div>{strategy}</div>}
    </div>
  );
}
