# Soul Injection 集成指南

本文档说明如何将 Soul Injection 组件集成到现有页面中。

---

## 1. 集成到 /strategy 页面

### 步骤 1: 添加导入

在 `app/strategy/page.tsx` 顶部添加导入：

```typescript
import {
  SoulInjectionBar,
  MeridianSelector,
  KnowledgeRetrievalIndicator,
} from "@/components/soul";
```

### 步骤 2: 添加状态

在组件内添加状态变量：

```typescript
const [selectedMeridians, setSelectedMeridians] = useState<string[]>([]);
const [isRetrieving, setIsRetrieving] = useState(false);
const [knowledgeStats, setKnowledgeStats] = useState({
  activeFileCount: 0,
  totalFileCount: 0,
});
```

### 步骤 3: 加载知识库统计

添加加载函数：

```typescript
useEffect(() => {
  const loadKnowledgeStats = async () => {
    try {
      const response = await fetch('/api/knowledge/sync-status?user_id=YOUR_USER_ID');
      const data = await response.json();
      setKnowledgeStats({
        activeFileCount: data.indexedFiles,
        totalFileCount: data.totalFiles,
      });
    } catch (error) {
      console.error('加载知识库统计失败:', error);
    }
  };
  loadKnowledgeStats();
}, []);
```

### 步骤 4: 在输入区添加 Soul Injection 组件

在输入区的 `<form>` 之前添加：

```tsx
{/* 灵魂注入状态栏 */}
<SoulInjectionBar
  companyName="您的企业"
  activeFileCount={knowledgeStats.activeFileCount}
  totalFileCount={knowledgeStats.totalFileCount}
  version="v2.1"
/>

{/* 脉络选择器 */}
<div className="space-y-2 mb-4">
  <label className="text-xs font-medium text-slate-700">
    参考脉络（可选）
  </label>
  <MeridianSelector
    selectedMeridians={selectedMeridians}
    onChange={setSelectedMeridians}
  />
</div>

{/* 检索指示器 */}
{isRetrieving && <KnowledgeRetrievalIndicator isRetrieving />}
```

### 步骤 5: 在输入框聚焦时触发检索

修改 `<textarea>` 的 `onFocus` 和 `onBlur`：

```tsx
<textarea
  ref={textareaRef}
  placeholder="..."
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  onFocus={() => setIsRetrieving(true)}
  onBlur={() => setIsRetrieving(false)}
  disabled={isLoading}
  rows={6}
  className="..."
/>
```

### 步骤 6: 提交时包含脉络信息

