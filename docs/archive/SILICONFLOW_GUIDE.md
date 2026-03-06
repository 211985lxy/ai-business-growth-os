# SiliconFlow 集成指南

## 概述

SiliconFlow 提供与 OpenAI 兼容的大模型 API，支持多种模型：
- **DeepSeek-R1**: 强大的推理模型
- **GLM-4.7**: 智谱AI的对话模型
- **Qwen3**: 通义千问系列
- 更多模型请查看: https://cloud.siliconflow.cn/models

## 快速开始

### 1. 获取 API Key

访问 https://cloud.siliconflow.cn/account/ak 注册并获取 API Key

### 2. 配置环境变量

在 `.env.local` 文件中添加：

```bash
SILICONFLOW_API_KEY=your_api_key_here
```

### 3. 使用方法

#### 方式一：直接调用 API 路由

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "你是一个有用的助手" },
      { role: "user", content: "你好，请介绍一下你自己" }
    ],
    model: "Pro/deepseek-ai/DeepSeek-R1",
    temperature: 0.7,
  }),
});

// 流式读取响应
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const text = decoder.decode(value, { stream: true });
  console.log(text);
}
```

#### 方式二：使用客户端类

```typescript
import { SiliconFlowClient } from "@/lib/siliconflow/client";

const client = new SiliconFlowClient();

// 流式调用
const stream = await client.createChatStream({
  model: "Pro/deepseek-ai/DeepSeek-R1",
  messages: [
    { role: "system", content: "你是一个有用的助手" },
    { role: "user", content: "你好" }
  ],
});

for await (const chunk of client.processStream(stream)) {
  console.log(chunk);
}
```

## 支持的模型

### 🗣️ 语言模型

| 模型 | 模型ID | 特点 |
|------|--------|------|
| DeepSeek-R1 | `Pro/deepseek-ai/DeepSeek-R1` | 推理能力强，免费热门 |
| DeepSeek-V3 | `Pro/deepseek-ai/DeepSeek-V3` | 多任务全能 |
| MiniMax M2.5 | `MiniMax/MiniMax-M2.5` | 对话优秀，情感理解强 |
| MiniMax M2.1 | `MiniMax/MiniMax-M2.1` | 高性价比 |
| MiniMax M2 | `MiniMax/MiniMax-M2` | 稳定版本 |
| QwQ-32B | `Qwen/QwQ-32B-Preview` | 阿里系开源，长上下文 |
| GLM-4-9B | `THUDM/glm-4-9b-chat` | 清华智谱，轻量高效 |
| Qwen3-72B | `Qwen/Qwen3-72B-Instruct` | 通用性强，响应快 |

### 🎨 图片生成

| 模型 | 模型ID | 特点 |
|------|--------|------|
| Kolors | `black-forest-labs/FLUX.1-schnell` | 快速生图 |
| Kolors | `Pro/Kolors` | 国产最强生图 |

### 🎬 视频生成

| 模型 | 模型ID | 特点 |
|------|--------|------|
| HunyuanVideo-HD | `tencent/HunyuanVideo-HD` | 腾讯混元高清 |
| Wan2.1-I2V | `Wanx/Wan2.1-I2V` | 图生视频 |
| Wan2.1-T2V | `Wanx/Wan2.1-T2V` | 文生视频 |

### 🎙️ 语音

| 模型 | 模型ID | 特点 |
|------|--------|------|
| CosyVoice2-0.5B | `fishaudio/fish-speech-1.5` | 语音合成 |

### 推荐场景

- **写代码**：DeepSeek-R1
- **对话聊天**：MiniMax M2.5 / DeepSeek-V3
- **情感理解**：MiniMax M2.5
- **生图**：Kolors / FLUX.1
- **视频**：HunyuanVideo-HD

### 使用不同模型

```typescript
// DeepSeek-R1 (推荐)
const model = "Pro/deepseek-ai/DeepSeek-R1";

// GLM-4.7
const model = "Pro/zai-org/GLM-4.7";

// Qwen3-72B
const model = "Qwen/Qwen3-72B-Instruct";
```

## API 参数

### 请求参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| model | string | ✅ | - | 模型ID |
| messages | array | ✅ | - | 对话消息数组 |
| stream | boolean | ❌ | false | 是否流式输出 |
| temperature | number | ❌ | 0.7 | 控制随机性 (0-1) |
| top_p | number | ❌ | 0.7 | 核采样参数 |
| max_tokens | number | ❌ | - | 最大输出token数 |
| stop | string/array | ❌ | - | 停止序列 |

### 消息格式

```typescript
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
```

## 示例页面

访问 `/siliconflow-example` 查看完整的使用示例：

```bash
# 启动开发服务器
npm run dev

# 访问示例页面
open http://localhost:3000/siliconflow-example
```

## 常见问题

### Q: 如何查看正在使用的模型？

查看开发服务器日志，每次请求都会输出模型信息：

```bash
[SiliconFlow Chat] Request received with 2 messages
[SiliconFlow Chat] 🤖 Using model: MiniMax/MiniMax-M2.5
[SiliconFlow Chat] 📊 Temperature: 0.7, Max tokens: 4096
```

### Q: 如何切换模型？

修改 API 请求中的 `model` 参数：

```typescript
{
  model: "Pro/deepseek-ai/DeepSeek-R1",  // 切换到其他模型
  messages: [...]
}
```

### Q: 支持流式输出吗？

是的，默认使用流式输出，实时返回生成内容。

### Q: 如何计费？

SiliconFlow 按实际使用token计费，详情请查看：
https://cloud.siliconflow.cn/price

### Q: 与 Dify 的区别？

- **SiliconFlow**: 直接调用大模型，适合简单的对话场景
- **Dify**: 工作流平台，适合复杂的业务逻辑和多步骤任务

## 相关链接

- 官方文档: https://docs.siliconflow.cn
- 模型列表: https://cloud.siliconflow.cn/models
- 控制台: https://cloud.siliconflow.cn
- 价格: https://cloud.siliconflow.cn/price

## 代码结构

```
lib/siliconflow/
├── client.ts          # SiliconFlow 客户端类
app/api/chat/
├── route.ts           # API 路由
app/siliconflow-example/
└── page.tsx           # 使用示例页面
```