修改 `handleSubmit` 函数：

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!question.trim()) return;

  setIsLoading(true);

  try {
    await startStreaming("/api/strategy", {
      niche: question,
      revenueGoal: advancedParams.revenueGoal || undefined,
      founderStory: advancedParams.founderStory || undefined,
      strengths: advancedParams.strengths || undefined,
      meridians: selectedMeridians, // 添加脉络信息
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

## 2. 集成到 StreamingOutputCanvas

### 步骤 1: 添加导入

在 `components/business/streaming-output-canvas.tsx` 添加导入：

```typescript
import {
  CitationBadge,
  CitationCard,
  SoulConsistencyScore,
} from "@/components/soul";
```

### 步骤 2: 添加状态

```typescript
const [activeCitation, setActiveCitation] = useState<number | null>(null);
const [consistencyScore, setConsistencyScore] = useState<number>(0);
```

### 步骤 3: 添加一致性评分

在输出内容顶部添加：

```tsx
{/* 灵魂一致性评分 */}
<div className="mb-4">
  <SoulConsistencyScore
    score={consistencyScore}
    showLabel={false}
  />
</div>
```

### 步骤 4: 处理引用标记

在渲染内容时，将 `[1]`、`[2]` 等引用标记转换为 `CitationBadge`：

```tsx
const renderContentWithCitations = (text: string) => {
  // 将 [1], [2] 等引用标记转换为可点击的徽章
  const parts = text.split(/(\[\d+\])/g);

  return parts.map((part, index) => {
    const citationMatch = part.match(/\[(\d+)\]/);
    if (citationMatch) {
      const citationNum = parseInt(citationMatch[1], 10);
      return (
        <CitationBadge
          key={`citation-${index}`}
          number={citationNum}
          onClick={() => setActiveCitation(citationNum)}
        />
      );
    }
    return part;
  });
};
```

### 步骤 5: 添加引用卡片

在输出内容底部添加：

```tsx
{/* 引用卡片 */}
{activeCitation && (
  <CitationCard
    number={activeCitation}
    fileName="示例文件.pdf"
    page={12}
    content="这里展示引用的具体内容..."
    confidence={0.95}
    isOpen={true}
    onClose={() => setActiveCitation(null)}
    className="mt-6"
  />
)}
```

### 步骤 6: 从 API 获取引用数据

修改组件 Props：

```typescript
interface StreamingOutputCanvasProps {
  content: string;
  isStreaming: boolean;
  citations?: Array<{
    number: number;
    fileName: string;
    page: number;
    content: string;
    confidence: number;
  }>;
  consistencyScore?: number;
}
```

---

## 3. 添加文件拖拽上传功能

### 创建拖拽上传组件

```typescript
// components/knowledge/dropzone-upload.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export function DropzoneUpload({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-4">📁</div>
      <p className="text-sm text-gray-600">
        {isDragActive ? '释放文件以上传' : '拖拽文件到此处，或点击选择'}
      </p>
      <p className="text-xs text-gray-400 mt-2">
        支持 PDF、Word、TXT、MD 格式
      </p>
    </div>
  );
}
```

### 安装依赖

```bash
npm install react-dropzone
```

### 在知识库页面使用

```tsx
import { DropzoneUpload } from "@/components/knowledge/dropzone-upload";

// 替换原有的 Input 组件
<DropzoneUpload onUpload={handleFileSelect} />
```

---

## 4. 实时同步状态更新

### 创建 WebSocket Hook

```typescript
// hooks/use-websocket.ts
import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const reconnectTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
      // 重连逻辑
      reconnectTimer.current = setTimeout(() => {
        setSocket(new WebSocket(url));
      }, 3000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      ws.close();
    };
  }, [url]);

  const sendMessage = (message: any) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message));
    }
  };

  return { socket, connected, lastMessage, sendMessage };
}
```

### 在知识库页面使用

```tsx
import { useWebSocket } from "@/hooks/use-websocket";

const { connected, lastMessage } = useWebSocket(
  `ws://localhost:3000/ws/sync-status?user_id=${userId}`
);

useEffect(() => {
  if (lastMessage) {
    // 更新同步状态
    setSyncStatus(lastMessage.status);
    setSyncProgress(lastMessage.progress);
  }
}, [lastMessage]);
```

---

## 5. 文件预览功能

### 创建文件预览组件

```typescript
// components/knowledge/file-preview.tsx
"use client";

import { useState } from "react";

export function FilePreview({
  fileId,
  fileName,
  fileType
}: {
  fileId: string;
  fileName: string;
  fileType: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-sm">无法预览此文件</p>
        </div>
      );
    }

    if (fileType === 'application/pdf') {
      return (
        <iframe
          src={`/api/knowledge/preview/${fileId}`}
          className="w-full h-96 border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      );
    }

    if (fileType.startsWith('text/') || fileType === 'text/markdown') {
      // 对于文本文件，使用 API 获取内容
      return (
        <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
          <FileContentLoader fileId={fileId} />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="text-4xl mb-4">📄</div>
        <p className="text-sm">暂不支持预览此格式</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{fileName}</h3>
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {renderPreview()}
    </div>
  );
}

function FileContentLoader({ fileId }: { fileId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/knowledge/content/${fileId}`)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fileId]);

  if (loading) {
    return <div className="text-sm text-gray-400">加载中...</div>;
  }

  return <pre className="text-sm whitespace-pre-wrap">{content}</pre>;
}
```

### 创建文件预览 API

```typescript
// app/api/knowledge/preview/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // 从数据库获取文件信息
    const { data: file, error } = await supabase
      .from("knowledge_files")
      .select("file_path, file_type")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 返回文件流
    const { data, error: storageError } = await supabase.storage
      .from("knowledge-files")
      .download(file.file_path);

    if (storageError) {
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: 500 }
      );
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": file.file_type,
        "Content-Disposition": `inline; filename="${file.file_path}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 完整集成示例

查看 `docs/SOUL_INTEGRATION_EXAMPLE.tsx` 获取完整的集成示例代码。

---

## 故障排除

### 1. 组件样式问题
- 确保使用 Tailwind CSS v4
- 检查 className 的拼写和格式

### 2. API 调用失败
- 检查环境变量配置
- 确认 Supabase 权限设置
- 查看浏览器控制台错误

### 3. WebSocket 连接失败
- 确认 WebSocket 服务已启动
- 检查防火墙设置
- 验证 WebSocket URL 格式

---

## 下一步

1. 运行数据库迁移
2. 测试组件集成
3. 优化性能和用户体验
4. 添加错误处理和加载状态
